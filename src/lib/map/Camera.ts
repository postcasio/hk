import Map from './Map';
import Game from '../Game';

export default class Camera {
  map: Map;
  zoom: number = 4;

  x: number = 0;
  y: number = 0;

  frameX: number = 0;
  frameY: number = 0;
  frameW: number = Surface.Screen.width;
  frameH: number = Surface.Screen.height;

  lightSurface?: Surface;

  constructor(map: Map) {
    this.map = map;
  }

  frame(x: number, y: number, w: number, h: number) {
    this.frameX = x;
    this.frameY = y;
    this.frameW = w;
    this.frameH = h;
  }

  getLightSurface() {
    return (
      this.lightSurface ||
      (this.lightSurface = new Surface(this.frameW, this.frameH))
    );
  }

  bound() {
    const zoom = Game.current.config.globalPixelZoom * this.zoom;

    const halfWidth = this.frameW / 2 / zoom;
    const halfHeight = this.frameH / 2 / zoom;
    const mapWidth = this.map.width * this.map.tilewidth;
    const mapHeight = this.map.height * this.map.tileheight;

    const left = this.x - halfWidth;

    if (left < 0) {
      this.x = halfWidth;
    }

    const top = this.y - halfHeight;

    if (top < 0) {
      this.y = halfHeight;
    }

    const right = this.x + halfWidth;

    if (right > mapWidth) {
      this.x = mapWidth - halfWidth;
    }

    const bottom = this.y + halfHeight;

    if (bottom > mapHeight) {
      this.y = mapHeight - halfHeight;
    }
  }
}
