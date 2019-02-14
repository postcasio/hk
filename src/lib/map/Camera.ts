import Map from './Map';

export default class Camera {
  map: Map;
  zoom: number = 4;

  x: number = 0;
  y: number = 0;

  frameX: number = 0;
  frameY: number = 0;
  frameW: number = Surface.Screen.width;
  frameH: number = Surface.Screen.height;

  constructor(map: Map) {
    this.map = map;
  }

  frame(x: number, y: number, w: number, h: number) {
    this.frameX = x;
    this.frameY = y;
    this.frameW = w;
    this.frameH = h;
  }

  bound() {
    const halfWidth = this.frameW / 2;
    const halfHeight = this.frameH / 2;
    const mapWidth = this.map.width * this.map.tilewidth;
    const mapHeight = this.map.height * this.map.tileheight;

    const left = this.x * this.zoom - halfWidth;

    if (left < 0) {
      this.x = halfWidth / this.zoom;
    }

    const top = this.y * this.zoom - halfHeight;

    if (top < 0) {
      this.y = halfHeight / this.zoom;
    }

    const right = this.x * this.zoom + halfWidth;

    if (right > mapWidth) {
      this.x = mapWidth - halfWidth / this.zoom;
    }

    const bottom = this.y * this.zoom + halfHeight;

    if (bottom > mapHeight) {
      this.x = mapHeight - halfHeight / this.zoom;
    }
  }
}
