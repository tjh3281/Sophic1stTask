"use client";

import { Effect, EffectComposer, EffectPass, RenderPass } from "postprocessing";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import "./PixelBlast.css";

/**
 * PixelBlast, from React Bits — ported to TypeScript.
 * Inspired by github.com/zavalit/bayer-dithering-webgl-demo.
 *
 * A full-screen quad running fractal noise through an 8×8 Bayer matrix, so the
 * field resolves into a grid of hard-edged pixels that bloom and thin as the
 * noise drifts under them. Clicking sends a ring out from the point; with
 * `liquid` on, the pointer also drags a decaying trail that warps the whole
 * frame through a post-processing pass.
 *
 * Both shaders are upstream's, unchanged. The wrapper is not, and the changes
 * are the same ones the Galaxy, SideRays and Particles ports needed:
 *
 *   1. It rebuilds only when the pipeline itself changes. Upstream lists
 *      nineteen props in its dependency array and then hand-rolls a
 *      "mustReinit" check inside the effect to undo most of it — so changing
 *      the colour runs the whole teardown branch, and the cleanup function it
 *      returns has to guard against tearing down the context it just built.
 *      Only four things here genuinely need a new context: antialiasing, the
 *      liquid pass, the noise pass and the buffer scale. Those are the
 *      dependencies. Everything else is read through a ref and pushed into the
 *      uniforms each frame, which is also what fixes upstream's `liquidStrength`
 *      updates — it writes to the effect object rather than to its uniform, so
 *      the value silently never lands.
 *
 *   2. It stops when nobody is watching: one still frame under
 *      prefers-reduced-motion, and the loop parked while the element is off
 *      screen or the tab is in the background.
 *
 *   3. Elapsed time survives a pause. The clock is accumulated from frame
 *      deltas rather than read off a THREE.Clock, because `speed` scales it —
 *      a loop that stops for ten seconds and restarts would otherwise hand the
 *      next frame a ten-second delta and jump the whole field.
 *
 *   4. The pointer is tracked on the window rather than on the canvas, which is
 *      what lets it work as a backdrop. Upstream binds to its own canvas, so a
 *      pointer-events: none element — which is what a backdrop has to be, or it
 *      sits between the reader and the links on top of it — would never see a
 *      click at all. Events are filtered to the element's own rectangle here,
 *      so a click somewhere else on the page is not a ripple.
 *
 *   5. Setup is guarded. No WebGL, or a shader that will not compile, leaves
 *      whatever is behind this element showing rather than taking the page
 *      down with it.
 */

const SHAPE_MAP = {
  square: 0,
  circle: 1,
  triangle: 2,
  diamond: 3,
} as const;

export type PixelBlastVariant = keyof typeof SHAPE_MAP;

/** Ring slots in the shader. The eleventh click overwrites the first. */
const MAX_CLICKS = 10;

const VERTEX_SRC = /* glsl */ `
void main() {
  gl_Position = vec4(position, 1.0);
}
`;

const FRAGMENT_SRC = /* glsl */ `
precision highp float;

uniform vec3  uColor;
uniform vec2  uResolution;
uniform float uTime;
uniform float uPixelSize;
uniform float uScale;
uniform float uDensity;
uniform float uPixelJitter;
uniform int   uEnableRipples;
uniform float uRippleSpeed;
uniform float uRippleThickness;
uniform float uRippleIntensity;
uniform float uEdgeFade;

uniform int   uShapeType;
const int SHAPE_SQUARE   = 0;
const int SHAPE_CIRCLE   = 1;
const int SHAPE_TRIANGLE = 2;
const int SHAPE_DIAMOND  = 3;

const int   MAX_CLICKS = 10;

uniform vec2  uClickPos  [MAX_CLICKS];
uniform float uClickTimes[MAX_CLICKS];

out vec4 fragColor;

float Bayer2(vec2 a) {
  a = floor(a);
  return fract(a.x / 2. + a.y * a.y * .75);
}
#define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
#define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))

#define FBM_OCTAVES     5
#define FBM_LACUNARITY  1.25
#define FBM_GAIN        1.0

float hash11(float n){ return fract(sin(n)*43758.5453); }

float vnoise(vec3 p){
  vec3 ip = floor(p);
  vec3 fp = fract(p);
  float n000 = hash11(dot(ip + vec3(0.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n100 = hash11(dot(ip + vec3(1.0,0.0,0.0), vec3(1.0,57.0,113.0)));
  float n010 = hash11(dot(ip + vec3(0.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n110 = hash11(dot(ip + vec3(1.0,1.0,0.0), vec3(1.0,57.0,113.0)));
  float n001 = hash11(dot(ip + vec3(0.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n101 = hash11(dot(ip + vec3(1.0,0.0,1.0), vec3(1.0,57.0,113.0)));
  float n011 = hash11(dot(ip + vec3(0.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  float n111 = hash11(dot(ip + vec3(1.0,1.0,1.0), vec3(1.0,57.0,113.0)));
  vec3 w = fp*fp*fp*(fp*(fp*6.0-15.0)+10.0);
  float x00 = mix(n000, n100, w.x);
  float x10 = mix(n010, n110, w.x);
  float x01 = mix(n001, n101, w.x);
  float x11 = mix(n011, n111, w.x);
  float y0  = mix(x00, x10, w.y);
  float y1  = mix(x01, x11, w.y);
  return mix(y0, y1, w.z) * 2.0 - 1.0;
}

float fbm2(vec2 uv, float t){
  vec3 p = vec3(uv * uScale, t);
  float amp = 1.0;
  float freq = 1.0;
  float sum = 1.0;
  for (int i = 0; i < FBM_OCTAVES; ++i){
    sum  += amp * vnoise(p * freq);
    freq *= FBM_LACUNARITY;
    amp  *= FBM_GAIN;
  }
  return sum * 0.5 + 0.5;
}

float maskCircle(vec2 p, float cov){
  float r = sqrt(cov) * .25;
  float d = length(p - 0.5) - r;
  float aa = 0.5 * fwidth(d);
  return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
}

float maskTriangle(vec2 p, vec2 id, float cov){
  bool flip = mod(id.x + id.y, 2.0) > 0.5;
  if (flip) p.x = 1.0 - p.x;
  float r = sqrt(cov);
  float d  = p.y - r*(1.0 - p.x);
  float aa = fwidth(d);
  return cov * clamp(0.5 - d/aa, 0.0, 1.0);
}

float maskDiamond(vec2 p, float cov){
  float r = sqrt(cov) * 0.564;
  return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
}

void main(){
  float pixelSize = uPixelSize;
  vec2 fragCoord = gl_FragCoord.xy - uResolution * .5;
  float aspectRatio = uResolution.x / uResolution.y;

  vec2 pixelId = floor(fragCoord / pixelSize);
  vec2 pixelUV = fract(fragCoord / pixelSize);

  float cellPixelSize = 8.0 * pixelSize;
  vec2 cellId = floor(fragCoord / cellPixelSize);
  vec2 cellCoord = cellId * cellPixelSize;
  vec2 uv = cellCoord / uResolution * vec2(aspectRatio, 1.0);

  float base = fbm2(uv, uTime * 0.05);
  base = base * 0.5 - 0.65;

  float feed = base + (uDensity - 0.5) * 0.3;

  float speed     = uRippleSpeed;
  float thickness = uRippleThickness;
  const float dampT     = 1.0;
  const float dampR     = 10.0;

  if (uEnableRipples == 1) {
    for (int i = 0; i < MAX_CLICKS; ++i){
      vec2 pos = uClickPos[i];
      if (pos.x < 0.0) continue;
      float cellPixelSize = 8.0 * pixelSize;
      vec2 cuv = (((pos - uResolution * .5 - cellPixelSize * .5) / (uResolution))) * vec2(aspectRatio, 1.0);
      float t = max(uTime - uClickTimes[i], 0.0);
      float r = distance(uv, cuv);
      float waveR = speed * t;
      float ring  = exp(-pow((r - waveR) / thickness, 2.0));
      float atten = exp(-dampT * t) * exp(-dampR * r);
      feed = max(feed, ring * atten * uRippleIntensity);
    }
  }

  float bayer = Bayer8(fragCoord / uPixelSize) - 0.5;
  float bw = step(0.5, feed + bayer);

  float h = fract(sin(dot(floor(fragCoord / uPixelSize), vec2(127.1, 311.7))) * 43758.5453);
  float jitterScale = 1.0 + (h - 0.5) * uPixelJitter;
  float coverage = bw * jitterScale;
  float M;
  if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle (pixelUV, coverage);
  else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
  else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
  else                                   M = coverage;

  if (uEdgeFade > 0.0) {
    vec2 norm = gl_FragCoord.xy / uResolution;
    float edge = min(min(norm.x, norm.y), min(1.0 - norm.x, 1.0 - norm.y));
    float fade = smoothstep(0.0, uEdgeFade, edge);
    M *= fade;
  }

  vec3 color = uColor;

  // sRGB gamma correction - convert linear to sRGB for accurate color output
  vec3 srgbColor = mix(
    color * 12.92,
    1.055 * pow(color, vec3(1.0 / 2.4)) - 0.055,
    step(0.0031308, color)
  );

  fragColor = vec4(srgbColor, M);
}
`;

const LIQUID_FRAGMENT_SRC = /* glsl */ `
uniform sampler2D uTexture;
uniform float uStrength;
uniform float uTime;
uniform float uFreq;

void mainUv(inout vec2 uv) {
  vec4 tex = texture2D(uTexture, uv);
  float vx = tex.r * 2.0 - 1.0;
  float vy = tex.g * 2.0 - 1.0;
  float intensity = tex.b;

  float wave = 0.5 + 0.5 * sin(uTime * uFreq + intensity * 6.2831853);

  float amt = uStrength * intensity * wave;

  uv += vec2(vx, vy) * amt;
}
`;

const NOISE_FRAGMENT_SRC = /* glsl */ `
uniform float uTime;
uniform float uAmount;

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor){
  float n = hash(floor(uv * vec2(1920.0, 1080.0)) + floor(uTime * 60.0));
  float g = (n - 0.5) * uAmount;
  outputColor = inputColor + vec4(vec3(g), 0.0);
}
`;

/**
 * The pointer trail the liquid pass reads.
 *
 * A 64×64 canvas of decaying blobs, one per sampled pointer position, drawn
 * with the movement direction packed into red and green and the blob's own
 * strength into blue — which is exactly what the shader above unpacks to decide
 * which way, and how hard, to push each pixel.
 */
type TouchTexture = ReturnType<typeof createTouchTexture>;

function createTouchTexture() {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("2D context not available");

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const texture = new THREE.Texture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  type TrailPoint = {
    x: number;
    y: number;
    age: number;
    force: number;
    vx: number;
    vy: number;
  };

  const trail: TrailPoint[] = [];
  let last: { x: number; y: number } | null = null;
  const maxAge = 64;
  let radius = 0.1 * size;
  const speed = 1 / maxAge;

  const clear = () => {
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  };

  const drawPoint = (p: TrailPoint) => {
    const pos = { x: p.x * size, y: (1 - p.y) * size };
    let intensity = 1;
    const easeOutSine = (t: number) => Math.sin((t * Math.PI) / 2);
    const easeOutQuad = (t: number) => -t * (t - 2);

    if (p.age < maxAge * 0.3) intensity = easeOutSine(p.age / (maxAge * 0.3));
    else
      intensity = easeOutQuad(1 - (p.age - maxAge * 0.3) / (maxAge * 0.7)) || 0;
    intensity *= p.force;

    const color = `${((p.vx + 1) / 2) * 255}, ${((p.vy + 1) / 2) * 255}, ${intensity * 255}`;
    // Drawn off-canvas and cast back on by its own shadow, which is how the
    // blob gets a soft falloff without a gradient fill per point.
    const offset = size * 5;
    ctx.shadowOffsetX = offset;
    ctx.shadowOffsetY = offset;
    ctx.shadowBlur = radius;
    ctx.shadowColor = `rgba(${color},${0.22 * intensity})`;
    ctx.beginPath();
    ctx.fillStyle = "rgba(255,0,0,1)";
    ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    ctx.fill();
  };

  return {
    texture,
    addTouch(norm: { x: number; y: number }) {
      let force = 0;
      let vx = 0;
      let vy = 0;
      if (last) {
        const dx = norm.x - last.x;
        const dy = norm.y - last.y;
        if (dx === 0 && dy === 0) return;
        const dd = dx * dx + dy * dy;
        const d = Math.sqrt(dd);
        vx = dx / (d || 1);
        vy = dy / (d || 1);
        force = Math.min(dd * 10000, 1);
      }
      last = { x: norm.x, y: norm.y };
      trail.push({ x: norm.x, y: norm.y, age: 0, force, vx, vy });
    },
    update() {
      clear();
      for (let i = trail.length - 1; i >= 0; i--) {
        const point = trail[i];
        const f = point.force * speed * (1 - point.age / maxAge);
        point.x += point.vx * f;
        point.y += point.vy * f;
        point.age++;
        if (point.age > maxAge) trail.splice(i, 1);
      }
      for (const point of trail) drawPoint(point);
      texture.needsUpdate = true;
    },
    set radiusScale(value: number) {
      radius = 0.1 * size * value;
    },
    dispose() {
      texture.dispose();
    },
  };
}

export type PixelBlastProps = {
  /** Pixel shape. */
  variant?: PixelBlastVariant;
  /** Base pixel size, scaled by the buffer's pixel ratio. */
  pixelSize?: number;
  color?: string;
  /** Noise scale — larger is a busier, finer field. */
  patternScale?: number;
  /** How much of the field is lit. */
  patternDensity?: number;
  /** Random size variation between pixels, 0–1. */
  pixelSizeJitter?: number;
  /** Rings on click. */
  enableRipples?: boolean;
  rippleSpeed?: number;
  rippleThickness?: number;
  rippleIntensityScale?: number;
  /** Warp the whole frame along a decaying pointer trail. Costs a
   *  post-processing pass, and changing it rebuilds the pipeline. */
  liquid?: boolean;
  liquidStrength?: number;
  liquidRadius?: number;
  liquidWobbleSpeed?: number;
  /** Time scale. Reduced motion stops everything regardless. */
  speed?: number;
  /** How far in from each edge the field fades out, 0–1. */
  edgeFade?: number;
  /** Film grain over the result. Rebuilds the pipeline. */
  noiseAmount?: number;
  /** Clear to nothing rather than to black, so whatever is behind shows. */
  transparent?: boolean;
  antialias?: boolean;
  /** Buffer scale. Defaults to the screen's, capped at 2. Read once, at mount. */
  pixelRatio?: number;
  className?: string;
};

export function PixelBlast({
  variant = "square",
  pixelSize = 3,
  color = "#B497CF",
  patternScale = 2,
  patternDensity = 1,
  pixelSizeJitter = 0,
  enableRipples = true,
  rippleSpeed = 0.3,
  rippleThickness = 0.1,
  rippleIntensityScale = 1,
  liquid = false,
  liquidStrength = 0.1,
  liquidRadius = 1,
  liquidWobbleSpeed = 4.5,
  speed = 0.5,
  edgeFade = 0.5,
  noiseAmount = 0,
  transparent = true,
  antialias = true,
  pixelRatio,
  className = "",
}: PixelBlastProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const propsRef = useRef({
    variant,
    pixelSize,
    color,
    patternScale,
    patternDensity,
    pixelSizeJitter,
    enableRipples,
    rippleSpeed,
    rippleThickness,
    rippleIntensityScale,
    liquidStrength,
    liquidRadius,
    liquidWobbleSpeed,
    speed,
    edgeFade,
    transparent,
  });

  // No dependency array: this runs after every render, and it is declared before
  // the WebGL effect so the values are in place the first time the loop reads
  // them.
  useEffect(() => {
    propsRef.current = {
      variant,
      pixelSize,
      color,
      patternScale,
      patternDensity,
      pixelSizeJitter,
      enableRipples,
      rippleSpeed,
      rippleThickness,
      rippleIntensityScale,
      liquidStrength,
      liquidRadius,
      liquidWobbleSpeed,
      speed,
      edgeFade,
      transparent,
    };
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = pixelRatio ?? Math.min(window.devicePixelRatio || 1, 2);

    let renderer: THREE.WebGLRenderer;
    let material: THREE.ShaderMaterial;
    let geometry: THREE.PlaneGeometry;
    let scene: THREE.Scene;
    let camera: THREE.OrthographicCamera;
    let uniforms: {
      uResolution: { value: THREE.Vector2 };
      uTime: { value: number };
      uColor: { value: THREE.Color };
      uClickPos: { value: THREE.Vector2[] };
      uClickTimes: { value: Float32Array };
      uShapeType: { value: number };
      uPixelSize: { value: number };
      uScale: { value: number };
      uDensity: { value: number };
      uPixelJitter: { value: number };
      uEnableRipples: { value: number };
      uRippleSpeed: { value: number };
      uRippleThickness: { value: number };
      uRippleIntensity: { value: number };
      uEdgeFade: { value: number };
    };

    try {
      const canvas = document.createElement("canvas");
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias,
        alpha: true,
        powerPreference: "high-performance",
      });
      renderer.setPixelRatio(dpr);

      const p = propsRef.current;
      uniforms = {
        uResolution: { value: new THREE.Vector2(0, 0) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color(p.color) },
        uClickPos: {
          value: Array.from(
            { length: MAX_CLICKS },
            () => new THREE.Vector2(-1, -1),
          ),
        },
        uClickTimes: { value: new Float32Array(MAX_CLICKS) },
        uShapeType: { value: SHAPE_MAP[p.variant] ?? 0 },
        uPixelSize: { value: p.pixelSize * dpr },
        uScale: { value: p.patternScale },
        uDensity: { value: p.patternDensity },
        uPixelJitter: { value: p.pixelSizeJitter },
        uEnableRipples: { value: p.enableRipples ? 1 : 0 },
        uRippleSpeed: { value: p.rippleSpeed },
        uRippleThickness: { value: p.rippleThickness },
        uRippleIntensity: { value: p.rippleIntensityScale },
        uEdgeFade: { value: p.edgeFade },
      };

      scene = new THREE.Scene();
      camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      material = new THREE.ShaderMaterial({
        vertexShader: VERTEX_SRC,
        fragmentShader: FRAGMENT_SRC,
        uniforms,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        glslVersion: THREE.GLSL3,
      });
      geometry = new THREE.PlaneGeometry(2, 2);
      scene.add(new THREE.Mesh(geometry, material));
    } catch {
      return;
    }

    const canvas = renderer.domElement;
    canvas.className = "pixel-blast__canvas";
    container.appendChild(canvas);

    // Random, so two of these on one page are not in step — and so a reload
    // does not always open on the same frame of the noise.
    const timeOffset = Math.random() * 1000;

    let composer: EffectComposer | undefined;
    let touch: TouchTexture | undefined;
    let liquidEffect: Effect | undefined;
    let noiseEffect: Effect | undefined;

    if (liquid) {
      touch = createTouchTexture();
      touch.radiusScale = propsRef.current.liquidRadius;
      composer = new EffectComposer(renderer);
      composer.addPass(new RenderPass(scene, camera));
      liquidEffect = new Effect("LiquidEffect", LIQUID_FRAGMENT_SRC, {
        // Annotated, or the map takes its value type from the first entry and
        // every numeric uniform after the texture is a type error.
        uniforms: new Map<string, THREE.Uniform>([
          ["uTexture", new THREE.Uniform(touch.texture)],
          ["uStrength", new THREE.Uniform(propsRef.current.liquidStrength)],
          ["uTime", new THREE.Uniform(0)],
          ["uFreq", new THREE.Uniform(propsRef.current.liquidWobbleSpeed)],
        ]),
      });
      composer.addPass(new EffectPass(camera, liquidEffect));
    }

    if (noiseAmount > 0) {
      if (!composer) {
        composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
      }
      noiseEffect = new Effect("NoiseEffect", NOISE_FRAGMENT_SRC, {
        uniforms: new Map([
          ["uTime", new THREE.Uniform(0)],
          ["uAmount", new THREE.Uniform(noiseAmount)],
        ]),
      });
      composer.addPass(new EffectPass(camera, noiseEffect));
    }

    let raf = 0;
    let lastTime = performance.now();
    let elapsed = 0;

    const draw = () => {
      const p = propsRef.current;

      uniforms.uTime.value = timeOffset + elapsed * 0.001;
      uniforms.uShapeType.value = SHAPE_MAP[p.variant] ?? 0;
      uniforms.uPixelSize.value = p.pixelSize * dpr;
      uniforms.uColor.value.set(p.color);
      uniforms.uScale.value = p.patternScale;
      uniforms.uDensity.value = p.patternDensity;
      uniforms.uPixelJitter.value = p.pixelSizeJitter;
      uniforms.uEnableRipples.value = p.enableRipples ? 1 : 0;
      uniforms.uRippleSpeed.value = p.rippleSpeed;
      uniforms.uRippleThickness.value = p.rippleThickness;
      uniforms.uRippleIntensity.value = p.rippleIntensityScale;
      uniforms.uEdgeFade.value = p.edgeFade;

      if (p.transparent) renderer.setClearAlpha(0);
      else renderer.setClearColor(0x000000, 1);

      if (liquidEffect) {
        // Written to the uniform rather than to the effect, which is where
        // upstream puts it and why its `liquidStrength` prop does nothing.
        liquidEffect.uniforms.get("uStrength")!.value = p.liquidStrength;
        liquidEffect.uniforms.get("uFreq")!.value = p.liquidWobbleSpeed;
        liquidEffect.uniforms.get("uTime")!.value = uniforms.uTime.value;
      }
      if (noiseEffect) {
        noiseEffect.uniforms.get("uTime")!.value = uniforms.uTime.value;
      }
      if (touch) {
        touch.radiusScale = p.liquidRadius;
        touch.update();
      }

      if (composer) composer.render();
      else renderer.render(scene, camera);
    };

    const resize = () => {
      const w = Math.max(1, container.clientWidth);
      const h = Math.max(1, container.clientHeight);
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(canvas.width, canvas.height);
      composer?.setSize(canvas.width, canvas.height);
      // A still frame is not redrawn by any loop, so it has to be redrawn here
      // or the canvas is blank until something else asks for a frame.
      draw();
    };

    const loop = (t: number) => {
      const delta = t - lastTime;
      lastTime = t;
      elapsed += delta * propsRef.current.speed;
      draw();
      raf = requestAnimationFrame(loop);
    };

    const play = () => {
      if (raf || still || document.hidden) return;
      // Re-anchored, or the first frame back advances the clock by the whole
      // pause and the field jumps.
      lastTime = performance.now();
      raf = requestAnimationFrame(loop);
    };

    const pause = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    /** Where an event falls in the buffer, or null if it missed this element. */
    const mapToBuffer = (event: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return null;
      return {
        fx: (x / rect.width) * canvas.width,
        // Flipped: the shader works in gl_FragCoord, whose origin is bottom-left.
        fy: ((rect.height - y) / rect.height) * canvas.height,
      };
    };

    let clickIx = 0;
    const onPointerDown = (event: PointerEvent) => {
      if (still || !propsRef.current.enableRipples) return;
      const point = mapToBuffer(event);
      if (!point) return;
      uniforms.uClickPos.value[clickIx].set(point.fx, point.fy);
      uniforms.uClickTimes.value[clickIx] = uniforms.uTime.value;
      clickIx = (clickIx + 1) % MAX_CLICKS;
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!touch || still) return;
      const point = mapToBuffer(event);
      if (!point) return;
      touch.addTouch({ x: point.fx / canvas.width, y: point.fy / canvas.height });
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

    window.addEventListener("pointerdown", onPointerDown, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      pause();
      io?.disconnect();
      ro.disconnect();
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      composer?.dispose();
      touch?.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (canvas.parentNode === container) container.removeChild(canvas);
    };
    // Only what the pipeline is built from. Everything else is read through
    // propsRef, so changing it never tears the context down.
  }, [antialias, liquid, noiseAmount, pixelRatio]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className={`pixel-blast ${className}`.trim()}
    />
  );
}

export default PixelBlast;
