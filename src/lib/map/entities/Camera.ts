import Entity from './Entity';
import { MapObject } from '../ObjectLayer';

export default class Camera extends Entity {
  zoom: number;
  frameX: number;
  frameY: number;
  frameW: number;
  frameH: number;

  constructor({
    name,
    x,
    y,
    zoom,
    frameX,
    frameY,
    frameW,
    frameH
  }: {
    name: string;
    x: number;
    y: number;
    zoom: number;
    frameX: number;
    frameY: number;
    frameW: number;
    frameH: number;
  }) {
    super(name, x, y);

    this.zoom = zoom;
    this.frameX = frameX;
    this.frameY = frameY;
    this.frameW = frameW;
    this.frameH = frameH;
  }

  static fromObject(object: MapObject): Camera {
    return new Camera({
      name: object.name,
      x: object.x,
      y: object.y,
      ...object.properties
    } as any);
  }
}

Entity.entityTypes.Camera = Camera;
