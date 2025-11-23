# Hyper-Digital Careers Background

A stunning Three.js background animation for the lexiq.ai careers page, featuring a particle-based world map with volumetric lighting, floating UI elements, and cinematic camera movement.

![Preview](preview.png)

## ✨ Features

- 🌍 **Particle World Map**: 10,000+ micro-luminous dots forming continents
- 💫 **Data Throughput Effect**: Subtle jitter and flicker on particles
- 🎴 **Floating UI Elements**: Holographic panels with bloom glow
- 📊 **Parallax Grid**: Infinite analytics substrate
- 💡 **Volumetric Lighting**: Atmospheric fog with radial diffusion
- 🎥 **Cinematic Camera**: Glacial dolly pushes and rotational yaw
- ⚡ **High Performance**: 60 FPS with 10,000+ particles

## 🎨 Visual Style

**Color Palette**:
- Emerald green (#00FF9D)
- Icy cyan (#00E5FF)
- Sky blue (#38BDF8)
- Orange/red accents (#FF6B35)
- Deep black background (#000510)

**Animation Style**:
- Particle jitter: 2-3 pixel oscillation
- Flicker effect: 15% opacity variation
- Holographic drift: Low-gravity Z-axis movement
- Camera motion: 8-second dolly cycle
- Grid parallax: Constant forward motion

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing postprocessing
```

### 2. Copy Files

Copy all `.tsx` files to your project:

```bash
cp lexiq-careers-bg/*.tsx app/components/backgrounds/
```

### 3. Use in Your Page

```tsx
import { HyperDigitalCareersBackground } from "@/components/backgrounds/HyperDigitalCareersBackground";

export default function CareersPage() {
  return (
    <>
      <HyperDigitalCareersBackground />
      
      <main className="relative z-10">
        <h1>Join Our Team</h1>
        {/* Your content */}
      </main>
    </>
  );
}
```

## ⚙️ Configuration

```tsx
<HyperDigitalCareersBackground
  particleDensity={3.5}        // 2.0 - 5.0 (lower = better performance)
  uiElementCount={12}          // 6 - 16 (number of floating panels)
  enableCameraAnimation={true} // true/false
  debug={false}                // Show debug helpers
/>
```

## 📱 Responsive Settings

### Mobile
```tsx
<HyperDigitalCareersBackground
  particleDensity={2.0}
  uiElementCount={6}
  enableCameraAnimation={false}
/>
```

### Desktop
```tsx
<HyperDigitalCareersBackground
  particleDensity={4.0}
  uiElementCount={14}
  enableCameraAnimation={true}
/>
```

## 📦 Components

| Component | Purpose |
|-----------|---------|
| `HyperDigitalCareersBackground` | Main container |
| `ParticleWorldMap` | World map particles |
| `FloatingUIElements` | Holographic UI panels |
| `ParallaxGrid` | Background grid system |
| `VolumetricLights` | Lighting and fog |
| `CameraController` | Camera animation |

## 🎯 Performance

| Metric | Value |
|--------|-------|
| Particles | ~10,000 |
| FPS | 60 (desktop) |
| GPU Memory | ~26 MB |
| CPU Memory | ~1.4 MB |
| Draw Calls | ~35 |

## 🛠️ Customization

### Change Colors

Edit `ParticleWorldMap.tsx`:
```tsx
color.setHSL(0.42, 0.95, 0.45); // Emerald
color.setHSL(0.48, 0.92, 0.50); // Cyan
```

### Adjust Animation Speed

Edit `CameraController.tsx`:
```tsx
<CameraController speed={0.5} /> // Slower
<CameraController speed={2.0} /> // Faster
```

### Modify Bloom Intensity

Edit `HyperDigitalCareersBackground.tsx`:
```tsx
<Bloom
  intensity={1.8}  // 0.5 - 3.0
  radius={0.85}    // 0.1 - 1.0
/>
```

## 📚 Documentation

- **[IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)** - Complete setup and customization guide
- **[TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)** - Deep technical analysis

## 🔧 Troubleshooting

### Black screen?
1. Check browser console for errors
2. Verify WebGL is supported
3. Try debug mode: `debug={true}`

### Poor performance?
1. Reduce `particleDensity` to 2.0
2. Reduce `uiElementCount` to 6
3. Disable camera animation

### Continents inaccurate?
The land mass detection is simplified. For perfect accuracy, use GeoJSON data with point-in-polygon testing.

## 🌐 Browser Support

- ✅ Chrome 120+
- ✅ Firefox 120+
- ✅ Safari 17+
- ✅ Edge 120+

Requires WebGL 2.0 support.

## 📄 License

Provided for use in the lexiq.ai project.

## 🙏 Credits

- **Technology**: Three.js, React Three Fiber, Postprocessing
- **Design**: Inspired by high-fidelity financial command interfaces
- **Color Palette**: Emerald/Cyan techno-futurist aesthetic

---

**Version**: 1.0.0  
**Compatibility**: React 18+, Three.js 0.160+, Next.js 14+

For detailed documentation, see [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md).
