# Camera Logic Extraction - Mouse-Based Parallax Effect

This document contains the extracted camera/mouse movement logic from the three-dimension-website project.

## Core Concept

The "camera" effect is achieved through mouse-based parallax movement where elements respond to mouse position with varying intensities, creating a pseudo-3D depth effect.

## TypeScript/React Implementation

### 1. Mouse Position Hook (useCameraEffect.ts)

```typescript
import { useState, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Custom hook for camera-like mouse tracking effect
 * @param intensity - Movement intensity multiplier (default: 20)
 * @returns Normalized mouse position { x, y } in range based on intensity
 */
export function useCameraEffect(intensity: number = 20): MousePosition {
  const [mousePos, setMousePos] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Normalize mouse position to -1 to 1 range, then multiply by intensity
      // X: -1 (left) to 1 (right)
      // Y: 1 (top) to -1 (bottom) - inverted for natural movement
      setMousePos({
        x: ((clientX / width) * 2 - 1) * intensity,
        y: (-(clientY / height) * 2 + 1) * intensity,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [intensity]);

  return mousePos;
}
```

### 2. Background Blobs Component (BackgroundBlobs.tsx)

```typescript
import { useCameraEffect } from './useCameraEffect';

interface Blob {
  id: number;
  baseX: number;  // Base X position in percentage (0-100)
  baseY: number;  // Base Y position in percentage (0-100)
  scale: number;  // Size scale multiplier
}

export default function BackgroundBlobs() {
  // Get mouse position with intensity of 20
  const mousePos = useCameraEffect(20);

  // Define blob positions and sizes
  const blobs: Blob[] = [
    { id: 1, baseX: 70, baseY: 25, scale: 1.8 },
    { id: 2, baseX: 15, baseY: 55, scale: 1.4 },
    { id: 3, baseX: 55, baseY: 70, scale: 1.2 },
    { id: 4, baseX: 65, baseY: 65, scale: 1.0 },
  ];

  return (
    <div className="fixed inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
      {blobs.map((blob) => (
        <div
          key={blob.id}
          className="absolute transition-transform duration-100 ease-out"
          style={{
            left: `${blob.baseX}%`,
            top: `${blob.baseY}%`,
            // Each blob moves at different speed based on its id (parallax depth)
            // Multiply by (id * 0.1) to create depth layers
            transform: `translate(${mousePos.x * (blob.id * 0.1)}px, ${mousePos.y * (blob.id * 0.1)}px) scale(${blob.scale})`,
            width: '400px',
            height: '400px',
            marginLeft: '-200px',  // Center the blob
            marginTop: '-200px',
          }}
        >
          <img
            src="/liquid-blobs.png"
            alt=""
            className="w-full h-full object-contain opacity-90 animate-[spin_20s_linear_infinite]"
            style={{
              // Apply different hue rotation to each blob for color variation
              filter: `hue-rotate(${blob.id * 30}deg)`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
```

### 3. Stationary Polygon Component (Statue.tsx)

```typescript
import { useCameraEffect } from './useCameraEffect';

export default function Statue() {
  // Lower intensity (15) for more subtle movement
  const mousePos = useCameraEffect(15);

  return (
    <div className="absolute top-1/2 left-1/2 -translate-y-1/2 z-5 pointer-events-none">
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          // Reduced movement multiplier (0.3) for stationary feel
          transform: `translate(${mousePos.x * 0.3}px, ${mousePos.y * 0.3}px)`,
          width: '700px',
          height: '700px',
          marginLeft: '150px', // Offset to the right of center
        }}
      >
        <img
          src="/liquid-blobs-shadow.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}
```

## Vanilla JavaScript/HTML Implementation

### Complete HTML File

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Camera Effect - Mouse Parallax</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Arial', sans-serif;
      background-color: #FAFAFA;
      overflow: hidden;
      height: 100vh;
    }

    .container {
      position: relative;
      width: 100%;
      height: 100vh;
    }

    .background-layer {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 0;
      overflow: hidden;
      pointer-events: none;
    }

    .blob {
      position: absolute;
      transition: transform 0.1s ease-out;
      will-change: transform;
    }

    .blob img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      opacity: 0.9;
      animation: spin 20s linear infinite;
    }

    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }

    .stationary-polygon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 5;
      pointer-events: none;
      transition: transform 0.2s ease-out;
      will-change: transform;
    }

    .content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 10;
      text-align: center;
    }

    h1 {
      font-size: clamp(3rem, 12vw, 9rem);
      font-weight: 900;
      line-height: 0.9;
      letter-spacing: -0.05em;
      color: #000;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Background Blobs -->
    <div class="background-layer" id="backgroundLayer"></div>

    <!-- Stationary Polygon -->
    <div class="stationary-polygon" id="Statue">
      <img src="/liquid-blobs-shadow.png" alt="" style="width: 700px; height: 700px; margin-left: 150px;">
    </div>

    <!-- Content -->
    <div class="content">
      <h1>Meet the Team</h1>
    </div>
  </div>

  <script>
    // Camera Effect Logic
    class CameraEffect {
      constructor(intensity = 20) {
        this.intensity = intensity;
        this.mousePos = { x: 0, y: 0 };
        this.listeners = [];
        this.init();
      }

      init() {
        window.addEventListener('mousemove', this.handleMouseMove.bind(this));
      }

      handleMouseMove(event) {
        const { clientX, clientY } = event;
        const width = window.innerWidth;
        const height = window.innerHeight;

        // Normalize mouse position to -1 to 1 range
        this.mousePos = {
          x: ((clientX / width) * 2 - 1) * this.intensity,
          y: (-(clientY / height) * 2 + 1) * this.intensity,
        };

        // Notify all listeners
        this.listeners.forEach(callback => callback(this.mousePos));
      }

      subscribe(callback) {
        this.listeners.push(callback);
        return () => {
          this.listeners = this.listeners.filter(cb => cb !== callback);
        };
      }

      getPosition() {
        return this.mousePos;
      }
    }

    // Initialize camera effect
    const camera = new CameraEffect(20);

    // Background Blobs Setup
    const blobs = [
      { id: 1, baseX: 70, baseY: 25, scale: 1.8 },
      { id: 2, baseX: 15, baseY: 55, scale: 1.4 },
      { id: 3, baseX: 55, baseY: 70, scale: 1.2 },
      { id: 4, baseX: 65, baseY: 65, scale: 1.0 },
    ];

    const backgroundLayer = document.getElementById('backgroundLayer');

    blobs.forEach(blob => {
      const blobDiv = document.createElement('div');
      blobDiv.className = 'blob';
      blobDiv.style.left = `${blob.baseX}%`;
      blobDiv.style.top = `${blob.baseY}%`;
      blobDiv.style.width = '400px';
      blobDiv.style.height = '400px';
      blobDiv.style.marginLeft = '-200px';
      blobDiv.style.marginTop = '-200px';

      const img = document.createElement('img');
      img.src = '/liquid-blobs.png';
      img.alt = '';
      img.style.filter = `hue-rotate(${blob.id * 30}deg)`;

      blobDiv.appendChild(img);
      backgroundLayer.appendChild(blobDiv);

      // Subscribe to camera updates
      camera.subscribe(mousePos => {
        const offsetX = mousePos.x * (blob.id * 0.1);
        const offsetY = mousePos.y * (blob.id * 0.1);
        blobDiv.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${blob.scale})`;
      });
    });

    // Stationary Polygon Setup
    const Statue = document.getElementById('Statue');
    const polygonCamera = new CameraEffect(15);

    polygonCamera.subscribe(mousePos => {
      const offsetX = mousePos.x * 0.3;
      const offsetY = mousePos.y * 0.3;
      Statue.style.transform = `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`;
    });
  </script>
</body>
</html>
```

## Key Parameters Explained

### Mouse Position Normalization
- **Range**: -1 to 1 (normalized screen coordinates)
- **X axis**: -1 (left edge) → 0 (center) → 1 (right edge)
- **Y axis**: 1 (top edge) → 0 (center) → -1 (bottom edge) - inverted for natural movement

### Intensity
- **Background blobs**: 20 (higher intensity = more movement)
- **Stationary polygon**: 15 (lower intensity = more subtle)

### Movement Multipliers
- **Background blobs**: `blob.id * 0.1` (0.1, 0.2, 0.3, 0.4) - creates depth layers
- **Stationary polygon**: `0.3` - consistent subtle movement

### Transition Timing
- **Background blobs**: `duration-100` (100ms) - quick response
- **Stationary polygon**: `duration-200` (200ms) - smoother, more deliberate

## Usage Tips

1. **Adjust intensity** to control overall movement range
2. **Modify multipliers** to change depth perception
3. **Tweak transition duration** for responsiveness vs smoothness
4. **Use different intensities** for different elements to create layered depth
5. **Invert Y-axis** for natural top-to-bottom movement feel
