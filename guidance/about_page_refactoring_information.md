# Refactored `FaultyTerminal` React Component

## 1. Introduction

This document provides a comprehensive overview of the refactored `FaultyTerminal` React component. The original component, designed to create a cyberpunk-style "glitch terminal" effect, has been significantly improved for performance, reusability, and robustness. This refactoring addresses key issues in the original implementation and introduces new features for greater flexibility.

### Key Improvements:

*   **Performance Optimization:** The expensive WebGL initialization is now performed only once, and subsequent prop changes update lightweight `uniform` variables, preventing costly re-renders.
*   **GLSL Shader Enhancements:** The fragment shader has been optimized to reduce redundant calculations, and the logic for effects like chromatic aberration and barrel distortion has been refined.
*   **Enhanced Reusability:** Hardcoded values have been replaced with component props, allowing for easy customization of the glyph atlas, logo position, and logo scale.
*   **Robust Cleanup:** The component now properly disposes of all WebGL resources, preventing potential memory leaks.
*   **CSS-Based Logo Positioning:** The logo's position and scale are now controlled via props, which can be dynamically calculated based on CSS layout, enabling responsive and animated designs.

## 2. File Structure

The refactored project includes the following files:

*   `about_page_background.tsx`: The main, refactored `FaultyTerminal` component.
*   `example_usage.tsx`: A file containing several examples of how to use the refactored component with different configurations.
*   `README.md`: This documentation file.

## 3. Component API (`FaultyTerminalProps`)

The `FaultyTerminal` component accepts the following props:

| Prop                  | Type                  | Default Value                     | Description                                                                                                                              |
| --------------------- | --------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `scale`               | `number`              | `1.5`                             | Overall zoom level of the background effect.                                                                                             |
| `gridMul`             | `[number, number]`    | `[2, 1]`                          | Multiplier for the grid dimensions, affecting character density.                                                                         |
| `digitSize`           | `number`              | `1.2`                             | Size of the individual character glyphs.                                                                                                 |
| `timeScale`           | `number`              | `1`                               | Speed of the animation. Set to `0` to pause.                                                                                             |
| `pause`               | `boolean`             | `false`                           | Explicitly pauses the animation time.                                                                                                    |
| `scanlineIntensity`   | `number`              | `0.5`                             | Intensity of the horizontal scanline effect.                                                                                             |
| `glitchAmount`        | `number`              | `1`                               | Magnitude of the glitch effect.                                                                                                          |
| `flickerAmount`       | `number`              | `1`                               | Intensity of the character flickering.                                                                                                   |
| `noiseAmp`            | `number`              | `0.3`                             | Amplitude of the background noise pattern.                                                                                               |
| `chromaticAberration` | `number`              | `0`                               | Amount of color separation (red/blue shift).                                                                                             |
| `dither`              | `number` or `boolean` | `0`                               | Dithering amount to reduce color banding.                                                                                                |
| `curvature`           | `number`              | `0`                               | Barrel distortion amount, creating a CRT screen effect.                                                                                  |
| `tint`                | `string`              | `'#ffffff'`                       | Hex color code for the overall tint of the effect.                                                                                       |
| `mouseReact`          | `boolean`             | `true`                            | Whether the effect should react to mouse movement.                                                                                       |
| `mouseStrength`       | `number`              | `0.5`                             | Strength of the mouse interaction effect.                                                                                                |
| `dpr`                 | `number`              | `window.devicePixelRatio`         | Device pixel ratio for rendering resolution.                                                                                             |
| `pageLoadAnimation`   | `boolean`             | `true`                            | Whether to play the initial character fade-in animation.                                                                                 |
| `brightness`          | `number`              | `1.2`                             | Overall brightness of the effect.                                                                                                        |
| `glyphAtlasCols`      | `number`              | `16`                              | **New:** Number of columns in the glyph atlas texture.                                                                                     |
| `glyphAtlasRows`      | `number`              | `16`                              | **New:** Number of rows in the glyph atlas texture.                                                                                        |
| `logoOffset`          | `[number, number]`    | `[0.25, 0.25]`                    | **New:** Normalized `[x, y]` offset of the logo (0-1 range).                                                                               |
| `logoScale`           | `[number, number]`    | `[0.5, 0.5]`                      | **New:** Normalized `[width, height]` of the logo (0-1 range).                                                                             |

## 4. GLSL Shader Optimizations

The GLSL fragment shader has been optimized in several key areas:

1.  **Efficient Chromatic Aberration:** The original code called the expensive `getColor` function three times. The new implementation calculates the base color once and then only re-samples for the red and blue channels, significantly reducing computational overhead.

2.  **Selective Barrel Distortion:** The `barrel` distortion effect is now applied only to the background terminal grid, leaving the logo crisp and undistorted. This is achieved by applying the distortion *after* sampling the logo mask.

3.  **Optimized Logo Masking:** The shader now includes a fast path for rendering the logo. If a fragment is fully covered by the logo (`mask.a > 0.99`), it renders the logo color directly and skips all expensive background effect calculations. This improves performance, especially when the logo is large.

4.  **Uniform Script Distribution:** The logic for selecting character sets (`uScriptMix`) has been adjusted to use perfectly even distribution, ensuring all writing systems have an equal chance of appearing.

## 5. Logo Masking and Positioning

The most significant new feature is the ability to control the logo's position and size dynamically using props. The `logoOffset` and `logoScale` props allow you to define a bounding box for the logo in normalized coordinates (from 0.0 to 1.0).

*   `logoOffset={[0, 0]}` corresponds to the top-left corner.
*   `logoOffset={[0.5, 0.5]}` corresponds to the center.
*   `logoScale={[1, 1]}` means the logo will fill the entire canvas.

This system allows you to synchronize the WebGL logo with a CSS-positioned element. You can create an invisible `div` on your page, position it with standard CSS (including responsive media queries), and then use its dimensions to calculate the `logoOffset` and `logoScale` props for the `FaultyTerminal` component. This provides a powerful and flexible way to integrate the WebGL background into any layout.

## 6. Usage Examples

Here are some examples from `example_usage.tsx` demonstrating how to use the refactored component.

### Example 1: Centered Logo

This example shows the default behavior, with the logo centered in the viewport.

```tsx
export function CenteredLogoExample() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FaultyTerminal
        logoOffset={[0.25, 0.25]}
        logoScale={[0.5, 0.5]}
        tint="#00ffff"
        brightness={1.5}
      />
    </div>
  );
}
```

### Example 2: CSS Layout-Based Positioning

This advanced example demonstrates how to synchronize the WebGL logo with a standard, CSS-positioned `div`. A `ref` is used to get the `div`'s dimensions, which are then converted to the normalized coordinates required by the component.

```tsx
export function CSSLayoutBasedLogoExample() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const logoElementRef = React.useRef<HTMLDivElement>(null);
  const [logoConfig, setLogoConfig] = React.useState({
    offset: [0.25, 0.25] as [number, number],
    scale: [0.5, 0.5] as [number, number]
  });

  React.useEffect(() => {
    const updateLogoPosition = () => {
      if (!containerRef.current || !logoElementRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const logoRect = logoElementRef.current.getBoundingClientRect();

      const offsetX = (logoRect.left - containerRect.left) / containerRect.width;
      const offsetY = (logoRect.top - containerRect.top) / containerRect.height;
      const scaleX = logoRect.width / containerRect.width;
      const scaleY = logoRect.height / containerRect.height;

      setLogoConfig({
        offset: [offsetX, offsetY],
        scale: [scaleX, scaleY]
      });
    };

    updateLogoPosition();
    window.addEventListener('resize', updateLogoPosition);

    return () => window.removeEventListener('resize', updateLogoPosition);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Invisible positioned element that defines where the logo should appear */}
      <div
        ref={logoElementRef}
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '40%',
          height: '40%',
          pointerEvents: 'none',
          visibility: 'hidden'
        }}
      />

      <FaultyTerminal
        logoOffset={logoConfig.offset}
        logoScale={logoConfig.scale}
        tint="#10b981"
        brightness={1.5}
      />
    </div>
  );
}
```

## 7. Conclusion

The refactored `FaultyTerminal` component is now a more powerful, flexible, and performant tool for creating immersive, animated backgrounds. The separation of concerns between initialization and updates, the optimization of the GLSL shader, and the introduction of a CSS-driven positioning system make it a robust and production-ready solution.
