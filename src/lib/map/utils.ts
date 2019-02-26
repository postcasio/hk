export function colorFromTiledARGB(value: string) {
  const a = parseInt(value.substr(1, 2), 16) / 255;
  const r = parseInt(value.substr(3, 2), 16) / 255;
  const g = parseInt(value.substr(5, 2), 16) / 255;
  const b = parseInt(value.substr(7, 2), 16) / 255;
  return new Color(r, g, b, a);
}

export function colorFromTiledRGB(value: string) {
  const r = parseInt(value.substr(1, 2), 16) / 255;
  const g = parseInt(value.substr(3, 2), 16) / 255;
  const b = parseInt(value.substr(5, 2), 16) / 255;
  return new Color(r, g, b, 1);
}
