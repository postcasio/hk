import Entity from './Entity';
import { MapObject } from '../ObjectLayer';
import Actor from './Actor';

export default class StaticActor extends Actor {
  static fromObject(object: MapObject): StaticActor {
    return new StaticActor(
      object.name,
      object.x,
      object.y,
      object.properties.sprite
    );
  }
}

Entity.entityTypes.StaticActor = StaticActor;
