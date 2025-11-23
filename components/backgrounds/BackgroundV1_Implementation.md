# BackgroundV1 Implementation Overview

This document describes the current `BackgroundV1` particle background implementation in detail for future reference. It reflects the state after the V5-style anti-bunching logic, reference-style wave motion, fade/feather cycle, and global push–pull tuning.

---

## Quick Knobs (At a Glance)

Use these parameters for most visual tuning without diving into the full math:

| Goal                          | Primary Knobs                                                                |
|-------------------------------|-------------------------------------------------------------------------------|
| Softer / looser bands         | ↓ `attractionStrength` multiplier, ↓ depth pull multiplier                  |
| Stronger / tighter bands      | ↑ `attractionStrength` multiplier, ↑ depth pull multiplier (slightly)       |
| More chaotic shapes           | ↑ `shapeNoise1` / `shapeNoise2` coefficients, ↑ their spatial frequencies   |
| Calmer, more regular shapes   | ↓ `shapeNoise1` / `shapeNoise2` coefficients, ↓ their spatial frequencies   |
| Less clumping over time       | ↑ global push–pull multiplier `K`, ↓ cohesion if needed                     |
| Smoother, less jittery motion | ↓ global push–pull multiplier `K`, ↓ `turbulenceStrength`                   |
| Faster motion overall         | ↑ `turbulenceStrength`, ↑ drift amplitude, ↑ `maxStep` slightly             |
| Slower, more viscous motion   | ↓ `turbulenceStrength`, ↓ drift amplitude, ↓ `maxStep`                       |
| Softer fade-out               | ↑ `featherExtraSize`, ↑ `fadeOutDuration`, ↑ desaturation (≤ 0.3 recommended)|
| Snappier fade-out             | ↓ `fadeOutDuration`, ↓ `featherDuration`                                    |


## High-Level Design

`BackgroundV1` renders a full-screen Three.js background using React Three Fiber. It consists of:

- A fixed, branded gradient background with a dark canvas (`#000814`).
- A `Canvas` with:
  - Camera at `[0, 0, 2.4]`, `fov = 60`.
  - Ambient light (`intensity = 0.2`).
  - A single `SwirlParticles` `Points` system.
  - A static `Bloom` pass for gentle glow.
- `SwirlParticles` manages particle initialization, per-frame motion, and a timed fade/reset cycle with feathering and desaturation.

The intent is to create dynamic, wave-like ribbons of particles with:

- Strong visual variation (bands that bend, split, and re-form).
- Minimal long-term clumping or locking.
- Periodic, enchanted-looking fade-out / reset / fade-in cycles.

---

## Particle Initialization

In `SwirlParticles`:

- A 4D simplex noise function is created:
  ```ts
  const noise4D = useMemo(() => createNoise4D(), []);
  ```
- A `THREE.Points` ref (`ref`) tracks the particle system.
- `positions` and `colors` are generated once via `useMemo`:
  ```ts
  const count = 8000;
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);

  for (let i = 0; i < count; i++) {
    const index = i * 3;
    // Wider initial distribution to better fill the frustum
    positions[index]     = (Math.random() - 0.5) * 5; // X
    positions[index + 1] = (Math.random() - 0.5) * 3; // Y
    positions[index + 2] = (Math.random() - 0.5) * 2; // Z

    const [r, g, b] = interpolateColor(i / count);
    colors[index]     = r;
    colors[index + 1] = g;
    colors[index + 2] = b;
  }
  ```
- Colors are taken from a blue–teal gradient array and linearly interpolated across the particle index.
- A `Float32BufferAttribute` is created for colors and attached to the geometry in `useEffect`.

---

## Fade / Reset Cycle

A `cycleRef` tracks per-cycle resets, and several timing constants drive the animation:

```ts
const leadIn = 4;                // seconds before any cycle logic
const visibleDuration = 3;       // steady visible motion
const fadeOutDuration = 0.833;   // fast fade-out (~5/6 second)
const featherDuration = 1.13;    // feather spans fade-out + short tail
const fadeInDuration = 3;        // longer fade-in
const transitionDuration = fadeOutDuration + fadeInDuration;
const cycleDuration      = visibleDuration + transitionDuration;
``

Per frame, we compute:

- `alpha` – particle opacity.
- `featherFactor` – per-particle size softening factor.
- `saturationFactor` – temporary desaturation during fade-out.

### Visible Phase

For `cycleT < visibleDuration`:

- `alpha = 1` (fully opaque).
- `featherFactor = 0` (sharp points).
- `saturationFactor = 0` (full color).
- `cycleRef.hasResetThisCycle` is set `false`.

### Fade-Out Phase

For `visibleDuration ≤ cycleT < visibleDuration + fadeOutDuration`:

- `transitionT = cycleT - visibleDuration`.
- `local = transitionT / fadeOutDuration`.
- Opacity decreases linearly:
  ```ts
  alpha = 1 - local;
  ```
- Feather grows linearly:
  ```ts
  featherFactor = local;
  ```
- Saturation reduces up to 30%:
  ```ts
  saturationFactor = local * 0.3;
  ```

### Reset + Fade-In Phase

For `cycleT ≥ visibleDuration + fadeOutDuration`:

- On first entry per cycle, all positions are re-randomized with the same ranges as initialization to start a fresh field.
- Fade-in opacity:
  ```ts
  const local = (transitionT - fadeOutDuration) / fadeInDuration; // 0 → 1
  alpha = clamp(local, 0, 1);
  ```
- Feather tail (softness) persists briefly beyond fade-out and then decays to 0 by `featherDuration`:
  ```ts
  if (transitionT < featherDuration) {
    const tailT   = transitionT - fadeOutDuration;
    const tailSpan = featherDuration - fadeOutDuration;
    const k = clamp(tailT / tailSpan, 0, 1);
    featherFactor = 1 - k; // 1 → 0 over tail window
  } else {
    featherFactor = 0;
  }
  ```
- Saturation is restored in the same tail window:
  ```ts
  if (transitionT < featherDuration) {
    const tailT   = transitionT - fadeOutDuration;
    const tailSpan = featherDuration - fadeOutDuration;
    const k = clamp(tailT / tailSpan, 0, 1);
    saturationFactor = (1 - k) * 0.3; // 0.3 → 0
  } else {
    saturationFactor = 0;
  }
  ```

Finally, the material is updated:

```ts
materialRef.current.opacity = alpha;
materialRef.current.size    = baseSize + featherExtraSize * featherFactor;

const satReduction = saturationFactor;
const greyFactor   = 1 - satReduction;
materialRef.current.color.setScalar(greyFactor);
```

Where:

- `baseSize = 0.014`.
- `featherExtraSize = 0.024` (extra radius at max feather).

---

## Wave-Based Motion Field

The core motion is a wave-based field inspired by the reference video analysis. For each particle:

1. **Wave Parameters** (modulated over time):
   ```ts
   const waveAngle = Math.sin(t * 0.15) * 0.8;
   const waveFreqX = 0.35 + Math.cos(waveAngle) * 0.15;
   const waveFreqY = 0.25 + Math.sin(waveAngle) * 0.15;
   const waveSpeed = 0.5;
   ```

2. **Primary and Secondary Waves**:
   ```ts
   const wavePhase  = x * waveFreqX + y * waveFreqY - t * waveSpeed;
   const waveCrest  = Math.sin(wavePhase);

   const wave2Phase = x * 0.28 - y * 0.32 + t * 0.4;
   const wave2Crest = Math.sin(wave2Phase);
   ```

3. **Multi-Octave Shaping Noise** (for varied band configurations):
   ```ts
   const shapeNoise1 = noise4D(x * 0.3,  y * 0.26, z * 0.28, t * 0.33); // coarse
   const shapeNoise2 = noise4D(x * 0.85, y * 0.7,  z * 0.8,  t * 0.61); // finer
   const shaping     = shapeNoise1 * 0.5 + shapeNoise2 * 0.35;

   const combinedWave = ((waveCrest + wave2Crest * 0.5) / 1.5) + shaping;
   ```

   This produces highly variable, organic ribbon shapes.

4. **Attraction Toward Wave Crests** (very soft cohesion):
   ```ts
   const targetDensity     = 1.0;
   const densityError      = targetDensity - combinedWave;
   const attractionStrength = Math.max(0, densityError) * 0.00019;

   const gradientX = -Math.cos(wavePhase) * waveFreqX;
   const gradientY = -Math.cos(wavePhase) * waveFreqY;

   let dx = gradientX * attractionStrength;
   let dy = gradientY * attractionStrength;
   let dz = 0;
   ```

5. **Turbulent Swirl Within Bands**:
   ```ts
   const turbulence        = noise4D(x * 0.4, y * 0.4, z * 0.4, t * 0.25);
   const turbulenceAngle   = turbulence * Math.PI * 2;
   const turbulenceStrength = 0.0032 * (0.8 + 0.4 * combinedWave);

   dx += Math.cos(turbulenceAngle)      * turbulenceStrength;
   dy += Math.sin(turbulenceAngle)      * turbulenceStrength;
   dz += Math.sin(turbulenceAngle * 0.7) * turbulenceStrength * 0.5;
   ```

6. **Depth Modulation** (Z pull):
   ```ts
   const depthTarget = Math.sin(wavePhase * 0.5) * 0.55;
   const depthError  = depthTarget - z;
   dz += depthError * 0.001;
   ```

7. **Ambient Drift**:
   ```ts
   const driftAngle = noise4D(x * 0.15, y * 0.15, z * 0.15, t * 0.1) * Math.PI * 2;
   dx += Math.cos(driftAngle) * 0.0009;
   dy += Math.sin(driftAngle) * 0.0009;
   ```

---

## Global Push–Pull (Anti-Clumping)

To further disrupt residual clumping, a global, velocity-aligned push–pull force is applied:

```ts
const velLen      = Math.sqrt(dx * dx + dy * dy + dz * dz) + 1e-6;
const globalNoise = noise4D(dx * 40, dy * 40, dz * 40, t * 0.7 + dt * 60);
const pushPull    = globalNoise;                            // [-1, 1]
const densityBias = 0.6 + 0.8 * Math.abs(combinedWave);     // 0.6–1.4
const globalMag   = 0.0065 * pushPull * densityBias;        // tuned strength

const nx = dx / velLen;
const ny = dy / velLen;
const nz = dz / velLen;

dx += nx * globalMag;

```

---

## Tuning History (Key Changes)

This section summarizes major tuning passes and their primary visual effects.

- **V3 → V4:**
  - Expanded XYZ wrapping beyond the frustum to eliminate visible teleportation.
  - Removed rightward drift bias; increased base swirl and Z-band amplitude.
  - Increased velocity cap from ~0.006 to 0.01 to speed redistribution.

- **V4 → V5:**
  - Added stochastic jitter (per-particle noise-based perturbations) to break symmetry.
  - Increased swirl strength and used incommensurate frequencies on gates and bands to prevent phase locking.
  - Expanded wrapping further and tuned Z cohesion to avoid flattening.

- **V5 → Wave-Based Reference Model:**
  - Switched from radial bands to planar traveling waves (ribbons) with diagonal flow.
  - Implemented two-wave system plus multi-octave shaping noise for more complex band geometry.
  - Softened cohesion coefficients significantly to avoid rigid locking.

- **Anti-Bunching Refinements:**
  - Introduced global push–pull force aligned with velocity and biased by `|combinedWave|`.
  - Iteratively increased the global multiplier and shaping noise until residual clumping was minimal, then backed off slightly (`globalMag ≈ 0.0065 * densityBias`).

- **Fade / Feather / Color Cycle:**
  - Added a timed cycle: visible → fade-out → reset → fade-in.
  - Fade-out made faster (~0.833s) with growing feather, 30% desaturation, and opacity drop.
  - Feather persists for ~1.13s total (fade-out + short tail), then decays to 0 early in fade-in, while saturation is eased back to full to avoid darkening.

- **Velocity & Drift:**
  - Raised swirl and drift strengths to keep motion energetic.
  - Increased `maxStep` above its original value, then trimmed back to `0.028` to avoid overly large jumps while still allowing expressive motion.

---

## Safe Tuning Guide

When adjusting `BackgroundV1` in the future, consider these guidelines to avoid reintroducing past issues:

### Cohesion (Attraction & Depth)

- **Increase gently** if bands feel too loose:
  - Raise `attractionStrength` multiplier in small steps (e.g. `+0.00002` at a time).
  - Slightly increase the depth pull multiplier, but keep it below `~0.0012` to avoid flattening.
- **Decrease** if particles lock into rigid ribbons:
  - Lower `attractionStrength` first; only adjust shaping noise if necessary.

### Shaping Noise

- Controls how wild the band shapes are:
  - `shapeNoise1` (coarse) sets large-scale bends.
  - `shapeNoise2` (fine) adds detail.
- **Too chaotic?** Reduce coefficients (e.g. `0.5 → 0.35`) or lower spatial frequencies.
- **Too regular?** Increase coefficients or add another octave with different scales.

### Global Push–Pull

- Main anti-bunching lever after cohesion is softened.
- `globalMag = K * pushPull * densityBias`:
  - Increase `K` if residual clumping appears after long runs.
  - Decrease `K` if motion feels overly jittery or noisy.
- Keep `K` small relative to swirl/turbulence so this remains a modulation, not a primary driver.

### Velocity Cap (`maxStep`)

- Acts as a **safety cap**, not a core design knob.
- Lower values:
  - Make motion more viscous and can slow redistribution.
- Higher values:
  - Allow more expressive movement but risk visible jumps if forces spike.
- Adjust in small increments (e.g. `0.024 → 0.028 → 0.032`) and watch for artifacts.

### Fade & Feather

- **Fade-out speed** (`fadeOutDuration`):
  - Shorter → snappier exits; longer → more languid dissolves.
- **Feather behavior**:
  - `featherExtraSize` controls how soft/large particles become.
  - `featherDuration` defines how long feather persists; keep it short relative to `fadeInDuration` to avoid prolonged blur.
- Desaturation (`saturationFactor`):
  - Avoid values much above `0.3` or the background can feel washed out.

### Fizzle-Out Fragmentation

- Controls how strongly particles are pushed apart during fade-out.
- Main knob: `fragStrength` multiplier in the fizzle-out block, currently:
  - `fragStrength = 0.0024 * fadeOutPhase * (1 + Math.abs(combinedWave))`.
- **More explosive fizzle-out:** increase the base multiplier (e.g. `0.0024 → 0.0030`).
- **Subtler fizzle-out:** decrease the multiplier or weight less on `|combinedWave|`.
- Keep this term relatively small compared to swirl/turbulence so it only dominates during fade-out.

### General Advice

- Change **one family of parameters at a time** (cohesion, shaping, push–pull, fade), then observe for at least one or two full cycles.
- Prefer **small increments** to avoid overshooting into unstable or visually harsh regimes.
- When in doubt, log or visualize:
  - Distribution of `combinedWave`.
  - Distribution of `|dx, dy, dz|` before and after normalization.
  - Cycle timing (`cycleT`, `transitionT`) to verify fade/feather behavior.

```
