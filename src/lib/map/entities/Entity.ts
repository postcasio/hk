import { MapObject } from '../ObjectLayer';
import Map_ from '../Map';
import Layer from '../Layer';
import Camera from '../Camera';

export default class Entity {
  name: string;
  x: number;
  y: number;
  map?: Map_;
  layer?: Layer;
  camera?: Camera;

  static entityTypes: {
    [k: string]: { fromObject: (object: MapObject) => Entity };
  } = {};

  constructor(name: string, x: number, y: number) {
    this.name = name;
    this.x = x;
    this.y = y;
  }

  setMap(map: Map_) {
    this.map = map;
  }

  getLayer() {
    return this.layer;
  }

  setLayer(layer: Layer) {
    this.layer = layer;
  }

  draw(target: Surface, transform: Transform, scale: number) {}

  update(delta: number) {
    if (this.camera) {
      this.camera.x = this.x;
      this.camera.y = this.y;
    }
  }

  static fromObject(object: MapObject): Entity {
    throw new Error('Cannot construct the Entity base class');
  }

  static createFromObject(object: MapObject): Entity {
    if (!Entity.entityTypes[object.type]) {
      throw new Error('Unknown entity type ' + object.type);
    }

    return Entity.entityTypes[object.type].fromObject(object);
  }

  attachCamera(camera: Camera) {
    this.camera = camera;
  }
}
