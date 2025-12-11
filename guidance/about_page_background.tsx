import { Renderer, Program, Mesh, Color, Triangle, Texture } from 'ogl';
import { useEffect, useRef, useMemo, useCallback } from 'react';

const vertexShader = `
attribute vec2 position;
attribute vec2 uv;
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

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
uniform float uMouseStrength;
uniform float uUseMouse;
uniform float uPageLoadProgress;
uniform float uUsePageLoadAnimation;
uniform float uBrightness;

uniform sampler2D uGlyphAtlas;
uniform float uGlyphCols;
uniform float uGlyphRows;

uniform sampler2D uLogoMask;
uniform vec2 uLogoOffset;
uniform vec2 uLogoScale;

uniform float uScriptMix;

float time;

float hash21(vec2 p){
  p = fract(p * 234.56);
  p += dot(p, p + 34.56);
  return fract(p.x * p.y);
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
  float r = rand(cellCoord);
  float scriptSelector = fract(r + uScriptMix);
  
  float glyphIndex;
  
  // Evenly distribute across 6 writing systems (1/6 = 0.16666...)
  if (scriptSelector < 0.16666) {
    glyphIndex = floor(mix(0.0, 41.0, r)); // English/French/German (Latin)
  } else if (scriptSelector < 0.33333) {
    glyphIndex = floor(mix(42.0, 83.0, r)); // Japanese (Hiragana/Katakana)
  } else if (scriptSelector < 0.5) {
    glyphIndex = floor(mix(84.0, 125.0, r)); // Korean (Hangul)
  } else if (scriptSelector < 0.66666) {
    glyphIndex = floor(mix(126.0, 167.0, r)); // Arabic
  } else if (scriptSelector < 0.83333) {
    glyphIndex = floor(mix(168.0, 209.0, r)); // More Latin variants
  } else {
    glyphIndex = floor(mix(210.0, 255.0, r)); // Punctuation/symbols
  }
  
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
  
  if(uUseMouse > 0.5){
    vec2 mouseWorld = uMouse * uScale;
    float distToMouse = distance(s, mouseWorld);
    float mouseInfluence = exp(-distToMouse * 8.0) * uMouseStrength * 10.0;
    intensity += mouseInfluence;
    
    float ripple = sin(distToMouse * 20.0 - iTime * 5.0) * 0.1 * mouseInfluence;
    intensity += ripple;
  }
  
  if(uUsePageLoadAnimation > 0.5){
    float cellRandom = fract(sin(dot(s, vec2(12.9898, 78.233))) * 43758.5453);
    float cellDelay = cellRandom * 0.8;
    float cellProgress = clamp((uPageLoadProgress - cellDelay) / 0.2, 0.0, 1.0);
    float fadeAlpha = smoothstep(0.0, 1.0, cellProgress);
    intensity *= fadeAlpha;
  }
  
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

vec4 logoMask(vec2 uv) {
  vec2 maskUv = (uv - uLogoOffset) / uLogoScale;
  maskUv.y = 1.0 - maskUv.y;
  
  if (maskUv.x < 0.0 || maskUv.x > 1.0 || maskUv.y < 0.0 || maskUv.y > 1.0) {
    return vec4(0.0);
  }
  
  vec4 mask = texture2D(uLogoMask, maskUv);
  return mask;
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

// Optimized color calculation - computes digit once and reuses
vec3 getColor(vec2 p, vec4 mask) {
  float bar = step(mod(p.y + time * 20.0, 1.0), 0.2) * 0.4 + 1.0;
  bar *= uScanlineIntensity;
  
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
  
  vec3 baseColor = vec3(0.9) * middle + sum * 0.1 * vec3(1.0) * bar;
  
  // Apply logo gradient color
  vec3 logoColor = mask.rgb;
  baseColor *= mix(vec3(1.0), logoColor * 2.0, mask.a);
  
  return baseColor;
}

void main() {
  time = iTime * 0.333333;
  
  vec2 uv = vUv;
  
  // Sample logo mask first with original UV
  vec4 mask = logoMask(uv);
  
  // If logo is fully opaque, render only the logo
  if (mask.a > 0.99) {
    vec3 logoColor = mask.rgb * uTint * uBrightness;
    gl_FragColor = vec4(logoColor, 1.0);
    return;
  }
  
  // If completely transparent, render black
  if (mask.a < 0.01) {
    gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  
  // Apply barrel distortion only to background effect
  if(uCurvature != 0.0){
    uv = barrel(uv);
  }
  
  vec2 p = uv * uScale;
  vec3 col = getColor(p, mask);
  
  // Optimized chromatic aberration - only for background
  if(uChromaticAberration != 0.0){
    vec2 ca = vec2(uChromaticAberration) / iResolution.xy;
    col.r = getColor(p + ca, mask).r;
    col.b = getColor(p - ca, mask).b;
  }
  
  col *= uTint;
  col *= uBrightness;
  col *= mask.a;
  
  if(uDither > 0.0){
    float rnd = hash21(gl_FragCoord.xy);
    col += (rnd - 0.5) * (uDither * 0.003922);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`;

interface FaultyTerminalProps extends React.HTMLAttributes<HTMLDivElement> {
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
  
  // New props for customization
  glyphAtlasCols?: number;
  glyphAtlasRows?: number;
  logoOffset?: [number, number];
  logoScale?: [number, number];
}

interface MousePosition {
  x: number;
  y: number;
}

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) {
    h = h.split('').map(c => c + c).join('');
  }
  const num = parseInt(h, 16);
  return [
    ((num >> 16) & 255) / 255,
    ((num >> 8) & 255) / 255,
    (num & 255) / 255
  ];
}

function createGlyphAtlasCanvas(cols: number = 16, rows: number = 16): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = 1024;
  const cellSize = size / cols;
  
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context for glyph atlas canvas');
  }
  
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  
  ctx.fillStyle = '#fff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Characters from different writing systems
  const chars: string[] = [
    // Latin (English/French/German)
    'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
    'a','b','c','d','e','f','g','h','i','j','k','l','m','n','o',
    
    // Japanese Katakana
    'ア','イ','ウ','エ','オ','カ','キ','ク','ケ','コ','サ','シ','ス','セ','ソ','タ','チ','ツ','テ','ト',
    'ナ','ニ','ヌ','ネ','ノ','ハ','ヒ','フ','ヘ','ホ','マ','ミ','ム','メ','モ','ヤ','ユ','ヨ','ラ','リ','ル','レ',
    
    // Korean Hangul
    '가','나','다','라','마','바','사','아','자','차','카','타','파','하','거','너','더','러','머','버',
    '서','어','저','처','커','터','퍼','허','고','노','도','로','모','보','소','오','조','초','코','토','포','호',
    
    // Arabic
    'ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف',
    'ق','ك','ل','م','ن','ه','و','ي','ة','ى','ء','آ','أ','ؤ','إ','ئ','ـ','ً','ٌ','ٍ','َ','ُ',
    
    // More Latin with accents
    'p','q','r','s','t','u','v','w','x','y','z','À','Á','Â','Ã','Ä','Å','Æ','Ç','È','É',
    'Ê','Ë','Ì','Í','Î','Ï','Ð','Ñ','Ò','Ó','Ô','Õ','Ö','Ø','Ù','Ú','Û','Ü','Ý','Þ','ß','ö',
    
    // Symbols
    '0','1','2','3','4','5','6','7','8','9','!','@','#','$','%','^','&','*','(',')','[',']',
    '{','}','<','>','?','/','\','|','-','_','+','=','~','`','"',"'",'.',',',':',';','©','®','™'
  ];
  
  chars.forEach((char, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = col * cellSize + cellSize / 2;
    const y = row * cellSize + cellSize / 2;
    
    ctx.font = `bold ${cellSize * 0.7}px Arial, "Noto Sans CJK", sans-serif`;
    ctx.fillText(char, x, y);
  });
  
  return canvas;
}

function createLogoMaskCanvas(): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  const size = 512;
  
  canvas.width = size;
  canvas.height = size;
  
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context for logo mask canvas');
  }
  
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, size, size);
  
  const centerX = size / 2;
  const centerY = size / 2;
  const outerRadius = size * 0.4;
  const innerRadius = size * 0.22;
  const tailRadius = size * 0.13;
  const tailX = centerX + size * 0.22;
  const tailY = centerY + size * 0.22;
  
  // Create gradient for the Q
  const gradient = ctx.createLinearGradient(0, 0, size, size);
  gradient.addColorStop(0, '#0ea5e9');   // Blue
  gradient.addColorStop(0.5, '#14b8a6'); // Teal
  gradient.addColorStop(1, '#10b981');   // Green
  
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  // Tail
  ctx.beginPath();
  ctx.arc(tailX, tailY, tailRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();
  
  return canvas;
}

export default function FaultyTerminal({
  scale = 1.5,
  gridMul = [2, 1],
  digitSize = 1.2,
  timeScale = 1,
  pause = false,
  scanlineIntensity = 0.5,
  glitchAmount = 1,
  flickerAmount = 1,
  noiseAmp = 0.3,
  chromaticAberration = 0,
  dither = 0,
  curvature = 0,
  tint = '#ffffff',
  mouseReact = true,
  mouseStrength = 0.5,
  dpr = Math.min(window.devicePixelRatio || 1, 2),
  pageLoadAnimation = true,
  brightness = 1.2,
  glyphAtlasCols = 16,
  glyphAtlasRows = 16,
  logoOffset = [0.25, 0.25],
  logoScale = [0.5, 0.5],
  className,
  style,
  ...rest
}: FaultyTerminalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const programRef = useRef<Program | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const mouseRef = useRef<MousePosition>({ x: 0.5, y: 0.5 });
  const smoothMouseRef = useRef<MousePosition>({ x: 0.5, y: 0.5 });
  const frozenTimeRef = useRef<number>(0);
  const rafRef = useRef<number>(0);
  const loadAnimationStartRef = useRef<number>(0);
  const timeOffsetRef = useRef<number>(Math.random() * 100);
  
  const tintVec = useMemo(() => hexToRgb(tint), [tint]);
  const ditherValue = useMemo(
    () => (typeof dither === 'boolean' ? (dither ? 1 : 0) : dither),
    [dither]
  );
  
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const ctn = containerRef.current;
    if (!ctn) return;
    const rect = ctn.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    mouseRef.current = { x, y };
  }, []);
  
  // Initialization effect - runs once on mount
  useEffect(() => {
    const ctn = containerRef.current;
    if (!ctn) return;
    
    const renderer = new Renderer({ dpr });
    rendererRef.current = renderer;
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 1);
    
    const geometry = new Triangle(gl);
    
    // Create textures
    const glyphAtlasCanvas = createGlyphAtlasCanvas(glyphAtlasCols, glyphAtlasRows);
    const glyphAtlas = new Texture(gl, {
      image: glyphAtlasCanvas,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR
    });
    
    const logoMaskCanvas = createLogoMaskCanvas();
    const logoMask = new Texture(gl, {
      image: logoMaskCanvas,
      minFilter: gl.LINEAR,
      magFilter: gl.LINEAR
    });
    
    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Color(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height)
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
        uLogoMask: { value: logoMask },
        uLogoOffset: { value: new Float32Array(logoOffset) },
        uLogoScale: { value: new Float32Array(logoScale) },
        uScriptMix: { value: 0 }
      }
    });
    
    programRef.current = program;
    const mesh = new Mesh(gl, { geometry, program });
    
    function resize() {
      if (!ctn || !renderer) return;
      renderer.setSize(ctn.offsetWidth, ctn.offsetHeight);
      program.uniforms.iResolution.value = new Color(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      );
    }
    
    const resizeObserver = new ResizeObserver(() => resize());
    resizeObserver.observe(ctn);
    resize();
    
    const update = (t: number) => {
      rafRef.current = requestAnimationFrame(update);
      
      if (pageLoadAnimation && loadAnimationStartRef.current === 0) {
        loadAnimationStartRef.current = t;
      }
      
      if (!pause) {
        const elapsed = (t * 0.001 + timeOffsetRef.current) * timeScale;
        program.uniforms.iTime.value = elapsed;
        frozenTimeRef.current = elapsed;
        program.uniforms.uScriptMix.value = (elapsed * 0.05) % 1;
      } else {
        program.uniforms.iTime.value = frozenTimeRef.current;
      }
      
      if (pageLoadAnimation && loadAnimationStartRef.current > 0) {
        const animationDuration = 2000;
        const animationElapsed = t - loadAnimationStartRef.current;
        const progress = Math.min(animationElapsed / animationDuration, 1);
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
    
    if (mouseReact) ctn.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      cancelAnimationFrame(rafRef.current);
      resizeObserver.disconnect();
      if (mouseReact) ctn.removeEventListener('mousemove', handleMouseMove);
      if (gl.canvas.parentElement === ctn) ctn.removeChild(gl.canvas);
      
      // Proper cleanup of WebGL resources
      glyphAtlas.delete?.();
      logoMask.delete?.();
      program.delete?.();
      geometry.delete?.();
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      
      loadAnimationStartRef.current = 0;
      timeOffsetRef.current = Math.random() * 100;
    };
  }, [dpr, glyphAtlasCols, glyphAtlasRows, handleMouseMove]); // Minimal dependencies
  
  // Update effect - updates uniforms when props change
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
    program.uniforms.uLogoOffset.value = new Float32Array(logoOffset);
    program.uniforms.uLogoScale.value = new Float32Array(logoScale);
  }, [
    scale,
    gridMul,
    digitSize,
    scanlineIntensity,
    glitchAmount,
    flickerAmount,
    noiseAmp,
    chromaticAberration,
    ditherValue,
    curvature,
    tintVec,
    mouseStrength,
    mouseReact,
    pageLoadAnimation,
    brightness,
    logoOffset,
    logoScale
  ]);
  
  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        backgroundColor: '#000',
        ...style
      }}
      {...rest}
    />
  );
}
