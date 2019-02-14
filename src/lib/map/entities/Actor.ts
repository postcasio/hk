import Entity from './Entity';
import { MapObject } from '../ObjectLayer';

export default class Actor extends Entity {
  static fromObject(object: MapObject): Actor {
    return new Actor(object.name, object.x, object.y);
  }
}

Entity.entityTypes.Actor = Actor;
