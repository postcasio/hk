import Entity from './Entity';
import { MapObject } from '../ObjectLayer';
import Actor from './Actor';

export default class StaticActor extends Actor {
  isKinematic: boolean = true;

  static fromObject(object: MapObject): StaticActor {
    return new StaticActor(
      object.name,
      object.x,
      object.y,
      object.properties.sprite
    );
  }

  updatePhysicsResponse() {}
}

Entity.entityTypes.StaticActor = StaticActor;
