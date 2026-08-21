"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./VantaNet.css";

/**
 * NET, from Vanta.js (vantajs.com) — ported to TypeScript and to this project's
 * copy of three.
 *
 * A lattice of dots drifting in a slow carousel around the vertical axis, with
 * a line drawn between any two that come within `maxDistance` of each other and
 * faded out as they separate. Nothing is pre-baked: the connections are
 * recomputed every frame, which is what makes the mesh open and close instead
 * of merely rotating.
 *
 * It is a port rather than the package because the package cannot run here:
 *
 *   1. Vanta reaches for `window.THREE`, and is written against r134. This
 *      project is on three 0.185, where `THREE.VertexColors` no longer exists —
 *      so `vertexColors: THREE.VertexColors` reads as undefined, the per-line
 *      colours computed below are ignored, and the whole net comes out flat
 *      white with no distance fade. Its other branch passes `blending: null`,
 *      which is not a value three's state cache accepts at all.
 *
 *   2. It ships as CoffeeScript compiled to ES5 with no types, and its base
 *      class runs its own rAF loop for as long as the page is open, binds
 *      window listeners it never scopes, and rewrites the `position` and
 *      `z-index` of every child of its host element on the way in.
 *
 * What the port keeps is the part worth keeping — the point layout, the
 * carousel, the distance fade and the camera — down to the same constants, so
 * it reads as the effect people know from vantajs.com. It also keeps the
 * colour space upstream works in, which is not a detail: see the long note at
 * the renderer below for why the same arithmetic in three's modern one comes
 * out as a haze rather than as a net. What it changes:
 *
 *   - Dots are one InstancedMesh rather than one Mesh each: 242 spheres at the
 *     default settings is 242 draw calls a frame upstream, and one here.
 *     They are unlit, too. Upstream lights Lambert spheres with an ambient and
 *     a spot, which after three's move to physical light units is an awkward
 *     thing to keep looking the same; a dot two pixels across is a dot.
 *   - No allocation in the frame loop. Upstream builds two `THREE.Color`
 *     objects per connected pair — thousands of objects a frame, all garbage —
 *     where the same arithmetic can be written straight into the buffer.
 *   - Distances are compared squared, and the square root is only taken for the
 *     pairs that turn out to be connected.
 *   - It stops when nobody is watching: one static frame under
 *     prefers-reduced-motion, and the loop is parked while the canvas is
 *     scrolled out of view or the tab is in the background. Same arrangement as
 *     DarkVeil, and for the same reason — this sits behind the top of a page
 *     that goes on for several screens.
 *   - Setup is guarded and the context is released on unmount, so a machine
 *     without WebGL gets the background colour behind it rather than a crashed
 *     page.
 */

/** Random float in [start, end). */
const rn = (start: number, end: number) => start + Math.random() * (end - start);

/** Random integer in [start, end], both ends included. */
const ri = (start: number, end: number) =>
  Math.floor(start + Math.random() * (end - start + 1));

/**
 * Where the camera sits before the pointer moves it, and what it looks at.
 *
 * High, off to one side, and on a 25° lens — a long lens far away, which is
 * what keeps the lattice from splaying out in perspective at the edges of a
 * wide screen.
 */
const CAM = { x: 50, y: 100, z: 150, fov: 25 };

/** How far the camera closes toward the pointer's target each 60Hz frame. */
const CAM_SMOOTHING = 0.02;

/** Radians of carousel per 60Hz frame, before each point's own rate. */
const SPIN = 0.00025;

/**
 * Ceiling on the line buffer, in vertex pairs.
 *
 * The exact worst case is every point connected to every other, which grows
 * with the square of the point count: fine at the defaults (~29k pairs, 1.4MB
 * of buffers), 18MB by the time someone types `points={20}`. In practice a
 * frame connects a small fraction of that, so this caps what is reserved and
 * the builder stops when it runs out rather than writing off the end.
 */
const MAX_LINES = 120000;

export type VantaNetProps = {
  /** The dots and the lines. */
  color?: THREE.ColorRepresentation;
  /** Painted behind them, and the colour the fading lines fade towards. */
  backgroundColor?: THREE.ColorRepresentation;
  /**
   * 0 leaves the canvas transparent and shows whatever is behind the element.
   * Whether the context has an alpha channel at all is decided when it is
   * created, so this one is only live in the direction of more opaque.
   */
  backgroundAlpha?: number;
  /** Lattice size. The mesh ends up with (points + 1)² × 2 dots in it. */
  points?: number;
  /** How close two dots must come, in world units, before a line is drawn. */
  maxDistance?: number;
  /** World units between lattice columns. */
  spacing?: number;
  /** Draw the dots themselves, or only the lines between them. */
  showDots?: boolean;
  /** Multiplier on the carousel. 0 holds the lattice still. */
  speed?: number;
  /** Let the pointer swing the camera. */
  mouseControls?: boolean;
  /** How far the pointer swings it. 0 pins the camera at CAM. */
  mouseCoeff?: number;
  /** Device pixel ratio to render at. Defaults to the display's, capped at 2. */
  pixelRatio?: number;
  className?: string;
};

export function VantaNet({
  color = "#ff3f81",
  backgroundColor = "#23153c",
  backgroundAlpha = 1,
  points = 10,
  maxDistance = 20,
  spacing = 15,
  showDots = true,
  speed = 1,
  mouseControls = true,
  mouseCoeff = 1,
  pixelRatio,
  className = "",
}: VantaNetProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Live values, read inside the loop. Held in a ref so a re-render cannot tear
  // down and rebuild the WebGL context. The four structural props — the ones
  // the lattice itself is built from — are in the effect's dependency list
  // instead, since changing those means rebuilding the geometry anyway.
  const propsRef = useRef({
    color,
    backgroundColor,
    backgroundAlpha,
    maxDistance,
    speed,
    mouseCoeff,
  });

  // No dependency array: this should run after every render, and it is declared
  // before the WebGL effect so the values are in place the first time the loop
  // reads them.
  useEffect(() => {
    propsRef.current = {
      color,
      backgroundColor,
      backgroundAlpha,
      maxDistance,
      speed,
      mouseCoeff,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);

    // Upstream's mobile allowance, without the user-agent sniffing: a narrow
    // screen gets fewer points and tighter spacing, because the same lattice on
    // a phone is both a denser picture and a slower one. Measured once, at
    // mount — upstream does not re-lay the lattice on resize either.
    const small = window.innerWidth < 600;
    const n = small ? Math.trunc(points * 0.75) : points;
    const gap = small ? Math.trunc(spacing * 0.65) : spacing;

    let renderer: THREE.WebGLRenderer;
    let canvas: HTMLCanvasElement;
    try {
      canvas = document.createElement("canvas");
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: backgroundAlpha < 1,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(dpr);

      /* --- Colour space ---------------------------------------------------
         This one line is the difference between the effect on vantajs.com and
         a dimmer, hazier version of it, and it is worth the paragraph.

         Vanta is built against three r134, which predates colour management:
         the numbers in a Color are raw framebuffer values, the fades below are
         arithmetic on those raw values, and additive blending happens in the
         same space. three 0.185 converts instead — a Color set from a hex is
         converted sRGB → linear on the way in, and the render is converted
         linear → sRGB on the way out.

         Do the fade in linear and every weak connection comes out far louder
         than upstream draws it, because encoding lifts the bottom of the range
         hard: a line upstream renders at 1% of full is around 10% once
         encoded. The lattice fills up with lines that should have faded to
         nothing, and the near ones lose their contrast against them — the mesh
         reads as a grey haze rather than as bright cyan on dark.

         Rendering in LinearSRGB does not mean "no colour management"; it means
         the output conversion is the identity, so whatever is put into the
         vertex colours and the clear colour lands on screen untouched. Feed it
         raw sRGB (see setRaw below) and every number in this file — the fade,
         the difference between the two colours, the additive blend — is
         evaluated exactly where Vanta evaluates it. Scoped to this renderer,
         so nothing else three draws on the site is affected. */
      renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    } catch {
      // No WebGL — leave the background behind this element showing rather than
      // taking the page down with it.
      return;
    }

    canvas.className = "vanta-net__canvas";
    container.appendChild(canvas);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(CAM.fov, 1, 0.01, 10000);
    camera.position.set(CAM.x, CAM.y, CAM.z);

    /* --- The lattice ------------------------------------------------------
       A grid of columns, each with a low dot and a high one, every coordinate
       jittered. The jitter is the whole point: on an exact grid every pair
       crosses the distance threshold at the same moment and the net flashes on
       and off as a single sheet.
    ---------------------------------------------------------------------- */

    // Flat rather than an array of objects: this is walked twice, in a loop
    // that is the frame's whole cost, and three reads per point out of one
    // contiguous buffer is what keeps that loop honest.
    const count = (n + 1) * (n + 1) * 2;
    const pos = new Float32Array(count * 3);
    /** Each point's own rate of travel around the carousel, and its direction. */
    const rate = new Float32Array(count);

    let p = 0;
    const place = (x: number, y: number, z: number) => {
      pos[p * 3] = x;
      pos[p * 3 + 1] = y;
      pos[p * 3 + 2] = z;
      rate[p] = rn(-2, 2);
      p++;
    };

    for (let i = 0; i <= n; i++) {
      for (let j = 0; j <= n; j++) {
        const y = ri(-3, 3);
        const x = (i - n / 2) * gap + ri(-5, 5);
        // Every other column is pushed half a step along z, so the lattice is
        // staggered rather than square.
        const z = (j - n / 2) * gap + ri(-5, 5) + (i % 2 ? gap * 0.5 : 0);

        place(x, y - ri(5, 15), z);
        place(x + ri(-5, 5), y + ri(5, 15), z + ri(-5, 5));
      }
    }

    /* --- The dots --------------------------------------------------------- */

    let dots: THREE.InstancedMesh | undefined;
    let dotGeometry: THREE.SphereGeometry | undefined;
    let dotMaterial: THREE.MeshBasicMaterial | undefined;
    const dotMatrix = new THREE.Matrix4();

    if (showDots) {
      // Two or three pixels across at this camera distance, so the segment
      // counts are down from upstream's 12 × 12 — there is no silhouette here
      // to be faceted.
      dotGeometry = new THREE.SphereGeometry(0.25, 8, 6);
      dotMaterial = new THREE.MeshBasicMaterial({ color });
      dots = new THREE.InstancedMesh(dotGeometry, dotMaterial, count);
      dots.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
      // Everything moves every frame, so the bounding sphere three would cull
      // against is stale the moment it is computed.
      dots.frustumCulled = false;
      scene.add(dots);
    }

    /* --- The lines --------------------------------------------------------- */

    const maxLines = Math.min((count * (count - 1)) / 2, MAX_LINES);
    const linePositions = new Float32Array(maxLines * 6);
    const lineColors = new Float32Array(maxLines * 6);

    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(linePositions, 3).setUsage(
        THREE.DynamicDrawUsage,
      ),
    );
    lineGeometry.setAttribute(
      "color",
      new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage),
    );
    lineGeometry.setDrawRange(0, 0);

    const lineMaterial = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
    });
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    lines.frustumCulled = false;
    scene.add(lines);

    /* --- Colour ------------------------------------------------------------
       Which way the lines are blended depends on which way round the two
       colours are. Light on dark, they are added to the background, and each
       line carries only its own contribution — the difference between the two
       colours, scaled by how close its pair is. Dark on light, they are drawn
       over it, and each line carries the background lerped toward the colour.

       Either way the line at the far edge of maxDistance is exactly the
       background and the fade has no seam in it.
    ---------------------------------------------------------------------- */

    const col = new THREE.Color();
    const bg = new THREE.Color();
    let additive = true;

    /** Rec. 601 luma, as upstream weighs it. */
    const brightness = (c: THREE.Color) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;

    /**
     * Reads a colour in without converting it.
     *
     * The pair to the LinearSRGB output above: naming the source colour space
     * as the working one is how three is told these numbers are already where
     * they need to be. #3fecff arrives as (0.247, 0.925, 1.0) — the same three
     * numbers Vanta works with — rather than as the linear values a plain
     * `set()` would produce.
     */
    const setRaw = (target: THREE.Color, value: THREE.ColorRepresentation) => {
      if (typeof value === "number") {
        target.setHex(value, THREE.LinearSRGBColorSpace);
      } else if (typeof value === "string") {
        target.setStyle(value, THREE.LinearSRGBColorSpace);
      } else {
        // A Color the caller built themselves is taken as it stands; there is
        // no way to know which space they meant it in.
        target.copy(value);
      }
    };

    const readColors = () => {
      const live = propsRef.current;
      setRaw(col, live.color);
      setRaw(bg, live.backgroundColor);
      additive = brightness(col) > brightness(bg);

      const blending = additive
        ? THREE.AdditiveBlending
        : THREE.NormalBlending;
      if (lineMaterial.blending !== blending) {
        lineMaterial.blending = blending;
        lineMaterial.needsUpdate = true;
      }
      if (dotMaterial && !dotMaterial.color.equals(col)) {
        dotMaterial.color.copy(col);
      }
      renderer.setClearColor(bg, live.backgroundAlpha);
    };

    /* --- The pointer -------------------------------------------------------
       Listened for on the window rather than on the canvas, because the canvas
       is a backdrop with a page on top of it and would never see the move.

       The swing is upstream's, including the part that is not quite an orbit:
       the target x is taken from an angle swept around the origin while z is
       left where it started, so the camera slides across the lattice rather
       than circling it. Circling it properly reads as the whole scene turning,
       which fights the carousel that is already turning.
    ---------------------------------------------------------------------- */

    const home = { ang: Math.atan2(CAM.z, CAM.x), dist: Math.hypot(CAM.x, CAM.z) };
    let targetX = CAM.x;
    let targetY = CAM.y;
    let pointerX = 0;
    let pointerY = 0;
    let pointerSeen = false;

    const aimAt = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      const x = clientX - rect.left;
      const y = clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      pointerX = clientX;
      pointerY = clientY;
      pointerSeen = true;

      const coeff = propsRef.current.mouseCoeff;
      const ang = home.ang + (x / rect.width - 0.5) * 2 * coeff;
      targetX = home.dist * Math.cos(ang);
      targetY = CAM.y + (y / rect.height - 0.5) * 50 * coeff;
      play();
    };

    const onMouseMove = (e: MouseEvent) => aimAt(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) aimAt(e.touches[0].clientX, e.touches[0].clientY);
    };
    // The element moves under a stationary cursor as the page scrolls, so the
    // last known cursor position is worth re-reading against the new rect.
    const onScroll = () => {
      if (pointerSeen) aimAt(pointerX, pointerY);
    };

    /* --- The frame --------------------------------------------------------- */

    const draw = (frames: number) => {
      const live = propsRef.current;
      readColors();

      // Ease the camera toward wherever the pointer left it, at a rate that is
      // the same in wall time on a 60Hz and a 120Hz display.
      const ease = 1 - Math.pow(1 - CAM_SMOOTHING, frames);
      camera.position.x += (targetX - camera.position.x) * ease;
      camera.position.y += (targetY - camera.position.y) * ease;
      camera.lookAt(0, 0, 0);

      // The carousel: every point keeps its radius and its height and is walked
      // around the vertical axis at its own rate, so the lattice shears through
      // itself instead of turning as one piece.
      const step = SPIN * live.speed * frames;
      if (step !== 0) {
        for (let i = 0; i < count; i++) {
          const r = rate[i];
          if (r === 0) continue;
          const x = pos[i * 3];
          const z = pos[i * 3 + 2];
          const ang = Math.atan2(z, x) + step * r;
          const dist = Math.sqrt(x * x + z * z);
          pos[i * 3] = dist * Math.cos(ang);
          pos[i * 3 + 2] = dist * Math.sin(ang);
        }
      }

      if (dots) {
        for (let i = 0; i < count; i++) {
          dotMatrix.makeTranslation(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]);
          dots.setMatrixAt(i, dotMatrix);
        }
        dots.instanceMatrix.needsUpdate = true;
      }

      // Rebuild the connections. This is the frame's real work — every pair of
      // points, once — so it is written flat: squared distances, no square root
      // until a pair is known to be within range, and no allocation at all.
      const max = live.maxDistance;
      const maxSq = max * max;
      const dr = col.r - bg.r;
      const dg = col.g - bg.g;
      const db = col.b - bg.b;

      let v = 0;
      let c = 0;
      let drawn = 0;

      outer: for (let i = 0; i < count; i++) {
        const ax = pos[i * 3];
        const ay = pos[i * 3 + 1];
        const az = pos[i * 3 + 2];

        for (let j = i + 1; j < count; j++) {
          const dx = ax - pos[j * 3];
          const dy = ay - pos[j * 3 + 1];
          const dz = az - pos[j * 3 + 2];
          const sq = dx * dx + dy * dy + dz * dz;
          if (sq >= maxSq) continue;

          // Full strength until halfway to the threshold, then a linear fade to
          // nothing at it.
          const dist = Math.sqrt(sq);
          const alpha = Math.min(1, (1 - dist / max) * 2);

          // Additive draws the difference on top of the background; over the
          // top, the background already lerped toward the colour.
          const r = additive ? dr * alpha : bg.r + dr * alpha;
          const g = additive ? dg * alpha : bg.g + dg * alpha;
          const b = additive ? db * alpha : bg.b + db * alpha;

          linePositions[v++] = ax;
          linePositions[v++] = ay;
          linePositions[v++] = az;
          linePositions[v++] = pos[j * 3];
          linePositions[v++] = pos[j * 3 + 1];
          linePositions[v++] = pos[j * 3 + 2];

          lineColors[c++] = r;
          lineColors[c++] = g;
          lineColors[c++] = b;
          lineColors[c++] = r;
          lineColors[c++] = g;
          lineColors[c++] = b;

          if (++drawn === maxLines) break outer;
        }
      }

      lineGeometry.setDrawRange(0, drawn * 2);
      lineGeometry.attributes.position.needsUpdate = true;
      lineGeometry.attributes.color.needsUpdate = true;

      renderer.render(scene, camera);
    };

    /* --- Running it -------------------------------------------------------- */

    let raf = 0;
    let previous = 0;

    const loop = (now: number) => {
      // Time in 60Hz frames, so the carousel travels the same distance a second
      // whatever the display refreshes at. Capped, or a tab returning from the
      // background resumes with one enormous delta and the lattice jumps.
      const frames = previous ? Math.min((now - previous) / 16.667, 4) : 1;
      previous = now;
      draw(frames);
      raf = requestAnimationFrame(loop);
    };

    function play() {
      if (raf || still || document.hidden) return;
      previous = 0;
      raf = requestAnimationFrame(loop);
    }

    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
      previous = 0;
    };

    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      // The third argument is what keeps setSize from writing the buffer size
      // onto the element as an inline style, which would beat the stylesheet
      // and pin the canvas to whatever size it was first measured at.
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      if (!raf) draw(0);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // Out of view is the common case: this sits behind the top of the page and
    // stays mounted for the whole visit.
    let visible = true;
    let io: IntersectionObserver | undefined;
    if (typeof IntersectionObserver === "undefined") {
      play();
    } else {
      io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            visible = entry.isIntersecting;
            if (visible) play();
            else pause();
          }
        },
        { rootMargin: "120px" },
      );
      io.observe(container);
    }

    const onVisibilityChange = () => {
      if (document.hidden) pause();
      else if (visible) play();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    if (mouseControls && !still) {
      window.addEventListener("mousemove", onMouseMove, { passive: true });
      window.addEventListener("touchmove", onTouchMove, { passive: true });
      window.addEventListener("scroll", onScroll, { passive: true });
    }

    return () => {
      pause();
      io?.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("scroll", onScroll);
      dots?.dispose();
      dotGeometry?.dispose();
      dotMaterial?.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
    // Colours and the rest are read through propsRef; these four are what the
    // lattice is built out of, so changing one has to rebuild it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [points, spacing, showDots, pixelRatio, mouseControls]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`vanta-net${className ? ` ${className}` : ""}`}
    />
  );
}
