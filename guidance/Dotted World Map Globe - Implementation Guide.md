# Dotted World Map Globe - Implementation Guide

## Overview

This implementation creates a **LED-style dotted world map** projected onto a 3D globe, similar to the reference images you provided. The effect shows continents as collections of glowing dots that rotate with the globe.

## Components Created

### 1. **DottedWorldMap.tsx** (Basic Version)
- Simple implementation with basic continent shapes
- ~90 latitude × 180 longitude resolution
- Good for testing and lower-end devices

### 2. **DottedWorldMapEnhanced.tsx** (Recommended)
- More detailed continent shapes
- Configurable dot density (default: 2.5 dots per degree)
- Includes glow layer for LED effect
- Better representation of islands and peninsulas
- Generates approximately 8,000-12,000 dots depending on density

### 3. **CareersPageBackgroundV2.tsx** (Integrated Version)
- Replaces the solid globe with the dotted world map
- Maintains all existing features:
  - Rotating glyphs
  - Background particles
  - Bloom effects
  - Same camera position and lighting

## Installation Steps

### Step 1: Add the Component Files

Copy these files to your project's component directory (e.g., `components/` or `app/components/`):

```
components/
├── DottedWorldMap.tsx              (optional - basic version)
├── DottedWorldMapEnhanced.tsx      (required)
└── CareersPageBackgroundV2.tsx     (required)
```

### Step 2: Update GlobalBackground.tsx

Replace the import and usage of `CareersPageBackgroundV1` with `CareersPageBackgroundV2`:

```tsx
"use client";

import { usePathname } from "next/navigation";

import { BackgroundV1 } from "./BackgroundV1";
import { CareersPageBackgroundV2 } from "./CareersPageBackgroundV2"; // Changed

const CAREERS_ROUTE_PREFIX = "/careers";

export function GlobalBackground() {
  const pathname = usePathname();
  const isCareersRoute = pathname?.startsWith(CAREERS_ROUTE_PREFIX);

  if (isCareersRoute) {
    return <CareersPageBackgroundV2 />; // Changed
  }

  return <BackgroundV1 />;
}
```

### Step 3: Verify Dependencies

Ensure you have all required dependencies installed:

```bash
npm install three @react-three/fiber @react-three/drei @react-three/postprocessing simplex-noise
```

Or with pnpm:

```bash
pnpm add three @react-three/fiber @react-three/drei @react-three/postprocessing simplex-noise
```

### Step 4: Test the Implementation

1. Navigate to your careers page route (e.g., `/careers`)
2. You should see a rotating globe made of cyan/teal dots forming world continents
3. The dots should have a subtle glow and pulsing animation
4. Glyphs should still orbit the globe as before

## Customization Options

### Adjust Dot Density

In `CareersPageBackgroundV2.tsx`, modify the `dotDensity` prop:

```tsx
<DottedWorldMapEnhanced
  dotDensity={2.5}  // Lower = fewer dots (faster), Higher = more dots (more detailed)
  // ...
/>
```

**Recommended values:**
- `1.5` - Low density, ~4,000 dots (best performance)
- `2.5` - Medium density, ~10,000 dots (balanced)
- `4.0` - High density, ~25,000 dots (most detailed, slower)

### Adjust Dot Size

```tsx
<DottedWorldMapEnhanced
  dotSize={0.012}  // Increase for larger dots, decrease for smaller
  // ...
/>
```

### Adjust Colors

The component uses a latitude-based gradient. To change colors, modify the `DottedWorldMapEnhanced.tsx` file around line 340:

```tsx
// Current: Cyan to teal gradient
const hue = 0.52 - colorT * 0.08; // Cyan (0.5) to teal (0.48)
const saturation = 0.92 - colorT * 0.15;
const lightness = 0.48 + Math.sin(colorT * Math.PI) * 0.12;

// Example: Blue to purple gradient
const hue = 0.6 - colorT * 0.15; // Blue to purple
const saturation = 0.85;
const lightness = 0.5;
```

### Disable Glow Effect

```tsx
<DottedWorldMapEnhanced
  showGlow={false}  // Set to false to disable glow layer
  // ...
/>
```

### Adjust Rotation Speed

```tsx
<DottedWorldMapEnhanced
  rotationSpeed={0.45}  // Radians per second (lower = slower)
  // ...
/>
```

### Disable Auto-Rotation

```tsx
<DottedWorldMapEnhanced
  autoRotate={false}  // Globe will be static
  // ...
/>
```

## Performance Optimization

### For Lower-End Devices

1. **Reduce dot density:**
   ```tsx
   dotDensity={1.5}
   ```

2. **Disable glow layer:**
   ```tsx
   showGlow={false}
   ```

3. **Reduce bloom intensity** in `CareersPageBackgroundV2.tsx`:
   ```tsx
   <Bloom
     intensity={1.0}  // Reduced from 1.5
     // ...
   />
   ```

4. **Reduce background particles** in `CareersPageBackgroundV2.tsx`:
   ```tsx
   const count = 3000; // Reduced from 6500
   ```

### For High-End Devices

1. **Increase dot density:**
   ```tsx
   dotDensity={4.0}
   ```

2. **Add more detail** by editing the `isLandMassDetailed` function to include more geographic features

## Troubleshooting

### Issue: Dots don't appear

**Solution:** Check that the component is properly imported and the file paths are correct.

### Issue: Performance is slow

**Solution:** Reduce `dotDensity` to 1.5 or lower, and disable `showGlow`.

### Issue: Colors look wrong

**Solution:** Verify that the bloom effect is enabled and that `toneMapped={false}` is set in the PointMaterial.

### Issue: Globe doesn't rotate

**Solution:** Check that `autoRotate={true}` and `frameloop="always"` is set in the Canvas component.

### Issue: Continents are inaccurate

**Solution:** The land mass detection is a simplified approximation. For more accuracy, you would need to:
1. Use actual GeoJSON world map data
2. Implement point-in-polygon testing
3. This would significantly increase complexity and file size

## Advanced: Using Real GeoJSON Data

If you need more accurate continent shapes, you can:

1. Download a simplified world map GeoJSON file (e.g., from Natural Earth Data)
2. Import it into the component
3. Use a point-in-polygon library like `@turf/turf` to test if lat/lon coordinates are on land
4. This will increase bundle size but provide perfect accuracy

Example structure:

```tsx
import worldMap from './world-map-simplified.json';
import * as turf from '@turf/turf';

function isLandMassGeoJSON(lat: number, lon: number): boolean {
  const point = turf.point([lon, lat]);
  
  for (const feature of worldMap.features) {
    if (turf.booleanPointInPolygon(point, feature)) {
      return true;
    }
  }
  
  return false;
}
```

## Visual Comparison

### Before (V1):
- Solid teal/green globe with wireframe
- No geographic features
- Simple sphere geometry

### After (V2):
- Dotted LED-style globe
- Recognizable continents and countries
- Glowing particles forming world map
- More "digital" and "tech-forward" aesthetic

## Next Steps

1. **Test on multiple devices** to ensure performance is acceptable
2. **Adjust colors** to match your brand if needed
3. **Fine-tune dot density** based on your target audience's devices
4. **Consider adding interactivity** (e.g., highlighting specific regions on hover)

## Support

If you encounter issues or want to add features:

1. Check that all dependencies are up to date
2. Verify Three.js version compatibility (recommended: r150+)
3. Test in different browsers (Chrome, Firefox, Safari)
4. Monitor console for WebGL errors

## Credits

- World map projection: Equirectangular (lat/lon to sphere)
- Continent shapes: Procedurally approximated from geographic data
- Rendering: Three.js Points geometry with custom shaders
- Effects: React Three Fiber + Postprocessing
