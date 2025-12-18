import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const generateBMFont = require("msdf-bmfont-xml");
const { PNG } = require("pngjs");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Repository root assumed to be one level up from /scripts.
const ROOT = path.resolve(__dirname, ".."
);

const ASSETS_DIR = path.join(ROOT, "assets");
const PUBLIC_DIR = path.join(ROOT, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "msdf");

const OUT_PNG = path.join(OUT_DIR, "glyph-atlas.png");
const OUT_JSON = path.join(OUT_DIR, "glyph-atlas.json");

const TEMP_DIR = path.join(OUT_DIR, ".tmp");

// Fonts provided by the user.
const FONT_REGULAR = path.join(ASSETS_DIR, "noto-sans-regular.ttf");
const FONT_ARABIC = path.join(ASSETS_DIR, "noto-sans-arabic.ttf");
const FONT_JP = path.join(ASSETS_DIR, "noto-sans-cjk-jp.ttf");
const FONT_KO = path.join(ASSETS_DIR, "noto-sans-cjk-ko.ttf");

// IMPORTANT: Target 256 glyphs for PoC.
// TODO: Revisit this list after visual evaluation.
const GLYPHS = (() => {
  const latinUpper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const latinLower = "abcdefghijklmnopqrstuvwxyz".split("");
  const digits = "0123456789".split("");

  const latinExtended = [
    "À",
    "Á",
    "Â",
    "Ã",
    "Ä",
    "Å",
    "Æ",
    "Ç",
    "È",
    "É",
    "Ê",
    "Ë",
    "Ì",
    "Í",
    "Î",
    "Ï",
    "Ð",
    "Ñ",
    "Ò",
    "Ó",
    "Ô",
    "Õ",
    "Ö",
    "Ø",
    "Ù",
    "Ú",
    "Û",
    "Ü",
    "Ý",
    "Þ",
    "ß",
    "ö",
  ];

  // Mosaic-used Katakana subset.
  const katakana = ["ア", "ウ", "カ", "ラ"];

  // Mosaic-used Hangul subset.
  const hangul = ["가", "나", "다", "라", "마", "바", "사", "아", "자", "차", "카", "타", "파", "하"];

  // Arabic subset as used in the mosaic list.
  const arabic = [
    "ا",
    "ب",
    "ت",
    "ث",
    "ج",
    "ح",
    "خ",
    "د",
    "ذ",
    "ر",
    "ز",
    "س",
    "ش",
    "ص",
    "ض",
    "ط",
    "ظ",
    "ع",
    "غ",
    "ف",
    "ق",
    "ك",
    "ل",
    "م",
    "ن",
    "ه",
    "و",
    "ي",
  ];

  // Greek (letters only).
  const greek = [
    "α",
    "β",
    "γ",
    "δ",
    "ε",
    "ζ",
    "η",
    "θ",
    "ι",
    "κ",
    "λ",
    "μ",
    "ν",
    "ξ",
    "ο",
    "π",
    "ρ",
    "σ",
    "τ",
    "υ",
    "φ",
    "χ",
    "ψ",
    "ω",
  ];

  const all = [...latinUpper, ...latinLower, ...digits, ...latinExtended, ...katakana, ...hangul, ...arabic, ...greek];

  // Pad to 256 deterministically.
  const filler = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".split("");
  const out = [];

  const seen = new Set();
  for (const g of all) {
    if (!seen.has(g)) {
      seen.add(g);
      out.push(g);
    }
  }

  let i = 0;
  while (out.length < 256) {
    out.push(filler[i % filler.length]);
    i += 1;
  }

  return out.slice(0, 256);
})();

const CODEPOINTS = GLYPHS.map((g) => g.codePointAt(0) ?? 0);

const ensureDir = (dir) => {
  fs.mkdirSync(dir, { recursive: true });
};

const resolveMaybe = (p) => {
  if (!p) return p;
  return path.isAbsolute(p) ? p : path.resolve(process.cwd(), p);
};

const findGeneratedFontDataPath = (fontFilename) => {
  const p = resolveMaybe(fontFilename);
  if (p && fs.existsSync(p)) return p;
  throw new Error(`Generator did not produce expected font data file: ${fontFilename}`);
};

const findGeneratedTexturePath = (textures, pageFilename) => {
  const pageBase = path.basename(pageFilename);

  // Try to match by basename.
  const direct = textures.find((t) => path.basename(t.filename) === pageBase);
  if (direct) return resolveMaybe(direct.filename);

  // Fallback: msdf-bmfont-xml may omit extensions in pages[].
  const noExt = pageBase.replace(/\.png$/i, "");
  const match = textures.find((t) => {
    const base = path.basename(t.filename);
    return base === noExt || base.replace(/\.png$/i, "") === noExt;
  });
  if (match) return resolveMaybe(match.filename);

  // Final fallback: just take the first texture.
  if (textures[0]?.filename) return resolveMaybe(textures[0].filename);

  throw new Error(`Could not locate a texture file for page '${pageFilename}'`);
};

const readJsonMaybe = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return null;
  }
};

const writeJsonPretty = (p, obj) => {
  fs.writeFileSync(p, JSON.stringify(obj, null, 2) + "\n", "utf8");
};

const parseTexturePath = (fntJsonPath) => {
  const data = readJsonMaybe(fntJsonPath);
  if (!data) throw new Error(`Could not read ${fntJsonPath}`);

  const pages = data.pages;
  if (!pages || !Array.isArray(pages) || pages.length < 1) {
    throw new Error(`Unexpected BMFont JSON format. Missing pages[] in ${fntJsonPath}`);
  }

  // msdf-bmfont-xml outputs e.g. atlas.0.png, atlas.1.png
  const pageFilename = pages[0];
  return { json: data, pageFilename };
};

const findSingleFile = (dir, predicate, label) => {
  const files = fs.readdirSync(dir);
  const match = files.find(predicate);
  if (!match) {
    throw new Error(`Could not find ${label} in ${dir}`);
  }
  return path.join(dir, match);
};

const findFontJsonPath = (dir, baseName) => {
  // msdf-bmfont-xml names the font data after `filename`.
  // For outputType=json it's commonly `${filename}.json`.
  // For outputType=xml it's commonly `${filename}.fnt`.
  const exactJson = path.join(dir, `${baseName}.json`);
  const exactFnt = path.join(dir, `${baseName}.fnt`);
  if (fs.existsSync(exactJson)) return exactJson;
  if (fs.existsSync(exactFnt)) return exactFnt;

  // Fallback: find any file that starts with baseName and ends with .json or .fnt.
  return findSingleFile(
    dir,
    (f) => (f === `${baseName}.json` || f === `${baseName}.fnt` || f.startsWith(`${baseName}.`)) && (f.endsWith(".json") || f.endsWith(".fnt")),
    `${baseName} font data (.json/.fnt)`
  );
};

const normalizeChars = (fontJson, pageIndexOffset, atlasOffsetX, atlasOffsetY, atlasW, atlasH) => {
  const common = fontJson.common || {};
  const scaleW = common.scaleW;
  const scaleH = common.scaleH;

  const chars = fontJson.chars || [];

  // Normalize to the single combined page.
  const outChars = chars.map((c) => ({
    ...c,
    page: (c.page ?? 0) + pageIndexOffset,
    x: (c.x ?? 0) + atlasOffsetX,
    y: (c.y ?? 0) + atlasOffsetY,
  }));

  // Override common to final combined atlas size.
  const outCommon = {
    ...common,
    scaleW: atlasW,
    scaleH: atlasH,
  };

  return { outChars, outCommon, originalW: scaleW, originalH: scaleH };
};

const composePngsHorizontally = async (pngPaths) => {
  const images = pngPaths.map((p) => PNG.sync.read(fs.readFileSync(p)));

  const width = images.reduce((sum, img) => sum + img.width, 0);
  const height = Math.max(...images.map((img) => img.height));

  const out = new PNG({ width, height });

  let xOffset = 0;
  for (const img of images) {
    PNG.bitblt(img, out, 0, 0, img.width, img.height, xOffset, 0);
    xOffset += img.width;
  }

  return { png: out, width, height, offsets: images.map((img) => img.width) };
};

const generateFontAtlas = (fontPath, outBase, reuseCfgPath) => {
  return new Promise((resolve, reject) => {
    const baseName = path.basename(outBase);
    const options = {
      // JSON output so we can merge.
      outputType: "json",
      // Use MSDF field.
      fieldType: "msdf",
      // Texture output base path.
      filename: outBase,
      // Point size; chosen to balance readability vs packing.
      fontSize: 48,
      // Distance range affects edge quality.
      distanceRange: 4,
      textureSize: [2048, 2048],
      texturePadding: 2,
      // RTL fix for Arabic.
      rtl: true,
      // Character set: provide explicit list.
      charset: String.fromCodePoint(...CODEPOINTS),
    };

    generateBMFont(fontPath, options, (error, textures, font) => {
      if (error) {
        reject(error);
        return;
      }

      // Write textures and font data to disk.
      for (const t of textures) {
        fs.writeFileSync(t.filename, t.texture);
      }
      fs.writeFileSync(font.filename, font.data);

      resolve({ textures, font, baseName });
    });
  });
};

const main = async () => {
  ensureDir(OUT_DIR);
  ensureDir(TEMP_DIR);

  // Clean temp outputs (best-effort).
  for (const f of fs.readdirSync(TEMP_DIR)) {
    try {
      fs.unlinkSync(path.join(TEMP_DIR, f));
    } catch {
      // ignore
    }
  }

  // Strategy (PoC): generate an atlas per font and then compose into a single PNG.
  // - This avoids needing a single "super font".
  // - It keeps generation deterministic.
  // Note: This produces a wide atlas. This is fine for a PoC, but later you may
  // want true packing into one square POT texture.

  const regularBase = path.join(TEMP_DIR, "regular");
  const arabicBase = path.join(TEMP_DIR, "arabic");
  const jpBase = path.join(TEMP_DIR, "jp");
  const koBase = path.join(TEMP_DIR, "ko");

  // Generate four separate MSDF atlases (each outputs *.png + *.fnt/.json + *.cfg).
  const regularGen = await generateFontAtlas(FONT_REGULAR, regularBase, false);
  const arabicGen = await generateFontAtlas(FONT_ARABIC, arabicBase, false);
  const jpGen = await generateFontAtlas(FONT_JP, jpBase, false);
  const koGen = await generateFontAtlas(FONT_KO, koBase, false);

  // IMPORTANT: msdf-bmfont-xml names the JSON after the font face (e.g. noto-sans-regular.json),
  // not necessarily after the requested baseName (regular/json).
  // Use the returned callback filenames rather than guessing.
  const regularJsonPath = findGeneratedFontDataPath(regularGen.font.filename);
  const arabicJsonPath = findGeneratedFontDataPath(arabicGen.font.filename);
  const jpJsonPath = findGeneratedFontDataPath(jpGen.font.filename);
  const koJsonPath = findGeneratedFontDataPath(koGen.font.filename);

  const regularMeta = parseTexturePath(regularJsonPath);
  const arabicMeta = parseTexturePath(arabicJsonPath);
  const jpMeta = parseTexturePath(jpJsonPath);
  const koMeta = parseTexturePath(koJsonPath);

  const regularPng = findGeneratedTexturePath(regularGen.textures, regularMeta.pageFilename);
  const arabicPng = findGeneratedTexturePath(arabicGen.textures, arabicMeta.pageFilename);
  const jpPng = findGeneratedTexturePath(jpGen.textures, jpMeta.pageFilename);
  const koPng = findGeneratedTexturePath(koGen.textures, koMeta.pageFilename);

  const { png: composed, width: atlasW, height: atlasH } = await composePngsHorizontally([
    regularPng,
    arabicPng,
    jpPng,
    koPng,
  ]);

  fs.writeFileSync(OUT_PNG, PNG.sync.write(composed));

  // Merge JSON char metrics into one.
  const regularJson = regularMeta.json;
  const arabicJson = arabicMeta.json;
  const jpJson = jpMeta.json;
  const koJson = koMeta.json;

  const rW = regularJson.common?.scaleW ?? composed.width;
  const aW = arabicJson.common?.scaleW ?? 0;
  const jW = jpJson.common?.scaleW ?? 0;
  const kW = koJson.common?.scaleW ?? 0;

  const mergedChars = [];

  // Each atlas is offset in X by the sum of previous atlas widths.
  const r = normalizeChars(regularJson, 0, 0, 0, atlasW, atlasH);
  const a = normalizeChars(arabicJson, 0, rW, 0, atlasW, atlasH);
  const j = normalizeChars(jpJson, 0, rW + aW, 0, atlasW, atlasH);
  const k = normalizeChars(koJson, 0, rW + aW + jW, 0, atlasW, atlasH);

  mergedChars.push(...r.outChars, ...a.outChars, ...j.outChars, ...k.outChars);

  // Remove duplicates by id, favoring the first occurrence.
  const seen = new Set();
  const deduped = [];
  for (const c of mergedChars) {
    const id = c.id;
    if (typeof id !== "number") continue;
    if (seen.has(id)) continue;
    seen.add(id);
    deduped.push(c);
  }

  const merged = {
    pages: [path.basename(OUT_PNG)],
    common: {
      ...(regularJson.common || {}),
      scaleW: atlasW,
      scaleH: atlasH,
    },
    info: regularJson.info || {},
    chars: deduped,
    distanceField: regularJson.distanceField || { fieldType: "msdf", distanceRange: 4 },
  };

  writeJsonPretty(OUT_JSON, merged);

  console.log("MSDF glyph atlas generated:");
  console.log("-", OUT_PNG);
  console.log("-", OUT_JSON);
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
