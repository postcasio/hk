import Entity from './Entity';
import { MapObject } from '../ObjectLayer';
import Marker from './Marker';

export default class CameraMarker extends Marker {
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

  static fromObject(object: MapObject): CameraMarker {
    return new CameraMarker({
      name: object.name,
      x: object.x,
      y: object.y,
      ...object.properties
    } as any);
  }
}

Entity.entityTypes.CameraMarker = CameraMarker;
