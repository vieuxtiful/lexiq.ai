# Particle Degradation Diagnosis

## Problem Statement

User reports that particles:
1. Start with accurate, smooth motion
2. Progressively adopt a "flat" appearance during shape-shifting
3. Lose smoothness over time (degradation)
4. Decrease in visible count
5. "Disappear" progressively

## Root Cause Analysis

### 1. **Boundary Wrapping Mismatch with Camera Frustum**

#### Camera Configuration
```typescript
camera={{ position: [0, 0, 2.4], fov: 60 }}
```

#### Calculating Visible Volume

With a camera at `z = 2.4` and `fov = 60°`, we can calculate the visible area at different Z depths.

**Frustum half-height at distance d:**
```
half_height = d × tan(fov/2)
half_height = d × tan(30°)
half_height = d × 0.577
```

**At z = 0 (center of particle field):**
- Distance from camera: `2.4`
- Half-height: `2.4 × 0.577 = 1.385`
- Half-width (aspect ~16:9): `1.385 × 1.78 = 2.465`

**Visible rectangle at z = 0:**
- X range: `[-2.465, +2.465]`
- Y range: `[-1.385, +1.385]`

#### Current Wrapping Boundaries (V3)

```typescript
// X wrapping
if (positions[i] > 2.5) positions[i] = -2.5;
if (positions[i] < -2.5) positions[i] = 2.5;

// Y wrapping
if (positions[i + 1] > 1.2) positions[i + 1] = -1.2;
if (positions[i + 1] < -1.2) positions[i + 1] = 1.2;

// Z wrapping
if (positions[i + 2] > 0.9) positions[i + 2] = -0.9;
if (positions[i + 2] < -0.9) positions[i + 2] = 0.9;
```

#### Initial Particle Distribution

```typescript
positions[index] = (Math.random() - 0.5) * 4;      // X: [-2, +2]
positions[index + 1] = (Math.random() - 0.5) * 2;  // Y: [-1, +1]
positions[index + 2] = (Math.random() - 0.5) * 1.5; // Z: [-0.75, +0.75]
```

### 🔴 **CRITICAL ISSUE #1: Y-Axis Wrapping Too Tight**

| Aspect | Initial Range | Visible Range | Wrap Boundary | Problem |
|--------|---------------|---------------|---------------|---------|
| X | [-2, +2] | [-2.465, +2.465] | ±2.5 | ✅ OK |
| Y | [-1, +1] | [-1.385, +1.385] | ±1.2 | ⚠️ TOO TIGHT |
| Z | [-0.75, +0.75] | N/A | ±0.9 | ✅ OK |

**Problem**: The Y wrapping boundary at `±1.2` is **smaller than the visible area** (`±1.385`). Particles are being wrapped back **before they leave the visible area**, creating a visible "pop" or discontinuity.

**Visual Effect**: Particles appear to "teleport" from top to bottom (or vice versa) while still visible, breaking the illusion of smooth flow.

---

### 🔴 **CRITICAL ISSUE #2: Wrapping Creates Visible Discontinuities**

When a particle at `y = 1.21` is wrapped to `y = -1.2`, it:
1. **Jumps 2.41 units instantly** (visible teleportation)
2. **Appears at the opposite edge** while the camera can still see both positions
3. **Breaks the smooth flow** of the animation

This is especially problematic because the wrapping happens **within the camera's field of view**.

---

### 🔴 **CRITICAL ISSUE #3: Z-Depth Variation Affects Visible Area**

The visible area changes with Z-depth:

**At z = -0.75 (front of particle field):**
- Distance from camera: `2.4 - (-0.75) = 3.15`
- Half-height: `3.15 × 0.577 = 1.818`
- Half-width: `1.818 × 1.78 = 3.236`

**At z = +0.75 (back of particle field):**
- Distance from camera: `2.4 - 0.75 = 1.65`
- Half-height: `1.65 × 0.577 = 0.952`
- Half-width: `0.952 × 1.78 = 1.695`

**Visible ranges by Z-depth:**

| Z Position | X Visible Range | Y Visible Range |
|------------|-----------------|-----------------|
| -0.75 (front) | [-3.236, +3.236] | [-1.818, +1.818] |
| 0 (middle) | [-2.465, +2.465] | [-1.385, +1.385] |
| +0.75 (back) | [-1.695, +1.695] | [-0.952, +0.952] |

**Current wrap boundaries:**
- X: `±2.5` (too small for front particles)
- Y: `±1.2` (too small for front particles)

**Result**: Particles at the front of the field (negative Z) are being wrapped **well within the visible area**, causing visible teleportation.

---

### 🔴 **CRITICAL ISSUE #4: Particle Loss Due to Drift**

The base swirl field has a **constant rightward drift**:

```typescript
let dx = Math.cos(angle) * 0.002 + 0.004;  // ← Always positive!
```

This `+0.004` bias means particles constantly drift to the right. Over time:
1. Particles accumulate at the right edge
2. They wrap to the left edge
3. But the **pull forces may not be strong enough** to bring them back into the main flow
4. Particles get "stuck" in a wrap-respawn cycle at the edges

**Compounding effect**: If particles wrap at `x = 2.5` but the visible area extends to `x = 3.2` at the front, they become invisible before wrapping, creating the appearance of "disappearing."

---

### 🔴 **CRITICAL ISSUE #5: "Flattening" Due to Z-Axis Compression**

The Z-axis has:
- **Weakest pull force**: `zCohesion = 0.0005 * (0.5 + gateZ)` (smallest coefficient)
- **Smallest initial range**: `[-0.75, +0.75]`
- **Tight wrapping**: `±0.9`

Over time, particles may:
1. Drift out of the initial Z range
2. Get pulled toward `bandCenterZ` which oscillates around `±0.35`
3. **Compress into a narrower Z band**, creating a "flat" appearance

**Mathematical analysis:**

```typescript
const bandCenterZ = Math.sin(t * 0.55 + radius * 0.45) * 0.35;
```

The Z band center oscillates in the range `[-0.35, +0.35]`, which is **less than half** the initial Z distribution `[-0.75, +0.75]`.

**Result**: Particles are being pulled into a thinner Z slice over time, making the animation appear progressively flatter.

---

### 🔴 **CRITICAL ISSUE #6: Velocity Capping Prevents Redistribution**

The velocity cap of `0.006` may be **too restrictive** when particles need to:
1. Escape from edge accumulation
2. Redistribute after wrapping
3. Respond to strong pull forces

**Scenario**: A particle wraps from `x = 2.5` to `x = -2.5` and needs to move back into the main flow at `x ≈ 0`. The required displacement is `2.5` units, but at a max velocity of `0.006` per frame, this takes:

```
frames_needed = 2.5 / 0.006 = 417 frames
time_needed = 417 / 60 = 6.95 seconds
```

If the rightward drift is `0.004` per frame, the particle is fighting against:
```
net_velocity = 0.006 - 0.004 = 0.002 per frame
time_needed = 2.5 / 0.002 = 1250 frames = 20.8 seconds
```

**Result**: Particles take too long to redistribute, creating visible clustering at edges and gaps in the middle.

---

## Summary of Issues

| Issue | Severity | Symptom | Root Cause |
|-------|----------|---------|------------|
| Y wrapping too tight | 🔴 Critical | Visible teleportation | Wrap at ±1.2, visible to ±1.385 |
| X wrapping too tight | 🔴 Critical | Particle disappearance | Wrap at ±2.5, visible to ±3.2 (front) |
| Z compression | 🔴 Critical | Flattening over time | Band center ±0.35 vs initial ±0.75 |
| Rightward drift | 🟡 High | Edge accumulation | Constant +0.004 bias |
| Velocity cap too low | 🟡 High | Slow redistribution | 0.006 vs 0.004 drift = slow net movement |
| Z-depth visibility variation | 🟡 High | Inconsistent wrapping | Frustum expands toward front |

---

## Proposed Solutions

### 1. **Expand Wrapping Boundaries Beyond Visible Area**

Calculate wrapping boundaries based on the **maximum visible area** (at the front of the particle field) plus a safety margin:

```typescript
// At z = -0.9 (front edge with margin)
// Distance: 2.4 - (-0.9) = 3.3
// Half-height: 3.3 × 0.577 = 1.904
// Half-width: 1.904 × 1.78 = 3.389

// Wrapping boundaries with 20% safety margin
const xWrap = 3.389 * 1.2 = 4.067 → 4.1
const yWrap = 1.904 * 1.2 = 2.285 → 2.3
const zWrap = 0.9 * 1.2 = 1.08 → 1.1
```

**New wrapping code:**
```typescript
// X wrapping (expanded)
if (positions[i] > 4.1) positions[i] = -4.1;
if (positions[i] < -4.1) positions[i] = 4.1;

// Y wrapping (expanded)
if (positions[i + 1] > 2.3) positions[i + 1] = -2.3;
if (positions[i + 1] < -2.3) positions[i + 1] = 2.3;

// Z wrapping (expanded)
if (positions[i + 2] > 1.1) positions[i + 2] = -1.1;
if (positions[i + 2] < -1.1) positions[i + 2] = 1.1;
```

### 2. **Increase Z-Band Amplitude to Prevent Flattening**

```typescript
// Increase Z band amplitude to match initial distribution
const bandCenterZ = Math.sin(t * 0.55 + radius * 0.45) * 0.6; // 0.35 → 0.6
```

This allows the Z band to cover the full initial range `[-0.75, +0.75]`, preventing compression.

### 3. **Remove or Reduce Rightward Drift Bias**

```typescript
// Option A: Remove bias entirely
let dx = Math.cos(angle) * 0.003; // No +0.004 bias

// Option B: Make bias oscillate
let dx = Math.cos(angle) * 0.002 + Math.sin(t * 0.1) * 0.004;
```

### 4. **Increase Velocity Cap for Better Redistribution**

```typescript
const maxStep = 0.01; // 0.006 → 0.01 (67% increase)
```

This allows particles to redistribute faster after wrapping.

### 5. **Strengthen Z-Axis Pull**

```typescript
const zCohesion = 0.001 * (0.5 + gateZ); // 0.0005 → 0.001 (doubled)
```

Helps maintain 3D depth and prevents flattening.

---

## Testing Recommendations

1. **Monitor particle count**: Add a counter to verify no particles are being lost
2. **Visualize boundaries**: Draw debug lines at wrapping boundaries to verify they're outside the visible area
3. **Track Z distribution**: Log min/max Z values over time to detect compression
4. **Measure edge accumulation**: Count particles in edge regions vs center

---

## Next Steps

Implement these fixes in `BackgroundV4.ts` and test to verify:
- ✅ No visible teleportation
- ✅ Consistent particle count
- ✅ Maintained 3D depth over time
- ✅ Smooth, continuous motion
