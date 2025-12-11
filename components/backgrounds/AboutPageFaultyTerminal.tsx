"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type HTMLAttributes } from "react";
import { Color, Mesh, Program, Renderer, Texture, Triangle } from "ogl";

// Brand gradient colors reused from the Careers background. One of these will
// be selected at random (per bundle load) to tint the mosaic glyphs.
const CAREERS_GRADIENT_COLORS = [
  "#0065ab",
  "#0067af",
  "#006ab3",
  "#006db7",
  "#0070bb",
  "#0075c2",
  "#0079c7",
  "#007fce",
  "#0085d5",
  "#008bdb",
  "#0092e1",
  "#0098e6",
  "#009ce8",
  "#00a0e9",
  "#00a2e5",
  "#00a5dd",
  "#00a9d3",
  "#00accc",
  "#00afc4",
  "#00b1ba",
  "#00b3b0",
  "#00b1a1",
  "#00af92",
  "#00ad84",
  "#00ab76",
  "#00a769",
  "#00a35e",
  "#009f54",
  "#009b4b",
  "#009745",
  "#009441",
  "#00914d",
  "#00905b",
  "#008f69",
  "#008f76",
  "#009082",
  "#00938e",
  "#00969a",
  "#009aa4",
  "#009fae",
  "#00a4b7",
  "#00a9bf",
  "#00aec6",
  "#00b2cc",
  "#00b6d1",
  "#00b9d6",
  "#00bcd9",
  "#00bfdd",
  "#00c2e0",
  "#00c4e3",
];

const DEFAULT_MOSAIC_TINT =
  CAREERS_GRADIENT_COLORS[Math.floor(Math.random() * CAREERS_GRADIENT_COLORS.length)];

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

// Fragment shader: renders the glyph grid across the full screen.
// The logo-related uniforms and helpers remain available but are not used
// to clip or mask the glyphs in this configuration. Each glyph cell also
// selects a brand color from the careers palette so symbols adopt a
// multi-color mosaic.
const fragmentShader = `
precision highp float;

varying vec2 vUv;

uniform float iTime;
uniform vec3 iResolution;
uniform float uScale;
uniform vec2 uGridMul;
uniform float uDigitSize;
uniform float uScanlineIntensity;
uniform float uGlitchAmount;
uniform float uFlickerAmount;
uniform float uNoiseAmp;
uniform float uChromaticAberration;
uniform float uDither;
uniform float uCurvature;
uniform vec3 uTint;
uniform vec2 uMouse;
uniform float uBrightness;

uniform sampler2D uGlyphAtlas;
uniform float uGlyphCols;
uniform float uGlyphRows;
uniform float uScriptMix;

float time;

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
}

// --- Per-glyph brand color palette --------------------------------------
// Matches the CAREERS_GRADIENT_COLORS list in TS, but encoded as normalized
// RGB values for use directly in the shader.

const int PALETTE_SIZE = 52;

vec3 getBrandColor(int i) {
  int idx = int(mod(float(i), float(PALETTE_SIZE)));

  if (idx == 0)  return vec3(0.0, 0.396, 0.671); // #0065ab
  if (idx == 1)  return vec3(0.0, 0.404, 0.686); // #0067af
  if (idx == 2)  return vec3(0.0, 0.416, 0.702); // #006ab3
  if (idx == 3)  return vec3(0.0, 0.427, 0.718); // #006db7
  if (idx == 4)  return vec3(0.0, 0.439, 0.733); // #0070bb
  if (idx == 5)  return vec3(0.0, 0.459, 0.761); // #0075c2
  if (idx == 6)  return vec3(0.0, 0.475, 0.780); // #0079c7
  if (idx == 7)  return vec3(0.0, 0.498, 0.808); // #007fce
  if (idx == 8)  return vec3(0.0, 0.521, 0.835); // #0085d5
  if (idx == 9)  return vec3(0.0, 0.545, 0.859); // #008bdb
  if (idx == 10) return vec3(0.0, 0.573, 0.882); // #0092e1
  if (idx == 11) return vec3(0.0, 0.596, 0.902); // #0098e6
  if (idx == 12) return vec3(0.0, 0.612, 0.910); // #009ce8
  if (idx == 13) return vec3(0.0, 0.627, 0.914); // #00a0e9
  if (idx == 14) return vec3(0.0, 0.635, 0.898); // #00a2e5
  if (idx == 15) return vec3(0.0, 0.647, 0.867); // #00a5dd
  if (idx == 16) return vec3(0.0, 0.663, 0.827); // #00a9d3
  if (idx == 17) return vec3(0.0, 0.675, 0.800); // #00accc
  if (idx == 18) return vec3(0.0, 0.686, 0.769); // #00afc4
  if (idx == 19) return vec3(0.0, 0.695, 0.729); // #00b1ba
  if (idx == 20) return vec3(0.0, 0.702, 0.690); // #00b3b0
  if (idx == 21) return vec3(0.0, 0.694, 0.631); // #00b1a1
  if (idx == 22) return vec3(0.0, 0.686, 0.573); // #00af92
  if (idx == 23) return vec3(0.0, 0.678, 0.518); // #00ad84
  if (idx == 24) return vec3(0.0, 0.671, 0.463); // #00ab76
  if (idx == 25) return vec3(0.0, 0.655, 0.412); // #00a769
  if (idx == 26) return vec3(0.0, 0.639, 0.373); // #00a35e
  if (idx == 27) return vec3(0.0, 0.624, 0.329); // #009f54
  if (idx == 28) return vec3(0.0, 0.608, 0.294); // #009b4b
  if (idx == 29) return vec3(0.0, 0.592, 0.271); // #009745
  if (idx == 30) return vec3(0.0, 0.580, 0.255); // #009441
  if (idx == 31) return vec3(0.0, 0.569, 0.302); // #00914d
  if (idx == 32) return vec3(0.0, 0.565, 0.357); // #00905b
  if (idx == 33) return vec3(0.0, 0.561, 0.412); // #008f69
  if (idx == 34) return vec3(0.0, 0.561, 0.463); // #008f76
  if (idx == 35) return vec3(0.0, 0.565, 0.510); // #009082
  if (idx == 36) return vec3(0.0, 0.576, 0.557); // #00938e
  if (idx == 37) return vec3(0.0, 0.588, 0.604); // #00969a
  if (idx == 38) return vec3(0.0, 0.604, 0.643); // #009aa4
  if (idx == 39) return vec3(0.0, 0.624, 0.682); // #009fae
  if (idx == 40) return vec3(0.0, 0.643, 0.718); // #00a4b7
  if (idx == 41) return vec3(0.0, 0.663, 0.749); // #00a9bf
  if (idx == 42) return vec3(0.0, 0.682, 0.776); // #00aec6
  if (idx == 43) return vec3(0.0, 0.698, 0.800); // #00b2cc
  if (idx == 44) return vec3(0.0, 0.714, 0.820); // #00b6d1
  if (idx == 45) return vec3(0.0, 0.725, 0.839); // #00b9d6
  if (idx == 46) return vec3(0.0, 0.737, 0.851); // #00bcd9
  if (idx == 47) return vec3(0.0, 0.749, 0.867); // #00bfdd
  if (idx == 48) return vec3(0.0, 0.761, 0.878); // #00c2e0
  if (idx == 49) return vec3(0.0, 0.769, 0.890); // #00c4e3

  // Fallback, though we should never hit this if PALETTE_SIZE is correct.
  return vec3(1.0);
}

// t in [0,1] → blended color across the palette along the careers gradient
vec3 sampleBrandPalette(float t) {
  float x = clamp(t, 0.0, 1.0) * float(PALETTE_SIZE - 1);
  int i0 = int(floor(x));
  int i1 = int(min(float(PALETTE_SIZE - 1), float(i0 + 1)));
  float f = fract(x);
  vec3 c0 = getBrandColor(i0);
  vec3 c1 = getBrandColor(i1);
  return mix(c0, c1, f);
}

float rand(vec2 n) {
  return fract(sin(dot(n, vec2(12.9898, 78.233))) * 43758.5453);
}

float noise(vec2 p) {
  return sin(p.x * 10.0) * sin(p.y * (3.0 + sin(time * 0.090909))) + 0.2;
}

mat2 rotate(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat2(c, -s, s, c);
}

float fbm(vec2 p) {
  p *= 1.1;
  float f = 0.0;
  float amp = 0.5 * uNoiseAmp;
  
  mat2 modify0 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify0 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify1 = rotate(time * 0.02);
  f += amp * noise(p);
  p = modify1 * p * 2.0;
  amp *= 0.454545;
  
  mat2 modify2 = rotate(time * 0.08);
  f += amp * noise(p);
  
  return f;
}

float pattern(vec2 p, out vec2 q, out vec2 r) {
  vec2 offset1 = vec2(1.0);
  vec2 offset0 = vec2(0.0);
  
  mat2 rot01 = rotate(0.1 * time);
  mat2 rot1 = rotate(0.1);
  
  q = vec2(fbm(p + offset1), fbm(rot01 * p + offset1));
  r = vec2(fbm(rot1 * q + offset0), fbm(q + offset0));
  
  return fbm(p + r);
}

vec4 sampleGlyph(vec2 cellCoord, vec2 cellUV) {
  // Match main-page behavior: use a slightly more complex seed so adjacent
  // rows are much less likely to share identical random streams, then sample
  // uniformly across the full atlas grid so every populated cell is reachable.
  float r = rand(vec2(
    cellCoord.x * 1.1234,
    cellCoord.y * 1.234567 + cellCoord.x * 0.1234
  ));

  float totalCells = uGlyphCols * uGlyphRows;
  float glyphIndex = floor(r * totalCells);
  
  float col = mod(glyphIndex, uGlyphCols);
  float row = floor(glyphIndex / uGlyphCols);
  
  vec2 atlasUV = (vec2(col, row) + cellUV) / vec2(uGlyphCols, uGlyphRows);
  return texture2D(uGlyphAtlas, atlasUV);
}

float digit(vec2 p) {
  vec2 grid = uGridMul * 15.0;
  vec2 cellCoord = floor(p * grid);
  vec2 s = cellCoord / grid;
  p = p * grid;
  
  vec2 q, r;
  float intensity = pattern(s * 0.1, q, r) * 1.3 - 0.03;
  
  vec2 cellUV = fract(p);
  cellUV *= uDigitSize;
  
  if (cellUV.x < 0.0 || cellUV.x > 1.0 || cellUV.y < 0.0 || cellUV.y > 1.0) return 0.0;
  
  vec4 glyphSample = sampleGlyph(cellCoord, cellUV);
  float glyphAlpha = glyphSample.r;
  
  float isOn = step(0.1, intensity);
  float brightness = isOn * glyphAlpha * (0.3 + cellUV.y * 0.7);
  
  return step(0.0, cellUV.x) * step(cellUV.x, 1.0) *
         step(0.0, cellUV.y) * step(cellUV.y, 1.0) * brightness;
}

float onOff(float a, float b, float c) {
  return step(c, sin(iTime + a * cos(iTime * b))) * uFlickerAmount;
}

float displace(vec2 look) {
  float y = look.y - mod(iTime * 0.25, 1.0);
  float window = 1.0 / (1.0 + 50.0 * y * y);
  return sin(look.y * 20.0 + iTime) * 0.0125 * onOff(4.0, 2.0, 0.8) * (1.0 + cos(iTime * 60.0)) * window;
}

vec2 barrel(vec2 uv){
  vec2 c = uv * 2.0 - 1.0;
  float r2 = dot(c, c);
  c *= 1.0 + uCurvature * r2;
  return c * 0.5 + 0.5;
}

// Computes the base glyph color for a given position p. Each glyph cell then
// independently selects a brand color from the careers palette using a
// hash-based index so symbols are multi-colored across the mosaic.
vec3 getColor(vec2 p, vec4 mask) {
  float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
  bar *= uScanlineIntensity;
  
  // Derive a stable cell coordinate for per-glyph palette lookup before
  // displacement is applied, so colors are stable over time for each cell.
  vec2 grid = uGridMul * 15.0;
  vec2 cellCoord = floor(p * grid);

  float displacement = displace(p);
  p.x += displacement;
  
  if (uGlitchAmount != 1.0) {
    float extra = displacement * (uGlitchAmount - 1.0);
    p.x += extra;
  }
  
  float middle = digit(p);
  
  const float off = 0.002;
  float sum = digit(p + vec2(-off, -off)) +
              digit(p + vec2(0.0, -off)) +
              digit(p + vec2(off, -off)) +
              digit(p + vec2(-off, 0.0)) +
              digit(p + vec2(0.0, 0.0)) +
              digit(p + vec2(off, 0.0)) +
              digit(p + vec2(-off, off)) +
              digit(p + vec2(0.0, off)) +
              digit(p + vec2(off, off));
  
  // Base intensity derived from glyph brightness and scanlines.
  vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;

  // Use cellCoord to derive a palette index. This is stable over time for
  // each glyph cell, and distributes the careers colors pseudo-randomly
  // across the mosaic. Match main-page hashing so both mosaics share
  // similar per-glyph palette variation.
  float colorRand = hash21(vec2(
    cellCoord.x * 0.9187,
    cellCoord.y * 1.137
  ));
  int colorIndex = int(floor(colorRand * float(PALETTE_SIZE)));
  vec3 brandColor = getBrandColor(colorIndex);

  // Use the careers palette as the primary hue; baseColor only controls
  // intensity so the per-glyph coloration is clearly visible.
  float intensity = (middle + sum * 0.3) * bar;
  return brandColor * intensity;
}

void main() {
  time = iTime * 0.333333;
  
  vec2 uv = vUv;
  // Reference behavior: glyphs are drawn across the entire screen without
  // clipping to the logo shape. The logo mask remains available for future
  // use but does not affect rendering here.
  vec4 mask = vec4(0.0);
  
  if(uCurvature != 0.0){
    uv = barrel(uv);
  }
  
  vec2 p = uv * uScale;
  vec3 col = getColor(p, mask);
  
  if(uChromaticAberration != 0.0){
    vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
    col.r = getColor(p + ca, mask).r;
    col.b = getColor(p - ca, mask).b;
  }
  
  col *= uTint;
  col *= uBrightness;
  // No additional masking: glyphs remain visible across the full background.
  
  if(uDither > 0.0){
    float rnd = hash21(gl_FragCoord.xy);
    col += (rnd - 0.5) * (uDither * 0.003922);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`;

type AboutPageBackgroundMosaicProps = FaultyTerminalProps;

interface FaultyTerminalProps extends HTMLAttributes<HTMLDivElement> {
  scale?: number;
  gridMul?: [number, number];
  digitSize?: number;
  timeScale?: number;
  pause?: boolean;
  scanlineIntensity?: number;
  glitchAmount?: number;
  flickerAmount?: number;
  noiseAmp?: number;
  chromaticAberration?: number;
  dither?: number | boolean;
  curvature?: number;
  tint?: string;
  mouseReact?: boolean;
  mouseStrength?: number;
  dpr?: number;
  pageLoadAnimation?: boolean;
  brightness?: number;
  glyphAtlasCols?: number;
  glyphAtlasRows?: number;
}

interface MousePosition {
  x: number;
  y: number;
}

const getDevicePixelRatio = () => (typeof window === "undefined" ? 1 : Math.min(window.devicePixelRatio || 1, 2));

type GLResource = { delete?: () => void };

const safeDelete = (resource: GLResource | null | undefined) => {
  if (resource && typeof resource.delete === "function") {
    resource.delete();
  }
};

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace("#", "").trim();
  if (h.length === 3) {
    h = h.split("").map((c) => c + c).join("");
  }
  const num = parseInt(h, 16);
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

// Atlas generator: kept in sync with MainPageBackgroundMosaic so both
// mosaics share the same extended character set plus tuned Katakana /
// Hangul frequencies. If you change chars or grid size here, mirror it
// in the main-page background as well.
function createGlyphAtlasCanvas(cols: number = 24, rows: number = 24): HTMLCanvasElement { // Glyph (mosaic) atlas canvas size **************************************************************************************************************************************************//
  const canvas = document.createElement("canvas");
  const size = 1024;
  const cellSize = size / cols;

  canvas.width = size;
  canvas.height = size;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get 2D context for glyph atlas canvas");
  }

  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, size, size);

  ctx.fillStyle = "#fff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const chars: string[] = [
    "A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z",
    "a","b","c","d","e","f","g","h","i","j","k","l","m","n","o",
    // Match main-page atlas: further slimmed Katakana subset to lower overall
    // frequency while still keeping a small Japanese presence in the mosaic.
    "ア","ウ","カ","ラ",
    // Match main-page atlas: slimmed Hangul subset to modestly reduce its
    // share while preserving recognizable Korean presence.
    "가","나","다","라","마","바","사","아","자","차","카","타","파","하",
    "ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص","ض","ط","ظ","ع","غ","ف",
    "ق","ك","ل","م","ن","ه","و","ي","ة","ى","ء","آ","أ","ؤ","إ","ئ","ـ","ً","ٌ","ٍ","َ","ُ",
    "p","q","r","s","t","u","v","w","x","y","z","À","Á","Â","Ã","Ä","Å","Æ","Ç","È","É",
    "Ê","Ë","Ì","Í","Î","Ï","Ð","Ñ","Ò","Ó","Ô","Õ","Ö","Ø","Ù","Ú","Û","Ü","Ý","Þ","ß","ö",
    "0","1","2","3","4","5","6","7","8","9","!","@","#","$","%","^","&","*","(",")","[","]",
    "{","}","<",">","?","/","\\","|","-","_","+","=","~","`","\"","'",";",":",
    "अ","आ","इ","ई","उ","ऊ","ऋ","ए","ऐ","ओ","औ","अं","अः","क","ख","ग","क्ष","त्र","ज्ञ",
    "α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","σ","τ","υ","φ","χ","ψ","ω",
    "🜁","🜂","🜃","🜄","🜇","🜊","🜍","🜎","🜏",
    "𓀀","𓀁","𓀃","𓀋","𓁐","𓁛","𓂀","𓂋","𓂝","𓃀","𓃭","𓄿","𓅓","𓅱","𓆑","𓇋","𓇳","𓈖","𓊃","𓋴","𓎛","𓎡","𓏏","𓐍",
    "𒀭","𒀸","𒂊","𒄑","𒇲","𒉿","𒋫","𒍪","𒐊","ༀ", // Cuneiform //
    "༄","༅","༆","༇","༈","༉","༊","་","༌","།།","༎","༏","༐","༑","༒","༓","༔","༕","༗","༘","༙","༚","༛","༜","༝","༞","༟",
    "Ա","Բ","Գ","Դ","Ե","Զ","Է","Ը","Թ","Ժ","Ի","Լ","Խ","Ծ","Կ","Հ","Ձ","Ղ","Ճ","Մ","Յ","Ն","Շ","Ո","Չ","Պ","Ջ","Ռ","Ս","Վ","Տ","Ր","Ց","Ւ","Փ","Ք","Օ","Ֆ","ա","բ","գ","դ","ե","զ","է","ը","թ","ժ","ի","լ","խ","ծ","կ","հ","ձ","ղ","ճ","մ","յ","ն","շ","ո","չ","պ","ջ","ռ","ս","վ","տ","ր","ց","ւ","փ","ք","օ","ֆ",
    "∞","≈","≠","≥","≤","√","∑","∂","∫","∆","∇","∈","⊂","⊃","⊆","⊇","⊕","⊗","∀","∃","∅","∧","∨","¬","∴","∵","±","÷","×","∝","∠","∪","∩"
  ];

  const maxCells = cols * rows;

  chars.forEach((char, i) => {
    if (i >= maxCells) return; // Only draw up to the available grid cells

    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;

    ctx.font = `bold ${cellSize * 0.7}px Arial, "Noto Sans CJK", sans-serif`;
    ctx.fillText(char, x, y);
  });

  return canvas;
}

export default function AboutPageBackgroundMosaic({
  // Overall zoom of the glyph grid; larger = denser glyphs.
  // Increasing this makes the pattern denser so individual characters
  // *appear* smaller on screen without changing their sampling footprint.
  scale = 0.985,
  // Multiplier that stretches the grid in X/Y.
  gridMul = [2, 1],
  // Base glyph size in shader space (lower = smaller characters). Keeping
  // this at 1.2 avoids truncation artifacts inside each glyph cell.********************************************************************************************************************************************************************************************************SIZE
  digitSize = 2.095, // (1.995) // "Apparent Size" arg // **********************************************************************************************************************************************************************************************************************************
  timeScale = 0.2357, // (3.834) //
  pause = false,
  scanlineIntensity = 0.5832, // (0.5832) //
  glitchAmount = 0.9,
  // Slightly reduced from 1 to soften the global flicker effect.
  flickerAmount = 1891, ///////////////////////////////////(this is the ending "fizzle out" effect /////////////////////////////////////////////////////***********************************************************************************************************************************************
  noiseAmp = 5.025, //5.025//
  chromaticAberration = 1.95,
  dither = 0, // zero //
  curvature = 0.15, // Curves and curvature that modualtes the appearance of the entire mosaic //**************************************************************************************************************************************************************************************************************
  // Default tint: neutral white so the diagonal palette gradient in
  // the shader is the primary source of color.
  tint = "#c2c2c2ff",
  mouseReact = true,
  mouseStrength = 0.0025,
  dpr: dprProp,
  pageLoadAnimation = true,
  brightness = 1.950,
  glyphAtlasCols = 24,
  glyphAtlasRows = 24,
  className,
  style,
  ...rest
}: AboutPageBackgroundMosaicProps) {
  const [dpr] = useState(() => dprProp ?? getDevicePixelRatio());
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mouseRef = useRef<MousePosition>({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef<MousePosition>({ x: 0.5, y: 0.5 });
  const frozenTimeRef = useRef(0);
  const rafRef = useRef(0);
  const loadAnimationStartRef = useRef(0);
  const timeOffsetRef = useRef(Math.random() * 9.9);  // Glitch amount is driven by a tiny internal state machine that *alternates* between two discrete strengths (9 and 29). A random timer controls when the toggle happens so the pattern does not feel mechanically periodic. The prop `glitchAmount`still acts as the *initial* value for this state.
  const glitchAmountRef = useRef(glitchAmount || 1);
  const nextGlitchToggleRef = useRef(0);

  const tintVec = useMemo(() => hexToRgb(tint), [tint]);
  const ditherValue = useMemo(() => (typeof dither === "boolean" ? (dither ? 1 : 0) : dither), [dither]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ctn = containerRef.current;
    if (!ctn) return;
    const rect = ctn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current = { x, y };
  }, []);

  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;

    const renderer = new Renderer({ dpr });
    rendererRef.current = renderer;
    const { gl } = renderer;
    gl.clearColor(0, 0, 0, 1);

    const geometry = new Triangle(gl);

    const glyphAtlasCanvas = createGlyphAtlasCanvas(glyphAtlasCols, glyphAtlasRows);
    const glyphAtlas = new Texture(gl, {
      image: glyphAtlasCanvas,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR,
    });

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height),
        },
        uScale: { value: scale },
        uGridMul: { value: new Float32Array(gridMul) },
        uDigitSize: { value: digitSize },
        uScanlineIntensity: { value: scanlineIntensity },
        uGlitchAmount: { value: glitchAmount },
        uFlickerAmount: { value: flickerAmount },
        uNoiseAmp: { value: noiseAmp },
        uChromaticAberration: { value: chromaticAberration },
        uDither: { value: ditherValue },
        uCurvature: { value: curvature },
        uTint: { value: new Color(tintVec[0], tintVec[1], tintVec[2]) },
        uMouse: { value: new Float32Array([smoothMouseRef.current.x, smoothMouseRef.current.y]) },
        uMouseStrength: { value: mouseStrength },
        uUseMouse: { value: mouseReact ? 1 : 0 },
        uPageLoadProgress: { value: pageLoadAnimation ? 0 : 1 },
        uUsePageLoadAnimation: { value: pageLoadAnimation ? 1 : 0 },
        uBrightness: { value: brightness },
        uGlyphAtlas: { value: glyphAtlas },
        uGlyphCols: { value: glyphAtlasCols },
        uGlyphRows: { value: glyphAtlasRows },
        uScriptMix: { value: 0 },
      },
    });

    programRef.current = program;
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      if (!ctn || !renderer) return;
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      program.uniforms.iResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height,
      );
    };

    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(ctn);
    resize();

    const update = (t: number) => {
      rafRef.current = requestAnimationFrame(update);

      if (pageLoadAnimation && loadAnimationStartRef.current === 0) {
        loadAnimationStartRef.current = t;
      }

      if (!pause) {
        const elapsed = (t * 0.0009 + timeOffsetRef.current) * timeScale; ////////////////////////////////////////////////////////////// Rate of character switch as well ///////////////////////////////////////////////////////////////////////
        program.uniforms.iTime.value = elapsed;
        frozenTimeRef.current = elapsed;
        program.uniforms.uScriptMix.value = (elapsed * 4.0) % 1; ////////////////////////////// Symbol/Character/Letter switch frequency/////////////////////***********************************************************************************************************

        // Random-timed alternating glitch:
        //   - Values: hard-switch between 9 and 29.
        //   - Timing: toggle occurs every ~0.8–1.6 seconds, with the
        //     exact moment jittered by Math.random() so the effect
        //     feels organic rather than locked to a fixed rhythm.
        if (elapsed > nextGlitchToggleRef.current) {
          const interval = 190.8 + Math.random() * 99.2; // seconds
          nextGlitchToggleRef.current = elapsed + interval;

          // Alternate deterministically between the two glitch bands.
          glitchAmountRef.current = glitchAmountRef.current === 4 ? 19 : 4;
        }

        // Push the current glitch amount into the shader uniform every frame*****************************************************************************************************************Glitch Effect Animation
        // so changes are immediately visible in the mosaic distortion.
        program.uniforms.uGlitchAmount.value = glitchAmountRef.current;
      } else {
        program.uniforms.iTime.value = frozenTimeRef.current;
      }

      if (pageLoadAnimation && loadAnimationStartRef.current > 0) {
        const animationDuration = 88000;
        const animationElapsed = t - loadAnimationStartRef.current;
        const progress = Math.min(animationElapsed / animationDuration, 0.8);
        program.uniforms.uPageLoadProgress.value = progress;
      }

      if (mouseReact) {
        const dampingFactor = 0.08;
        const smoothMouse = smoothMouseRef.current;
        const mouse = mouseRef.current;

        smoothMouse.x += (mouse.x - smoothMouse.x) * dampingFactor;
        smoothMouse.y += (mouse.y - smoothMouse.y) * dampingFactor;

        const mouseUniform = program.uniforms.uMouse.value as Float32Array;
        mouseUniform[0] = smoothMouse.x;
        mouseUniform[1] = smoothMouse.y;
      }

      renderer.render({ scene: mesh });
    };

    rafRef.current = requestAnimationFrame(update);
    ctn.appendChild(gl.canvas);

    if (mouseReact) ctn.addEventListener("mousemove", handleMouseMove);

    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      if (mouseReact) ctn.removeEventListener("mousemove", handleMouseMove);
      if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);

      safeDelete(glyphAtlas as GLResource);
      safeDelete(program as GLResource);
      safeDelete(geometry as GLResource);
      gl.getExtension("WEBGL_lose_context")?.loseContext();

      loadAnimationStartRef.current = 0;
      timeOffsetRef.current = Math.random() * 100;
    };
  }, [
    brightness,
    chromaticAberration,
    curvature,
    digitSize,
    ditherValue,
    dpr,
    flickerAmount,
    glitchAmount,
    glyphAtlasCols,
    glyphAtlasRows,
    gridMul,
    handleMouseMove,
    mouseReact,
    mouseStrength,
    noiseAmp,
    pageLoadAnimation,
    pause,
    scale,
    scanlineIntensity,
    tintVec,
    timeScale,
  ]);

  useEffect(() => {
    const program = programRef.current;
    if (!program) return;

    program.uniforms.uScale.value = scale;
    program.uniforms.uGridMul.value = new Float32Array(gridMul);
    program.uniforms.uDigitSize.value = digitSize;
    program.uniforms.uScanlineIntensity.value = scanlineIntensity;
    program.uniforms.uGlitchAmount.value = glitchAmount;
    program.uniforms.uFlickerAmount.value = flickerAmount;
    program.uniforms.uNoiseAmp.value = noiseAmp;
    program.uniforms.uChromaticAberration.value = chromaticAberration;
    program.uniforms.uDither.value = ditherValue;
    program.uniforms.uCurvature.value = curvature;
    program.uniforms.uTint.value = new Color(tintVec[0], tintVec[1], tintVec[2]);
    program.uniforms.uMouseStrength.value = mouseStrength;
    program.uniforms.uUseMouse.value = mouseReact ? 1 : 0;
    program.uniforms.uUsePageLoadAnimation.value = pageLoadAnimation ? 1 : 0;
    program.uniforms.uBrightness.value = brightness;
  }, [
    brightness,
    chromaticAberration,
    curvature,
    digitSize,
    ditherValue,
    flickerAmount,
    glitchAmount,
    gridMul,
    mouseReact,
    mouseStrength,
    noiseAmp,
    pageLoadAnimation,
    scale,
    scanlineIntensity,
    tintVec,
  ]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        overflow: "hidden",
        backgroundColor: "#000",
        ...style,
      }}
      {...rest}
    />
  );
}
