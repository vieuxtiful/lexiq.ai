# Reference Video Motion Analysis

## Video Specifications

- **Duration**: 10.03 seconds
- **Resolution**: 898x506 pixels
- **Frame Rate**: 30 FPS
- **Format**: H.264, yuv420p

## Visual Characteristics Observed

### 1. **Particle Distribution Pattern**

The reference video shows a **wave-like or ribbon-like** particle formation that:

- **Flows diagonally** across the screen (from upper-left to lower-right, then shifts)
- Forms **dense bands** or "ribbons" of particles
- Has **clear gaps** between the dense regions (not uniformly distributed)
- Creates a **flowing, organic shape** rather than a symmetric geometric pattern

**Key Observation**: This is fundamentally different from our V5 implementation, which aims for **uniform distribution**. The reference video intentionally creates **non-uniform, flowing structures**.

---

### 2. **Motion Characteristics**

#### **Primary Motion: Wave Propagation**

The particles appear to move in a **coherent wave pattern**:

- **Direction**: The dense band flows across the screen
- **Speed**: Moderate, smooth motion (not too fast, not too slow)
- **Continuity**: The wave maintains its shape while flowing

#### **Secondary Motion: Internal Turbulence**

Within the dense bands, particles exhibit:

- **Swirling motion**: Particles rotate and circulate within the band
- **Slight randomness**: Not perfectly uniform; some particles drift
- **Depth variation**: Particles appear to move in 3D space (some closer, some farther)

---

### 3. **Particle Density Variation**

The video shows **dramatic density variation**:

- **Dense regions**: Bright, concentrated bands with many particles
- **Sparse regions**: Dark gaps with few or no particles
- **Gradient transitions**: Smooth transitions between dense and sparse regions

**Density ratio estimate**: Dense regions appear to have **10-20x more particles** than sparse regions.

---

### 4. **Color and Brightness**

- **Color palette**: Blue to cyan gradient (similar to our gradient colors)
- **Brightness variation**: Particles in dense regions appear brighter (likely due to overlapping bloom effects)
- **Background**: Very dark, almost black (similar to our `#000814`)

---

### 5. **Shape-Shifting Behavior**

The wave/ribbon structure:

- **Expands and contracts**: The band width varies over time
- **Splits and merges**: Sometimes forms multiple bands that converge
- **Rotates**: The orientation of the band changes (diagonal angle shifts)

---

## Key Differences from V5 Implementation

| Aspect | V5 Implementation | Reference Video |
|--------|-------------------|-----------------|
| **Distribution Goal** | Uniform, anti-bunching | Intentional bunching into waves |
| **Pattern Type** | Radial bands (cylindrical) | Flowing ribbons (planar waves) |
| **Density Variation** | Minimal (smooth gradients) | Extreme (dense vs sparse) |
| **Motion Type** | Swirl + radial pull | Wave propagation + turbulence |
| **Symmetry** | Radially symmetric | Asymmetric, directional flow |
| **Particle Count Visibility** | Constant, evenly spread | Varies dramatically by region |

---

## Mathematical Model of Reference Video Motion

### **Hypothesis: Traveling Wave with Turbulence**

The motion can be modeled as:

1. **Base Wave Field**: A traveling sine wave that creates density bands
2. **Particle Attraction**: Particles are pulled toward the wave crests
3. **Turbulent Flow**: Noise-based velocity field within the bands
4. **Depth Modulation**: Z-axis variation creates 3D effect

### **Proposed Force Model**

```typescript
// 1. Traveling wave creates density bands
const wavePhase = x * 0.5 + y * 0.3 + t * 0.8; // Diagonal wave
const waveDensity = Math.sin(wavePhase);

// 2. Particles attracted to wave crests (where waveDensity ≈ 1)
const targetDensity = 1.0;
const densityError = targetDensity - waveDensity;
const pullStrength = densityError * 0.005;

// 3. Pull direction: perpendicular to wave front
const waveGradientX = Math.cos(wavePhase) * 0.5;
const waveGradientY = Math.cos(wavePhase) * 0.3;

dx += waveGradientX * pullStrength;
dy += waveGradientY * pullStrength;

// 4. Turbulent flow within bands
const turbulence = noise4D(x * 0.5, y * 0.5, z * 0.5, t * 0.3);
const turbulenceAngle = turbulence * Math.PI * 2;
dx += Math.cos(turbulenceAngle) * 0.003;
dy += Math.sin(turbulenceAngle) * 0.003;
```

---

## Estimated Parameters from Visual Analysis

### **Wave Properties**

- **Wavelength**: ~300-400 pixels (approximately 1/3 of screen width)
- **Wave speed**: ~50-80 pixels/second (slow, smooth propagation)
- **Wave angle**: ~30-45 degrees from horizontal (varies over time)
- **Wave amplitude**: High (creates strong density variation)

### **Particle Properties**

- **Particle size**: Small, similar to V5 (~0.014 in Three.js units)
- **Particle count**: Appears to be 5000-10000 particles
- **Bloom intensity**: High (creates bright, glowing bands)

### **Motion Properties**

- **Pull strength**: Moderate (particles move toward wave crests but not too aggressively)
- **Turbulence strength**: Low to moderate (visible swirling but not chaotic)
- **Depth variation**: Moderate (clear 3D effect but not extreme)

---

## Implementation Strategy for Reference-Style Motion

### **Core Concept: Wave-Based Attraction**

Instead of radial bands (cylindrical), use **planar traveling waves**:

```typescript
// Define wave parameters
const waveFreqX = 0.4;  // Spatial frequency in X
const waveFreqY = 0.25; // Spatial frequency in Y
const waveSpeed = 0.6;  // Temporal frequency

// Calculate wave phase at particle position
const wavePhase = x * waveFreqX + y * waveFreqY - t * waveSpeed;
const waveCrest = Math.sin(wavePhase);

// Particles attracted to crests (waveCrest ≈ 1)
const attractionStrength = (1 - waveCrest) * 0.004;

// Pull direction: gradient of wave (perpendicular to wave front)
const gradientX = -Math.cos(wavePhase) * waveFreqX;
const gradientY = -Math.cos(wavePhase) * waveFreqY;

dx += gradientX * attractionStrength;
dy += gradientY * attractionStrength;
```

### **Additional Features**

1. **Wave Rotation**: Modulate `waveFreqX` and `waveFreqY` over time to rotate the wave
2. **Wave Splitting**: Use multiple waves with different phases
3. **Depth Coupling**: Link Z-position to wave phase for 3D effect

---

## Comparison Philosophy

### **V5 Philosophy: Uniform, Perpetual Stability**

- Goal: Prevent bunching, maintain even distribution
- Use case: Background ambiance, subtle motion
- Aesthetic: Calm, organized, geometric

### **Reference Video Philosophy: Dynamic, Dramatic Flow**

- Goal: Create striking visual patterns, intentional clustering
- Use case: Hero animation, attention-grabbing effect
- Aesthetic: Energetic, organic, flowing

---

## Conclusion

The reference video uses a **fundamentally different motion model** than V5:

- **V5**: Radial bands + anti-bunching → uniform distribution
- **Reference**: Traveling waves + attraction → dramatic density variation

Both are valid approaches for different use cases. The reference video prioritizes **visual impact** over **uniform distribution**, while V5 prioritizes **long-term stability** and **subtle background motion**.

The next step is to implement a "Reference-Style" version and compare:
- **Visual quality**: Which looks better for the intended use case?
- **Code quality**: Which is more maintainable, efficient, and flexible?
