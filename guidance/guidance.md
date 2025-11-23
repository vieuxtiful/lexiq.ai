# Glyph-Per-Revolution Globe — Guidance & Implementation Notes

## Overview
This package implements the "glyph-per-revolution" behavior: a 3D globe spins, emitting particle atmosphere; on each revolution one glyph from a 10-region set appears when that region rotates into view. The Germany slot is fixed to "ß". The final glyph set used in this package:

- Germany: ß
- France: è
- Czechia: š
- Poland: ł
- Japan (Hiragana): あ
- India (Devanagari): क्ष
- Oceania (Māori): ā
- Latin America (Mexico): ó
- Latin America (Brazil): ã
- Greece: Ω

## Files in this package
- `globe-glyphs.html` — a self-contained Three.js example (calibration UI included). Set `referenceVideoURL` to your imported WindSurf video path if needed (by default it references `/mnt/data/1067915657-preview.mp4`).
- `glyphs.js` — ES module exporting the final glyph set and helper.
- `guidance.md` — this document (you are reading it).
- `README.txt` — quick instructions.
- `globe_glyphs_package.zip` — zipped archive for download.

## How the scheduling works (concise)
- The system tracks a continuous `spinAngle` (radians). Each time `spinAngle` crosses another multiple of `2π`, the corresponding revolution index is enqueued.
- For each queued revolution we compute which region it corresponds to (index `revIndex % 10`).
- We spawn that region's glyph only when the region's anchor is facing the camera (checked via `dot(normal, camDir) >= dotThreshold`).
- This ensures exactly one glyph is shown per revolution, displayed only while the region is visible to the viewer.

## Calibration
Use the UI built into `globe-glyphs.html`:
- **Auto Calibrate**: best-effort automated estimation of revolutions/sec (RPS) using frame sampling and angular cross-correlation.
- **Manual Calibrate**: pause the reference video at two frames ~1 revolution apart, click a visible landmark in each, and the tool computes rps from time delta.
- After calibration the `rps` slider updates; you can fine-tune dot threshold, glyph lifetime, and glyph scale.

## Fonts & glyph support
- We recommend adding Noto font families to your WindSurf assets:
  - Noto Sans (Latin)
  - Noto Sans JP (Hiragana/Katakana/Kanji)
  - Noto Sans Devanagari
  - Noto Sans Greek
- The example uses Canvas2D rendering for glyph textures, so ensure the fonts are available to the page (place in same origin or host with CORS allowed).

## WindSurf import tips
1. Upload `globe-glyphs.html` and the video `/mnt/data/1067915657-preview.mp4` into your WindSurf project assets.
2. Point `referenceVideoURL` (in the HTML) to the WindSurf asset URL (WindSurf converts `/mnt/data/...` to an internal URL; in the example the local path is preserved).
3. Open the HTML in WindSurf preview; run Auto Calibrate or Manual Calibrate to tune the spin speed to match the video.

## Next steps & enhancements
- Replace Canvas2D glyph generation with MSDF/SDF for razor-sharp scaling.
- Replace the simple particle cloud with GPU-based curl-noise particles for richer motion.
- Add depth-based occlusion so glyphs can appear partially behind surface features (requires depth-testing materials).
- Add bloom postprocess for extra glow (Three.js UnrealBloomPass).

## Contact
If you want me to:
- produce the ZIP with included Noto fonts, or
- port this to React + R3F component, or
- produce MSDF glyphs for these 10 characters,

tell me which and I will generate them next.
