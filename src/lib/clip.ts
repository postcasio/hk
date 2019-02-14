export default function clipTo(
  surface: Surface,
  x: number,
  y: number,
  w: number,
  h: number,
  callback: () => void
): void {
  surface.clipTo(x, y, w, h);
  callback();
  surface.clipTo(0, 0, surface.width, surface.height);
}
