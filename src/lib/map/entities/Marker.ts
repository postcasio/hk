import Entity from './Entity';
import { MapObject } from '../ObjectLayer';

export default class Marker extends Entity {
  constructor(name: string, x: number, y: number) {
    super(name, x, y);
  }

  static fromObject(object: MapObject): Marker {
    return new Marker(object.name, object.x, object.y);
  }
}

Entity.entityTypes.Marker = Marker;
