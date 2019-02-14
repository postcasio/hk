import Map from './Map';
import { MapFileLayer } from './Layer';

export interface MapFileObject {
  height: number;
  id: number;
  name: string;
  point: boolean;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  properties: {
    name: string;
    type: 'float' | 'string' | 'bool' | 'color' | 'file' | 'int';
    value: any;
  }[];
}

export class MapObject {
  height: number;
  id: number;
  name: string;
  point: boolean;
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
  properties: { [k: string]: any };

  constructor(data: MapFileObject) {
    this.height = data.height;
    this.id = data.id;
    this.name = data.name;
    this.point = data.point;
    this.rotation = data.rotation;
    this.type = data.type;
    this.visible = data.visible;
    this.width = data.width;
    this.x = data.x;
    this.y = data.y;
    this.properties = data.properties
      ? data.properties.reduce(
          (props, { name, type, value }) => {
            props[name] = value;

            return props;
          },
          {} as { [k: string]: any }
        )
      : {};
  }
}

export default class ObjectLayer {
  layerData: MapFileLayer;
  surface?: Surface;
  model?: Model;
  map: Map;
  width: number;
  height: number;
  objects: MapObject[];
  visible: boolean;
  x: number;
  y: number;
  shape?: Shape;

  constructor(map: Map, layerData: MapFileLayer) {
    this.map = map;
    this.layerData = layerData;

    this.width = layerData.width;
    this.height = layerData.height;
    this.objects = layerData.objects.map(object => new MapObject(object));

    this.visible = layerData.visible;
    this.x = layerData.x;
    this.y = layerData.y;

    this.prepare();
  }

  prepare() {}
}
