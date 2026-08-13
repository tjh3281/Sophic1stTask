"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import "./SideRays.css";

/**
 * SideRays, from React Bits — ported to TypeScript.
 *
 * A fan of volumetric light thrown from one corner of its container, drawn per
 * pixel by a small fragment shader. Two ray layers of different colours, each
 * with its own drift, blended together and faded with distance from the
 * source.
 *
 * Local changes, in rough order of how much they matter:
 *
 *   1. The context is built once and kept. Upstream holds visibility in React
 *      state and rebuilds the entire renderer — context, shader, geometry —
 *      every time the element crosses the viewport edge, which means compiling
 *      a shader and allocating a GL context on a scroll. Here the observer
 *      only starts and stops the loop, the same arrangement DarkVeil uses.
 *
 *   2. It stops when nobody is watching: one static frame under
 *      prefers-reduced-motion, and the loop parked while the element is off
 *      screen or the tab is in the background. Upstream has neither, so a page
 *      with this on it renders a full-screen shader forever.
 *
 *   3. ResizeObserver on the container rather than a window resize listener.
 *      The window is not the only thing that changes this element's size — a
 *      section that grows as its content reflows does too, and upstream draws
 *      a stretched frame until the next window resize that may never come.
 *
 *   4. Device pixel ratio is capped at 1.5 rather than 2. There is no edge in
 *      this image sharper than a gradient, so the fourth of the pixels a
 *      retina buffer would add are spent on nothing.
 *
 *   5. Setup is guarded and the context released on unmount, so a machine
 *      without WebGL gets the background behind this rather than a crashed
 *      page.
 *
 * Props are read through a ref and pushed into the uniforms after every
 * render, so changing one never tears the context down.
 */

const VERT = `
attribute vec2 position;
void main(){gl_Position=vec4(position,0.0,1.0);}
`;

const FRAG = `precision highp float;

uniform float iTime;
uniform vec2 iResolution;
uniform float iSpeed;
uniform vec3 iRayColor1;
uniform vec3 iRayColor2;
uniform float iIntensity;
uniform float iSpread;
uniform float iFlipX;
uniform float iFlipY;
uniform float iTilt;
uniform float iSaturation;
uniform float iBlend;
uniform float iFalloff;
uniform float iOpacity;

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord, float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  float cosAngle = dot(normalize(sourceToCoord), rayRefDirection);
  return clamp(
    (0.45 + 0.15 * sin(cosAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-cosAngle * seedB + iTime * speed)),
    0.0, 1.0) *
    clamp((iResolution.x - length(sourceToCoord)) / iResolution.x, 0.5, 1.0);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  if (iFlipX > 0.5) fragCoord.x = iResolution.x - fragCoord.x;
  if (iFlipY > 0.5) fragCoord.y = iResolution.y - fragCoord.y;

  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  vec2 rayPos = vec2(iResolution.x * 1.1, -0.5 * iResolution.y);

  float tiltRad = iTilt * 3.14159265 / 180.0;
  float cs = cos(tiltRad);
  float sn = sin(tiltRad);
  vec2 rel = coord - rayPos;
  vec2 tiltedCoord = vec2(rel.x * cs - rel.y * sn, rel.x * sn + rel.y * cs) + rayPos;

  float halfSpread = iSpread * 0.275;
  vec2 rayRefDir1 = normalize(vec2(cos(0.785398 + halfSpread), sin(0.785398 + halfSpread)));
  vec2 rayRefDir2 = normalize(vec2(cos(0.785398 - halfSpread), sin(0.785398 - halfSpread)));

  vec4 rays1 = vec4(iRayColor1, 1.0) * rayStrength(rayPos, rayRefDir1, tiltedCoord, 36.2214, 21.11349, iSpeed);
  vec4 rays2 = vec4(iRayColor2, 1.0) * rayStrength(rayPos, rayRefDir2, tiltedCoord, 22.3991, 18.0234, iSpeed * 0.2);

  vec4 color = rays1 * (1.0 - iBlend) * 0.9 + rays2 * iBlend * 0.9;

  float distanceToLight = length(fragCoord.xy - vec2(rayPos.x, iResolution.y - rayPos.y)) / iResolution.y;
  float brightness = iIntensity * 0.4 / pow(max(distanceToLight, 0.001), iFalloff);
  color.rgb *= brightness;

  float gray = dot(color.rgb, vec3(0.299, 0.587, 0.114));
  color.rgb = mix(vec3(gray), color.rgb, iSaturation);

  color.a = max(color.r, max(color.g, color.b)) * iOpacity;
  gl_FragColor = color;
}`;

export type RayOrigin =
  | "top-right"
  | "top-left"
  | "bottom-right"
  | "bottom-left";

function hexToRgb(hex: string): [number, number, number] {
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!match) return [1, 1, 1];
  return [
    parseInt(match[1], 16) / 255,
    parseInt(match[2], 16) / 255,
    parseInt(match[3], 16) / 255,
  ];
}

/** The shader always throws from the top right; the corner is chosen by
 *  mirroring its coordinates on the way in. */
function originToFlip(origin: RayOrigin): [number, number] {
  switch (origin) {
    case "top-left":
      return [1, 0];
    case "bottom-right":
      return [0, 1];
    case "bottom-left":
      return [1, 1];
    default:
      return [0, 0];
  }
}

export type SideRaysProps = {
  /** Multiplier on the drift of the fan. */
  speed?: number;
  /** Colour of the first ray layer, as hex. */
  rayColor1?: string;
  /** Colour of the second ray layer, as hex. */
  rayColor2?: string;
  /** Overall brightness. */
  intensity?: number;
  /** Angular width of the fan — higher spreads the two layers apart. */
  spread?: number;
  /** Which corner the light comes from. */
  origin?: RayOrigin;
  /** Rotation of the fan in degrees, clockwise. */
  tilt?: number;
  /** 0 renders grey, 1 leaves the colours alone, above 1 boosts them. */
  saturation?: number;
  /** Balance between the layers: 0 is all of the first, 1 all of the second. */
  blend?: number;
  /** How steeply brightness falls with distance. Higher is a tighter glow. */
  falloff?: number;
  /** Overall opacity. */
  opacity?: number;
  className?: string;
};

export function SideRays({
  speed = 2.5,
  rayColor1 = "#EAB308",
  rayColor2 = "#96c8ff",
  intensity = 2,
  spread = 2,
  origin = "top-right",
  tilt = 0,
  saturation = 1.5,
  blend = 0.75,
  falloff = 1.6,
  opacity = 1,
  className = "",
}: SideRaysProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({
    speed,
    rayColor1,
    rayColor2,
    intensity,
    spread,
    origin,
    tilt,
    saturation,
    blend,
    falloff,
    opacity,
  });

  // No dependency array: this runs after every render, and it is declared
  // before the WebGL effect so the values are in place the first time the loop
  // reads them.
  useEffect(() => {
    propsRef.current = {
      speed,
      rayColor1,
      rayColor2,
      intensity,
      spread,
      origin,
      tilt,
      saturation,
      blend,
      falloff,
      opacity,
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
      // lost on the element it belonged to. DarkVeil does the same, for the
      // same reason.
      renderer = new Renderer({
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
        alpha: true,
      });
      if (!renderer.gl) return;

      const [flipX, flipY] = originToFlip(origin);
      program = new Program(renderer.gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: [1, 1] },
          iSpeed: { value: speed },
          iRayColor1: { value: hexToRgb(rayColor1) },
          iRayColor2: { value: hexToRgb(rayColor2) },
          iIntensity: { value: intensity },
          iSpread: { value: spread },
          iFlipX: { value: flipX },
          iFlipY: { value: flipY },
          iTilt: { value: tilt },
          iSaturation: { value: saturation },
          iBlend: { value: blend },
          iFalloff: { value: falloff },
          iOpacity: { value: opacity },
        },
      });
      mesh = new Mesh(renderer.gl, {
        geometry: new Triangle(renderer.gl),
        program,
      });
    } catch {
      // No WebGL, or a shader that would not compile — leave the background
      // behind this element showing rather than taking the page down with it.
      return;
    }

    const gl = renderer.gl;
    const canvas = gl.canvas as HTMLCanvasElement;
    canvas.className = "side-rays__canvas";
    container.appendChild(canvas);

    let raf = 0;

    const draw = (elapsed: number) => {
      const p = propsRef.current;
      const [flipX, flipY] = originToFlip(p.origin);
      program.uniforms.iTime.value = elapsed;
      program.uniforms.iSpeed.value = p.speed;
      program.uniforms.iRayColor1.value = hexToRgb(p.rayColor1);
      program.uniforms.iRayColor2.value = hexToRgb(p.rayColor2);
      program.uniforms.iIntensity.value = p.intensity;
      program.uniforms.iSpread.value = p.spread;
      program.uniforms.iFlipX.value = flipX;
      program.uniforms.iFlipY.value = flipY;
      program.uniforms.iTilt.value = p.tilt;
      program.uniforms.iSaturation.value = p.saturation;
      program.uniforms.iBlend.value = p.blend;
      program.uniforms.iFalloff.value = p.falloff;
      program.uniforms.iOpacity.value = p.opacity;
      renderer.render({ scene: mesh });
    };

    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h);
      // setSize writes the buffer size onto the element as an inline style,
      // which beats the stylesheet. Hand the element back to its parent.
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      // The shader counts in buffer pixels, so this has to be the buffer.
      program.uniforms.iResolution.value = [
        gl.drawingBufferWidth,
        gl.drawingBufferHeight,
      ];
      // A still frame is not redrawn by any loop, so it has to be redrawn here
      // or the canvas is blank until something else asks for a frame.
      draw(still ? 0 : (performance.now() - start) / 1000);
    };

    const start = performance.now();

    const loop = () => {
      draw((performance.now() - start) / 1000);
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (raf || still || document.hidden) return;
      raf = requestAnimationFrame(loop);
    };

    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
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
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      pause();
      io?.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (canvas.parentNode === container) container.removeChild(canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- props are read through propsRef

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`side-rays${className ? ` ${className}` : ""}`}
    />
  );
}
