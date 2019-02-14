import { MapObject } from '../ObjectLayer';

export default class Entity {
  name: string;
  x: number;
  y: number;

  static entityTypes: {
    [k: string]: { fromObject: (object: MapObject) => Entity };
  } = {};

  constructor(name: string, x: number, y: number) {
    this.name = name;
    this.x = x;
    this.y = y;
  }

  draw(surface: Surface) {}

  static fromObject(object: MapObject): Entity {
    throw new Error('Cannot construct the Entity base class');
  }

  static createFromObject(object: MapObject): Entity {
    if (!Entity.entityTypes[object.type]) {
      throw new Error('Unknown entity type ' + object.type);
    }

    return Entity.entityTypes[object.type].fromObject(object);
  }
}
