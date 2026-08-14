"use client";

import { Camera, Geometry, Mesh, Program, Renderer } from "ogl";
import { useEffect, useMemo, useRef } from "react";
import "./Particles.css";

/**
 * Particles, from React Bits — ported to TypeScript.
 *
 * A cloud of GL points scattered through a sphere, each drifting on its own
 * phase, the whole cloud turning slowly and leaning away from the pointer.
 *
 * The shaders are upstream's, unchanged. The wrapper is not, and the changes
 * are the ones the SideRays and Galaxy ports needed, plus two that are specific
 * to this component:
 *
 *   1. It rebuilds only when the cloud itself changes. Upstream lists eleven
 *      props in its dependency array, so changing the speed or the camera
 *      distance throws away the GL context, both shaders and every buffer and
 *      builds them again. Only three things here actually require new buffers —
 *      how many points there are, what colours they are drawn from, and the
 *      pixel ratio the buffer is sized at — so those are the dependencies and
 *      everything else is read through a ref and pushed into the uniforms each
 *      frame.
 *
 *   2. Colour changes take effect. `particleColors` is the one prop upstream
 *      leaves *out* of that dependency array, and it is baked into a buffer at
 *      setup — so it is the single prop that genuinely needs a rebuild and the
 *      single one that never gets it. It is tracked here by value rather than
 *      by array identity, so passing a fresh `["#fff"]` literal every render
 *      does not rebuild, but actually changing a colour does.
 *
 *   3. It stops when nobody is watching: one still frame under
 *      prefers-reduced-motion, and the loop parked while the element is off
 *      screen or the tab is in the background.
 *
 *   4. Elapsed time survives a pause. The loop accumulates its own clock from
 *      frame deltas, so a loop that stops for ten seconds and restarts would
 *      hand the next frame a ten-second delta and jump the whole cloud. The
 *      clock is re-anchored on resume.
 *
 *   5. The pointer is tracked on the window rather than on this element, which
 *      is what lets it work as a backdrop — see the note in Galaxy.
 *
 *   6. ResizeObserver rather than a window resize listener, a device pixel
 *      ratio that defaults to the screen's instead of to 1, a guard around
 *      setup, and the context released on unmount.
 */

const VERT = /* glsl */ `
  attribute vec3 position;
  attribute vec4 random;
  attribute vec3 color;

  uniform mat4 modelMatrix;
  uniform mat4 viewMatrix;
  uniform mat4 projectionMatrix;
  uniform float uTime;
  uniform float uSpread;
  uniform float uBaseSize;
  uniform float uSizeRandomness;

  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vRandom = random;
    vColor = color;

    vec3 pos = position * uSpread;
    pos.z *= 10.0;

    vec4 mPos = modelMatrix * vec4(pos, 1.0);
    float t = uTime;
    mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
    mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
    mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);

    vec4 mvPos = viewMatrix * mPos;

    if (uSizeRandomness == 0.0) {
      gl_PointSize = uBaseSize;
    } else {
      gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
    }

    gl_Position = projectionMatrix * mvPos;
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  uniform float uTime;
  uniform float uAlphaParticles;
  varying vec4 vRandom;
  varying vec3 vColor;

  void main() {
    vec2 uv = gl_PointCoord.xy;
    float d = length(uv - vec2(0.5));

    if(uAlphaParticles < 0.5) {
      if(d > 0.5) {
        discard;
      }
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), 1.0);
    } else {
      float circle = smoothstep(0.5, 0.4, d) * 0.8;
      gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
    }
  }
`;

const DEFAULT_COLORS = ["#ffffff", "#ffffff", "#ffffff"];

function hexToRgb(hex: string): [number, number, number] {
  let value = hex.replace(/^#/, "");
  if (value.length === 3) {
    value = value
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const int = parseInt(value.slice(0, 6), 16);
  return [((int >> 16) & 255) / 255, ((int >> 8) & 255) / 255, (int & 255) / 255];
}

export type ParticlesProps = {
  /** How many points are in the cloud. Changing this rebuilds the buffers. */
  particleCount?: number;
  /** How far the cloud is spread from its centre. */
  particleSpread?: number;
  /** Multiplier on the drift and the rotation. */
  speed?: number;
  /** Hex colours the points are drawn from, at random. */
  particleColors?: string[];
  /** Whether the cloud leans away from the pointer. */
  moveParticlesOnHover?: boolean;
  /** How far it leans, when it does. */
  particleHoverFactor?: number;
  /** Soft-edged translucent points rather than hard discs. */
  alphaParticles?: boolean;
  /** Point size before the per-point variation and the distance divide. */
  particleBaseSize?: number;
  /** How much the sizes vary. 0 draws every point the same size. */
  sizeRandomness?: number;
  /** How far the camera sits from the cloud. */
  cameraDistance?: number;
  /** Stops the cloud turning. Reduced motion stops everything regardless. */
  disableRotation?: boolean;
  /**
   * Buffer scale. Defaults to the screen's, capped at 2 — upstream defaults to
   * 1, which on a retina screen draws visibly soft discs. Read once, at mount.
   */
  pixelRatio?: number;
  className?: string;
};

export function Particles({
  particleCount = 200,
  particleSpread = 10,
  speed = 0.1,
  particleColors,
  moveParticlesOnHover = false,
  particleHoverFactor = 1,
  alphaParticles = false,
  particleBaseSize = 100,
  sizeRandomness = 1,
  cameraDistance = 20,
  disableRotation = false,
  pixelRatio,
  className = "",
}: ParticlesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Tracked by value, not by identity: a caller writing the palette inline
  // hands over a new array every render, and this is a setup dependency.
  const colorKey = particleColors?.join("|") ?? "";
  const palette = useMemo(
    () =>
      particleColors && particleColors.length > 0
        ? particleColors
        : DEFAULT_COLORS,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [colorKey],
  );

  const propsRef = useRef({
    particleSpread,
    speed,
    moveParticlesOnHover,
    particleHoverFactor,
    alphaParticles,
    particleBaseSize,
    sizeRandomness,
    cameraDistance,
    disableRotation,
  });

  // No dependency array: this runs after every render, and it is declared
  // before the WebGL effect so the values are in place the first time the loop
  // reads them.
  useEffect(() => {
    propsRef.current = {
      particleSpread,
      speed,
      moveParticlesOnHover,
      particleHoverFactor,
      alphaParticles,
      particleBaseSize,
      sizeRandomness,
      cameraDistance,
      disableRotation,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);

    let renderer: Renderer;
    let camera: Camera;
    let particles: Mesh;
    let program: Program;
    try {
      // OGL's own canvas, appended here, rather than one rendered by React and
      // handed over: teardown ends with loseContext(), and a lost context stays
      // lost on the element it belonged to.
      renderer = new Renderer({ dpr, depth: false, alpha: true });
      if (!renderer.gl) return;

      const gl = renderer.gl;
      gl.clearColor(0, 0, 0, 0);

      camera = new Camera(gl, { fov: 15 });
      camera.position.set(0, 0, cameraDistance);

      const count = Math.max(1, Math.floor(particleCount));
      const positions = new Float32Array(count * 3);
      const randoms = new Float32Array(count * 4);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        // Rejection-sampled inside the unit sphere, then pushed out by the cube
        // root of a uniform draw, which is what spreads the points evenly
        // through the volume rather than bunching them at the centre.
        let x: number, y: number, z: number, len: number;
        do {
          x = Math.random() * 2 - 1;
          y = Math.random() * 2 - 1;
          z = Math.random() * 2 - 1;
          len = x * x + y * y + z * z;
        } while (len > 1 || len === 0);
        const r = Math.cbrt(Math.random());
        positions.set([x * r, y * r, z * r], i * 3);
        randoms.set(
          [Math.random(), Math.random(), Math.random(), Math.random()],
          i * 4,
        );
        colors.set(
          hexToRgb(palette[Math.floor(Math.random() * palette.length)]),
          i * 3,
        );
      }

      const geometry = new Geometry(gl, {
        position: { size: 3, data: positions },
        random: { size: 4, data: randoms },
        color: { size: 3, data: colors },
      });

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uSpread: { value: particleSpread },
          uBaseSize: { value: particleBaseSize * dpr },
          uSizeRandomness: { value: sizeRandomness },
          uAlphaParticles: { value: alphaParticles ? 1 : 0 },
        },
        transparent: true,
        depthTest: false,
      });

      particles = new Mesh(gl, { mode: gl.POINTS, geometry, program });
    } catch {
      // No WebGL, or a shader that would not compile — leave the background
      // behind this element showing rather than taking the page down with it.
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.className = "particles__canvas";
    container.appendChild(canvas);

    const mouse = { x: 0, y: 0 };
    let raf = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const draw = () => {
      const p = propsRef.current;

      program.uniforms.uTime.value = elapsed * 0.001;
      program.uniforms.uSpread.value = p.particleSpread;
      program.uniforms.uBaseSize.value = p.particleBaseSize * dpr;
      program.uniforms.uSizeRandomness.value = p.sizeRandomness;
      program.uniforms.uAlphaParticles.value = p.alphaParticles ? 1 : 0;
      camera.position.z = p.cameraDistance;

      if (p.moveParticlesOnHover) {
        particles.position.x = -mouse.x * p.particleHoverFactor;
        particles.position.y = -mouse.y * p.particleHoverFactor;
      } else {
        particles.position.x = 0;
        particles.position.y = 0;
      }

      if (!p.disableRotation) {
        particles.rotation.x = Math.sin(elapsed * 0.0002) * 0.1;
        particles.rotation.y = Math.cos(elapsed * 0.0005) * 0.15;
        particles.rotation.z += 0.01 * p.speed;
      }

      renderer.render({ scene: particles, camera });
    };

    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h);
      // setSize writes the buffer size onto the element as an inline style,
      // which beats the stylesheet. Hand the element back to its parent.
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      camera.perspective({ aspect: gl.canvas.width / gl.canvas.height });
      // A still frame is not redrawn by any loop, so it has to be redrawn here
      // or the canvas is blank until something else asks for a frame.
      draw();
    };

    const loop = (t: number) => {
      // The clock is accumulated from deltas rather than read from `t`, because
      // `speed` scales it — so it has to be re-anchored whenever the loop has
      // been parked, or the first frame back advances it by the whole pause.
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * propsRef.current.speed;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (raf || still || document.hidden) return;
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // On the window, not on the container: this element sits behind the content
    // and never receives a pointer event of its own.
    const onPointerMove = (event: PointerEvent) => {
      if (!propsRef.current.moveParticlesOnHover) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

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

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      pause();
      io?.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // Only what the buffers are built from. Everything else is read through
    // propsRef, so changing it never tears the context down.
  }, [particleCount, palette, pixelRatio]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`particles${className ? ` ${className}` : ""}`}
    />
  );
}
