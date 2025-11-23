export const gradientColors = [
  "#0065ab",
  "#0067af",
  "#006ab3",
  "#006db7",
  "#0070bb",
  "#0075c2",
  "#0079c7",
  "#007fce",
  "#0085d5",
  "#008bdb",
  "#0092e1",
  "#0098e6",
  "#009ce8",
  "#00a0e9",
  "#00a2e5",
  "#00a5dd",
  "#00a9d3",
  "#00accc",
  "#00afc4",
  "#00b1ba",
  "#00b3b0",
  "#00b1a1",
  "#00af92",
  "#00ad84",
  "#00ab76",
  "#00a769",
  "#00a35e",
  "#009f54",
  "#009b4b",
  "#009745",
  "#009441",
  "#00914d",
  "#00905b",
  "#008f69",
  "#008f76",
  "#009082",
  "#00938e",
  "#00969a",
  "#009aa4",
  "#009fae",
  "#00a4b7",
  "#00a9bf",
  "#00aec6",
  "#00b2cc",
  "#00b6d1",
  "#00b9d6",
  "#00bcd9",
  "#00bfdd",
  "#00c2e0",
  "#00c4e3",
];

export const gradientStops = gradientColors.map((color, index) => ({
  stop: index / (gradientColors.length - 1),
  color,
}));

export const hexToRgb = (hex: string) => {
  const normalized = hex.replace("#", "");
  const bigint = parseInt(normalized, 16);
  return [((bigint >> 16) & 255) / 255, ((bigint >> 8) & 255) / 255, (bigint & 255) / 255] as const;
};

export function interpolateColor(t: number) {
  const clamped = Math.min(Math.max(t, 0), 1);
  let left = gradientStops[0];
  let right = gradientStops[gradientStops.length - 1];

  for (let i = 0; i < gradientStops.length - 1; i++) {
    const current = gradientStops[i];
    const next = gradientStops[i + 1];
    if (clamped >= current.stop && clamped <= next.stop) {
      left = current;
      right = next;
      break;
    }
  }

  const span = right.stop - left.stop || 1;
  const localT = (clamped - left.stop) / span;
  const leftRgb = hexToRgb(left.color);
  const rightRgb = hexToRgb(right.color);

  return leftRgb.map((channel, index) => channel + (rightRgb[index] - channel) * localT) as [
    number,
    number,
    number,
  ];
}
