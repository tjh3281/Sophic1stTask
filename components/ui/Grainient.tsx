"use client";

import { Mesh, Program, Renderer, Triangle } from "ogl";
import { useEffect, useRef } from "react";
import "./Grainient.css";

/**
 * Grainient, from React Bits — ported to TypeScript.
 *
 * Three colours blended along a rotating axis, warped by a pair of sine waves
 * and dusted with film grain, all drawn per pixel by one fragment shader. The
 * blend axis is turned by value noise sampled on a slow clock, so the whole
 * field drifts and folds without ever repeating.
 *
 * The shader is upstream's, unchanged — it is what the component is. The
 * wrapper around it is not, and the differences are the same ones the Galaxy,
 * PixelBlast, SideRays and Particles ports needed:
 *
 *   1. Props are read through a ref and pushed into the uniforms each frame.
 *      Upstream keeps the renderer alive across renders in a module-level
 *      WeakMap keyed on the container node, then syncs props in a second effect
 *      that allocates four fresh Float32Arrays every time any one of its
 *      twenty-two dependencies changes. A ref does the same job with no map to
 *      keep in step with the DOM, and the arrays here are allocated once and
 *      written in place, so a re-render costs nothing at all.
 *
 *   2. It stops when nobody is watching: one still frame under
 *      prefers-reduced-motion, and the loop parked while the element is off
 *      screen or the tab is in the background. Upstream pauses off screen but
 *      has no reduced-motion path, so a reader who asked for less motion still
 *      gets a gradient folding behind the words they are trying to read.
 *
 *   3. Elapsed time is accumulated from frame deltas rather than read off the
 *      wall clock. The loop stops while the cover is scrolled past; on a wall
 *      clock, coming back after a minute away hands the next frame sixty
 *      seconds of drift at once and the gradient visibly slides. Accumulating
 *      means it resumes exactly where it stopped.
 *
 *   4. The context is checked for WebGL 2 before anything is built. Both
 *      shaders are `#version 300 es`, which WebGL 1 cannot compile — and OGL
 *      quietly falls back to a WebGL 1 context when 2 is unavailable, so
 *      without this the failure arrives as a shader compile error rather than
 *      as the missing feature it is.
 *
 *   5. Setup is guarded and the context released on unmount, so a machine
 *      without WebGL gets the background behind this element rather than a
 *      crashed page.
 */

const VERT = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uTimeSpeed;
uniform float uColorBalance;
uniform float uWarpStrength;
uniform float uWarpFrequency;
uniform float uWarpSpeed;
uniform float uWarpAmplitude;
uniform float uBlendAngle;
uniform float uBlendSoftness;
uniform float uRotationAmount;
uniform float uNoiseScale;
uniform float uGrainAmount;
uniform float uGrainScale;
uniform float uGrainAnimated;
uniform float uContrast;
uniform float uGamma;
uniform float uSaturation;
uniform vec2 uCenterOffset;
uniform float uZoom;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
out vec4 fragColor;
#define S(a,b,t) smoothstep(a,b,t)
mat2 Rot(float a){float s=sin(a),c=cos(a);return mat2(c,-s,s,c);}
vec2 hash(vec2 p){p=vec2(dot(p,vec2(2127.1,81.17)),dot(p,vec2(1269.5,283.37)));return fract(sin(p)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.0-2.0*f);float n=mix(mix(dot(-1.0+2.0*hash(i+vec2(0.0,0.0)),f-vec2(0.0,0.0)),dot(-1.0+2.0*hash(i+vec2(1.0,0.0)),f-vec2(1.0,0.0)),u.x),mix(dot(-1.0+2.0*hash(i+vec2(0.0,1.0)),f-vec2(0.0,1.0)),dot(-1.0+2.0*hash(i+vec2(1.0,1.0)),f-vec2(1.0,1.0)),u.x),u.y);return 0.5+0.5*n;}
void mainImage(out vec4 o, vec2 C){
  float t=iTime*uTimeSpeed;
  vec2 uv=C/iResolution.xy;
  float ratio=iResolution.x/iResolution.y;
  vec2 tuv=uv-0.5+uCenterOffset;
  tuv/=max(uZoom,0.001);

  float degree=noise(vec2(t*0.1,tuv.x*tuv.y)*uNoiseScale);
  tuv.y*=1.0/ratio;
  tuv*=Rot(radians((degree-0.5)*uRotationAmount+180.0));
  tuv.y*=ratio;

  float frequency=uWarpFrequency;
  float ws=max(uWarpStrength,0.001);
  float amplitude=uWarpAmplitude/ws;
  float warpTime=t*uWarpSpeed;
  tuv.x+=sin(tuv.y*frequency+warpTime)/amplitude;
  tuv.y+=sin(tuv.x*(frequency*1.5)+warpTime)/(amplitude*0.5);

  vec3 colLav=uColor1;
  vec3 colOrg=uColor2;
  vec3 colDark=uColor3;
  float b=uColorBalance;
  float s=max(uBlendSoftness,0.0);
  mat2 blendRot=Rot(radians(uBlendAngle));
  float blendX=(tuv*blendRot).x;
  float edge0=-0.3-b-s;
  float edge1=0.2-b+s;
  float v0=0.5-b+s;
  float v1=-0.3-b-s;
  vec3 layer1=mix(colDark,colOrg,S(edge0,edge1,blendX));
  vec3 layer2=mix(colOrg,colLav,S(edge0,edge1,blendX));
  vec3 col=mix(layer1,layer2,S(v0,v1,tuv.y));

  vec2 grainUv=uv*max(uGrainScale,0.001);
  if(uGrainAnimated>0.5){grainUv+=vec2(iTime*0.05);}
  float grain=fract(sin(dot(grainUv,vec2(12.9898,78.233)))*43758.5453);
  col+=(grain-0.5)*uGrainAmount;

  col=(col-0.5)*uContrast+0.5;
  float luma=dot(col,vec3(0.2126,0.7152,0.0722));
  col=mix(vec3(luma),col,uSaturation);
  col=pow(max(col,0.0),vec3(1.0/max(uGamma,0.001)));
  col=clamp(col,0.0,1.0);

  o=vec4(col,1.0);
}
void main(){
  vec4 o=vec4(0.0);
  mainImage(o,gl_FragCoord.xy);
  fragColor=o;
}
`;

export type GrainientProps = {
  /** Primary light colour in the blend. */
  color1?: string;
  /** Accent colour in the blend. */
  color2?: string;
  /** Deep base colour in the blend. */
  color3?: string;
  /** Speed multiplier for the drift. */
  timeSpeed?: number;
  /** Shifts the palette toward the dark or the light end. */
  colorBalance?: number;
  /** Strength of the wave warp; 0 disables it. */
  warpStrength?: number;
  warpFrequency?: number;
  warpSpeed?: number;
  warpAmplitude?: number;
  /** Rotation of the blend axis, in degrees. */
  blendAngle?: number;
  blendSoftness?: number;
  /** How far the noise is allowed to turn the field, in degrees. */
  rotationAmount?: number;
  noiseScale?: number;
  grainAmount?: number;
  grainScale?: number;
  grainAnimated?: boolean;
  contrast?: number;
  gamma?: number;
  saturation?: number;
  centerX?: number;
  centerY?: number;
  zoom?: number;
  className?: string;
};

/**
 * "#rrggbb" to the 0–1 triple the shader wants.
 *
 * Six digits only, which is every colour this is called with. Anything else
 * falls back to white rather than throwing — a cover with the wrong colour on
 * it is a bug worth seeing, and a cover that took the page down is not.
 */
const HEX = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;

function hexToRgb(hex: string): [number, number, number] {
  const result = HEX.exec(hex);
  if (!result) return [1, 1, 1];
  return [
    parseInt(result[1], 16) / 255,
    parseInt(result[2], 16) / 255,
    parseInt(result[3], 16) / 255,
  ];
}

export function Grainient({
  color1 = "#FF9FFC",
  color2 = "#5227FF",
  color3 = "#B497CF",
  timeSpeed = 0.25,
  colorBalance = 0.0,
  warpStrength = 1.0,
  warpFrequency = 5.0,
  warpSpeed = 2.0,
  warpAmplitude = 50.0,
  blendAngle = 0.0,
  blendSoftness = 0.05,
  rotationAmount = 500.0,
  noiseScale = 2.0,
  grainAmount = 0.1,
  grainScale = 2.0,
  grainAnimated = false,
  contrast = 1.5,
  gamma = 1.0,
  saturation = 1.0,
  centerX = 0.0,
  centerY = 0.0,
  zoom = 0.9,
  className = "",
}: GrainientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const propsRef = useRef({
    color1,
    color2,
    color3,
    timeSpeed,
    colorBalance,
    warpStrength,
    warpFrequency,
    warpSpeed,
    warpAmplitude,
    blendAngle,
    blendSoftness,
    rotationAmount,
    noiseScale,
    grainAmount,
    grainScale,
    grainAnimated,
    contrast,
    gamma,
    saturation,
    centerX,
    centerY,
    zoom,
  });

  // No dependency array: this runs after every render, and it is declared
  // before the WebGL effect so the values are in place the first time the loop
  // reads them.
  useEffect(() => {
    propsRef.current = {
      color1,
      color2,
      color3,
      timeSpeed,
      colorBalance,
      warpStrength,
      warpFrequency,
      warpSpeed,
      warpAmplitude,
      blendAngle,
      blendSoftness,
      rotationAmount,
      noiseScale,
      grainAmount,
      grainScale,
      grainAnimated,
      contrast,
      gamma,
      saturation,
      centerX,
      centerY,
      zoom,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let renderer: Renderer;
    let program: Program;
    let mesh: Mesh;
    try {
      // OGL's own canvas, appended here, rather than one rendered by React and
      // handed over: teardown ends with loseContext(), and a lost context stays
      // lost on the element it belonged to.
      renderer = new Renderer({
        webgl: 2,
        // The shader writes alpha 1.0 on every pixel, so there is nothing for a
        // transparent drawing buffer to reveal — it would only cost a blend.
        alpha: false,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 1.5),
      });
      // OGL asks for a WebGL 2 context and silently accepts a WebGL 1 one when
      // it cannot have it. Both shaders here are GLSL ES 3.00.
      if (!renderer.gl || !renderer.isWebgl2) return;

      program = new Program(renderer.gl, {
        vertex: VERT,
        fragment: FRAG,
        uniforms: {
          iTime: { value: 0 },
          iResolution: { value: new Float32Array([1, 1]) },
          uTimeSpeed: { value: timeSpeed },
          uColorBalance: { value: colorBalance },
          uWarpStrength: { value: warpStrength },
          uWarpFrequency: { value: warpFrequency },
          uWarpSpeed: { value: warpSpeed },
          uWarpAmplitude: { value: warpAmplitude },
          uBlendAngle: { value: blendAngle },
          uBlendSoftness: { value: blendSoftness },
          uRotationAmount: { value: rotationAmount },
          uNoiseScale: { value: noiseScale },
          uGrainAmount: { value: grainAmount },
          uGrainScale: { value: grainScale },
          uGrainAnimated: { value: grainAnimated ? 1 : 0 },
          uContrast: { value: contrast },
          uGamma: { value: gamma },
          uSaturation: { value: saturation },
          uCenterOffset: { value: new Float32Array([centerX, centerY]) },
          uZoom: { value: zoom },
          uColor1: { value: new Float32Array(hexToRgb(color1)) },
          uColor2: { value: new Float32Array(hexToRgb(color2)) },
          uColor3: { value: new Float32Array(hexToRgb(color3)) },
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
    canvas.className = "grainient__canvas";
    container.appendChild(canvas);

    const u = program.uniforms;
    // Written in place every frame. Held here so the loop never allocates.
    const centerOffset = u.uCenterOffset.value as Float32Array;
    const rgb1 = u.uColor1.value as Float32Array;
    const rgb2 = u.uColor2.value as Float32Array;
    const rgb3 = u.uColor3.value as Float32Array;

    const writeRgb = (target: Float32Array, hex: string) => {
      const [r, g, b] = hexToRgb(hex);
      target[0] = r;
      target[1] = g;
      target[2] = b;
    };

    const draw = (elapsed: number) => {
      const p = propsRef.current;

      u.iTime.value = elapsed;
      u.uTimeSpeed.value = p.timeSpeed;
      u.uColorBalance.value = p.colorBalance;
      u.uWarpStrength.value = p.warpStrength;
      u.uWarpFrequency.value = p.warpFrequency;
      u.uWarpSpeed.value = p.warpSpeed;
      u.uWarpAmplitude.value = p.warpAmplitude;
      u.uBlendAngle.value = p.blendAngle;
      u.uBlendSoftness.value = p.blendSoftness;
      u.uRotationAmount.value = p.rotationAmount;
      u.uNoiseScale.value = p.noiseScale;
      u.uGrainAmount.value = p.grainAmount;
      u.uGrainScale.value = p.grainScale;
      u.uGrainAnimated.value = p.grainAnimated ? 1 : 0;
      u.uContrast.value = p.contrast;
      u.uGamma.value = p.gamma;
      u.uSaturation.value = p.saturation;
      u.uZoom.value = p.zoom;
      centerOffset[0] = p.centerX;
      centerOffset[1] = p.centerY;
      writeRgb(rgb1, p.color1);
      writeRgb(rgb2, p.color2);
      writeRgb(rgb3, p.color3);

      renderer.render({ scene: mesh });
    };

    /** Seconds of drift the field has been shown, pauses excluded. */
    let elapsed = 0;
    let last = 0;
    let raf = 0;

    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h);
      // setSize writes the buffer size onto the element as an inline style,
      // which beats the stylesheet. Hand the element back to its parent.
      canvas.style.width = "100%";
      canvas.style.height = "100%";
      const res = u.iResolution.value as Float32Array;
      res[0] = gl.drawingBufferWidth;
      res[1] = gl.drawingBufferHeight;
      // A still frame is not redrawn by any loop, so it has to be redrawn here
      // or the canvas is blank until something else asks for a frame.
      draw(elapsed);
    };

    const loop = (now: number) => {
      // Clamped, so a frame that arrived late — a long paint elsewhere, a
      // machine that stalled — advances the field by a plausible step rather
      // than by however long the gap happened to be.
      elapsed += Math.min(now - last, 100) * 0.001;
      last = now;
      draw(elapsed);
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (raf || still || document.hidden) return;
      last = performance.now();
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
    // Built once. Every prop is read through propsRef inside the loop, so
    // nothing here needs rebuilding when one of them changes.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`grainient${className ? ` ${className}` : ""}`}
    />
  );
}
