"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import "./Galaxy.css";

/**
 * Galaxy, from React Bits — ported to TypeScript.
 *
 * A drifting star field drawn per pixel by a fragment shader: four parallax
 * layers of procedurally placed stars, each twinkling on its own phase, the
 * whole thing rotating slowly and pushing away from the cursor.
 *
 * The shader is upstream's, unchanged — it is what the component is. The
 * wrapper around it is not, and the differences are the same ones SideRays
 * needed, for the same reasons:
 *
 *   1. The context is built once and kept. Upstream lists all sixteen props in
 *      the effect's dependency array, two of which — `focal` and `rotation` —
 *      are arrays. A caller writing `focal={[0.5, 0.5]}` inline hands React a
 *      new identity on every render, so the effect tears down the GL context,
 *      recompiles the shader and reallocates the geometry on every render.
 *      Here the props are read through a ref and pushed into the uniforms each
 *      frame, so nothing rebuilds. (`transparent` is the exception — it decides
 *      how the context itself is allocated, so it stays a dependency.)
 *
 *   2. It stops when nobody is watching: one still frame under
 *      prefers-reduced-motion, and the loop parked while the element is off
 *      screen or the tab is in the background. Upstream has neither, so a page
 *      with this on it runs a full-screen shader forever — including while it
 *      is scrolled past, and on a laptop that is a fan spinning up for a
 *      backdrop nobody can see.
 *
 *   3. The pointer is tracked on the window rather than on this element.
 *      Upstream binds mousemove to its own container, which cannot work for a
 *      backdrop: the container is behind the copy and does not receive the
 *      events. Tracking the window and converting into container coordinates
 *      means the stars answer the cursor anywhere over the section while this
 *      element stays out of the way of everything on top of it.
 *
 *   4. ResizeObserver on the container rather than a window resize listener.
 *      A section that grows as its content reflows changes this element's size
 *      without the window changing at all, and upstream draws a stretched frame
 *      until a window resize that may never come.
 *
 *   5. Device pixel ratio is capped at 1.5. Upstream renders at 1, which leaves
 *      the star flares visibly steppy on a retina screen.
 *
 *   6. Setup is guarded and the context released on unmount, so a machine
 *      without WebGL gets the background behind this rather than a crashed
 *      page.
 */

const VERT = `
attribute vec2 uv;
attribute vec2 position;

varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const FRAG = `precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform vec2 uFocal;
uniform vec2 uRotation;
uniform float uStarSpeed;
uniform float uDensity;
uniform float uHueShift;
uniform float uSpeed;
uniform vec2 uMouse;
uniform float uGlowIntensity;
uniform float uSaturation;
uniform bool uMouseRepulsion;
uniform float uTwinkleIntensity;
uniform float uRotationSpeed;
uniform float uRepulsionStrength;
uniform float uMouseActiveFactor;
uniform float uAutoCenterRepulsion;
uniform bool uTransparent;

varying vec2 vUv;

#define NUM_LAYER 4.0
#define STAR_COLOR_CUTOFF 0.2
#define MAT45 mat2(0.7071, -0.7071, 0.7071, 0.7071)
#define PERIOD 3.0

float Hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float tri(float x) {
  return abs(fract(x) * 2.0 - 1.0);
}

float tris(float x) {
  float t = fract(x);
  return 1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0));
}

float trisn(float x) {
  float t = fract(x);
  return 2.0 * (1.0 - smoothstep(0.0, 1.0, abs(2.0 * t - 1.0))) - 1.0;
}

vec3 hsv2rgb(vec3 c) {
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

float Star(vec2 uv, float flare) {
  float d = length(uv);
  float m = (0.05 * uGlowIntensity) / d;
  float rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * flare * uGlowIntensity;
  uv *= MAT45;
  rays = smoothstep(0.0, 1.0, 1.0 - abs(uv.x * uv.y * 1000.0));
  m += rays * 0.3 * flare * uGlowIntensity;
  m *= smoothstep(1.0, 0.2, d);
  return m;
}

vec3 StarLayer(vec2 uv) {
  vec3 col = vec3(0.0);

  vec2 gv = fract(uv) - 0.5;
  vec2 id = floor(uv);

  for (int y = -1; y <= 1; y++) {
    for (int x = -1; x <= 1; x++) {
      vec2 offset = vec2(float(x), float(y));
      vec2 si = id + vec2(float(x), float(y));
      float seed = Hash21(si);
      float size = fract(seed * 345.32);
      float glossLocal = tri(uStarSpeed / (PERIOD * seed + 1.0));
      float flareSize = smoothstep(0.9, 1.0, size) * glossLocal;

      float red = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 1.0)) + STAR_COLOR_CUTOFF;
      float blu = smoothstep(STAR_COLOR_CUTOFF, 1.0, Hash21(si + 3.0)) + STAR_COLOR_CUTOFF;
      float grn = min(red, blu) * seed;
      vec3 base = vec3(red, grn, blu);

      float hue = atan(base.g - base.r, base.b - base.r) / (2.0 * 3.14159) + 0.5;
      hue = fract(hue + uHueShift / 360.0);
      float sat = length(base - vec3(dot(base, vec3(0.299, 0.587, 0.114)))) * uSaturation;
      float val = max(max(base.r, base.g), base.b);
      base = hsv2rgb(vec3(hue, sat, val));

      vec2 pad = vec2(tris(seed * 34.0 + uTime * uSpeed / 10.0), tris(seed * 38.0 + uTime * uSpeed / 30.0)) - 0.5;

      float star = Star(gv - offset - pad, flareSize);
      vec3 color = base;

      float twinkle = trisn(uTime * uSpeed + seed * 6.2831) * 0.5 + 1.0;
      twinkle = mix(1.0, twinkle, uTwinkleIntensity);
      star *= twinkle;

      col += star * size * color;
    }
  }

  return col;
}

void main() {
  vec2 focalPx = uFocal * uResolution.xy;
  vec2 uv = (vUv * uResolution.xy - focalPx) / uResolution.y;

  vec2 mouseNorm = uMouse - vec2(0.5);

  if (uAutoCenterRepulsion > 0.0) {
    vec2 centerUV = vec2(0.0, 0.0);
    float centerDist = length(uv - centerUV);
    vec2 repulsion = normalize(uv - centerUV) * (uAutoCenterRepulsion / (centerDist + 0.1));
    uv += repulsion * 0.05;
  } else if (uMouseRepulsion) {
    vec2 mousePosUV = (uMouse * uResolution.xy - focalPx) / uResolution.y;
    float mouseDist = length(uv - mousePosUV);
    vec2 repulsion = normalize(uv - mousePosUV) * (uRepulsionStrength / (mouseDist + 0.1));
    uv += repulsion * 0.05 * uMouseActiveFactor;
  } else {
    vec2 mouseOffset = mouseNorm * 0.1 * uMouseActiveFactor;
    uv += mouseOffset;
  }

  float autoRotAngle = uTime * uRotationSpeed;
  mat2 autoRot = mat2(cos(autoRotAngle), -sin(autoRotAngle), sin(autoRotAngle), cos(autoRotAngle));
  uv = autoRot * uv;

  uv = mat2(uRotation.x, -uRotation.y, uRotation.y, uRotation.x) * uv;

  vec3 col = vec3(0.0);

  for (float i = 0.0; i < 1.0; i += 1.0 / NUM_LAYER) {
    float depth = fract(i + uStarSpeed * uSpeed);
    float scale = mix(20.0 * uDensity, 0.5 * uDensity, depth);
    float fade = depth * smoothstep(1.0, 0.9, depth);
    col += StarLayer(uv * scale + i * 453.32) * fade;
  }

  if (uTransparent) {
    float alpha = length(col);
    alpha = smoothstep(0.0, 0.3, alpha);
    alpha = min(alpha, 1.0);
    gl_FragColor = vec4(col, alpha);
  } else {
    gl_FragColor = vec4(col, 1.0);
  }
}`;

export type GalaxyProps = {
  /** Focal point of the field, as [x, y] from 0 to 1. */
  focal?: [number, number];
  /** Rotation matrix of the field, as [x, y]. */
  rotation?: [number, number];
  /** How fast the layers drift through each other. */
  starSpeed?: number;
  /** How tightly the stars are packed. */
  density?: number;
  /** Shifts every star's hue by this many degrees (0–360). */
  hueShift?: number;
  /** Freezes time. Reduced motion forces this on. */
  disableAnimation?: boolean;
  /** Global multiplier over every time-based term. */
  speed?: number;
  /** Whether the field responds to the pointer at all. */
  mouseInteraction?: boolean;
  /** Brightness of the glow and flare around each star. */
  glowIntensity?: number;
  /** 0 renders grey, 1 gives the stars their full colour. */
  saturation?: number;
  /** When true the stars are pushed away from the pointer rather than nudged. */
  mouseRepulsion?: boolean;
  /** How hard they are pushed, when they are. */
  repulsionStrength?: number;
  /** How much the stars vary in brightness over time. */
  twinkleIntensity?: number;
  /** Speed of the field's own slow rotation. */
  rotationSpeed?: number;
  /** Repulsion from the centre of the frame. Overrides the pointer when > 0. */
  autoCenterRepulsion?: number;
  /** Leaves the black behind the stars transparent. Read once, at mount. */
  transparent?: boolean;
  className?: string;
};

export function Galaxy({
  focal = [0.5, 0.5],
  rotation = [1.0, 0.0],
  starSpeed = 0.5,
  density = 1,
  hueShift = 140,
  disableAnimation = false,
  speed = 1.0,
  mouseInteraction = true,
  glowIntensity = 0.3,
  saturation = 0.0,
  mouseRepulsion = true,
  repulsionStrength = 2,
  twinkleIntensity = 0.3,
  rotationSpeed = 0.1,
  autoCenterRepulsion = 0,
  transparent = true,
  className = "",
}: GalaxyProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({
    focal,
    rotation,
    starSpeed,
    density,
    hueShift,
    disableAnimation,
    speed,
    mouseInteraction,
    glowIntensity,
    saturation,
    mouseRepulsion,
    repulsionStrength,
    twinkleIntensity,
    rotationSpeed,
    autoCenterRepulsion,
  });

  // No dependency array: this runs after every render, and it is declared
  // before the WebGL effect so the values are in place the first time the loop
  // reads them.
  useEffect(() => {
    propsRef.current = {
      focal,
      rotation,
      starSpeed,
      density,
      hueShift,
      disableAnimation,
      speed,
      mouseInteraction,
      glowIntensity,
      saturation,
      mouseRepulsion,
      repulsionStrength,
      twinkleIntensity,
      rotationSpeed,
      autoCenterRepulsion,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: Renderer;
    let mesh: Mesh;
    let program: Program;
    try {
      // OGL's own canvas, appended here, rather than one rendered by React and
      // handed over: teardown ends with loseContext(), and a lost context stays
      // lost on the element it belonged to.
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        alpha: transparent,
        premultipliedAlpha: false,
      });
      if (!renderer.gl) return;

      const gl = renderer.gl;
      if (transparent) {
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.clearColor(0, 0, 0, 0);
      } else {
        gl.clearColor(0, 0, 0, 1);
      }

      program = new Program(gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          uTime: { value: 0 },
          uResolution: { value: [1, 1, 1] },
          uFocal: { value: [focal[0], focal[1]] },
          uRotation: { value: [rotation[0], rotation[1]] },
          uStarSpeed: { value: starSpeed },
          uDensity: { value: density },
          uHueShift: { value: hueShift },
          uSpeed: { value: speed },
          uMouse: { value: [0.5, 0.5] },
          uGlowIntensity: { value: glowIntensity },
          uSaturation: { value: saturation },
          uMouseRepulsion: { value: mouseRepulsion },
          uTwinkleIntensity: { value: twinkleIntensity },
          uRotationSpeed: { value: rotationSpeed },
          uRepulsionStrength: { value: repulsionStrength },
          uMouseActiveFactor: { value: 0 },
          uAutoCenterRepulsion: { value: autoCenterRepulsion },
          uTransparent: { value: transparent },
        },
      });
      mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    } catch {
      // No WebGL, or a shader that would not compile — leave the background
      // behind this element showing rather than taking the page down with it.
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.className = "galaxy__canvas";
    container.appendChild(canvas);

    // Pointer state is smoothed towards its target rather than snapped, so a
    // fast cursor drags the field instead of teleporting it.
    const targetMouse = { x: 0.5, y: 0.5 };
    const smoothMouse = { x: 0.5, y: 0.5 };
    let targetActive = 0;
    let smoothActive = 0;

    let raf = 0;
    const start = performance.now();

    const draw = (elapsed: number) => {
      const p = propsRef.current;

      const lerp = 0.05;
      smoothMouse.x += (targetMouse.x - smoothMouse.x) * lerp;
      smoothMouse.y += (targetMouse.y - smoothMouse.y) * lerp;
      smoothActive += (targetActive - smoothActive) * lerp;

      const u = program.uniforms;
      u.uTime.value = elapsed;
      u.uStarSpeed.value = (elapsed * p.starSpeed) / 10;
      u.uFocal.value = [p.focal[0], p.focal[1]];
      u.uRotation.value = [p.rotation[0], p.rotation[1]];
      u.uDensity.value = p.density;
      u.uHueShift.value = p.hueShift;
      u.uSpeed.value = p.speed;
      u.uMouse.value = [smoothMouse.x, smoothMouse.y];
      u.uGlowIntensity.value = p.glowIntensity;
      u.uSaturation.value = p.saturation;
      u.uMouseRepulsion.value = p.mouseRepulsion;
      u.uTwinkleIntensity.value = p.twinkleIntensity;
      u.uRotationSpeed.value = p.rotationSpeed;
      u.uRepulsionStrength.value = p.repulsionStrength;
      u.uMouseActiveFactor.value = smoothActive;
      u.uAutoCenterRepulsion.value = p.autoCenterRepulsion;

      renderer.render({ scene: mesh });
    };

    const frozen = () => still || propsRef.current.disableAnimation;

    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h);
      // setSize writes the buffer size onto the element as an inline style,
      // which beats the stylesheet. Hand the element back to its parent.
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      const bw = gl.drawingBufferWidth;
      const bh = gl.drawingBufferHeight;
      program.uniforms.uResolution.value = [bw, bh, bw / bh];
      // A still frame is not redrawn by any loop, so it has to be redrawn here
      // or the canvas is blank until something else asks for a frame.
      draw(frozen() ? 0 : (performance.now() - start) / 1000);
    };

    const loop = () => {
      draw((performance.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (raf || frozen() || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };

    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    // On the window, not on the container: this element sits behind the copy
    // and never receives a pointer event of its own. Coordinates are converted
    // into the container's box, and anything outside it releases the effect.
    const onPointerMove = (event: PointerEvent) => {
      if (!propsRef.current.mouseInteraction) return;
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      const x = (event.clientX - rect.left) / rect.width;
      const y = 1 - (event.clientY - rect.top) / rect.height;
      if (x < 0 || x > 1 || y < 0 || y > 1) {
        targetActive = 0;
        return;
      }
      targetMouse.x = x;
      targetMouse.y = y;
      targetActive = 1;
    };

    const onPointerLeave = () => {
      targetActive = 0;
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
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      pause();
      io?.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
    // `transparent` decides how the context is allocated, so it cannot be
    // changed from the loop; everything else is read through propsRef.
  }, [transparent]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`galaxy${className ? ` ${className}` : ""}`}
    />
  );
}
