// glyphs.js — exported glyph list and helper
export const finalGlyphSet = [
  { id:'Germany', name:'Germany', lat:51.1657, lon:10.4515, glyph:'ß' },
  { id:'Europe1', name:'France', lat:46.2276, lon:2.2137, glyph:'è' },
  { id:'Europe2', name:'Czechia', lat:49.8175, lon:15.4730, glyph:'š' },
  { id:'Europe3', name:'Poland', lat:51.9194, lon:19.1451, glyph:'ł' },
  { id:'Asia1', name:'Japan (Hiragana)', lat:36.2048, lon:138.2529, glyph:'あ' },
  { id:'Asia2', name:'India (Devanagari)', lat:20.5937, lon:78.9629, glyph:'क्ष' },
  { id:'Oceania', name:'Māori', lat:-21.943, lon:165.2530, glyph:'ā' },
  { id:'LatAm1', name:'Mexico', lat:23.6345, lon:-102.5528, glyph:'ó' },
  { id:'LatAm2', name:'Brazil', lat:-14.2350, lon:-51.9253, glyph:'ã' },
  { id:'Greece', name:'Greece', lat:39.0742, lon:21.8243, glyph:'Ω' }
];

export function listGlyphs(){ return finalGlyphSet.map(r=>({name:r.name, glyph:r.glyph})); }
