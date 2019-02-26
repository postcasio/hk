import Actor from './Actor';
import Entity from './Entity';
import { MapObject } from '../ObjectLayer';

export default class NPC extends Actor {
  isKinematic = true;

  static fromObject(object: MapObject): NPC {
    return new NPC(object.name, object.x, object.y, object.properties.sprite, {
      scripts: {
        talk: object.properties.cutsceneTalk
      }
    });
  }
}

Entity.entityTypes.NPC = NPC;
