import Tileset, { Tile } from './Tileset';
import Map from './Map';
import { MapFileObject, MapObject } from './ObjectLayer';
import { boxOffset } from './Physics';
import Prim from 'prim';
import log from '../log';
import { colorFromTiledARGB } from './utils';

const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;

export interface MapFileLayer {
  compression: 'zlib' | 'gzip' | '';
  data: number[];
  encoding: 'base64' | 'csv';
  width: number;
  height: number;
  id: number;
  name: string;
  opacity: number;
  type: 'tilelayer' | 'objectgroup' | 'imagelayer' | 'group';
  visible: boolean;
  x: number;
  y: number;
  objects: MapFileObject[];
  properties: {
    name: string;
    type: 'float' | 'string' | 'bool' | 'color' | 'file' | 'int';
    value: any;
  }[];
}

export default class Layer {
  layerData: MapFileLayer;
  surface?: Surface;
  model?: Model;
  map: Map;
  width: number;
  height: number;
  tiles: number[];
  visible: boolean;
  x: number;
  y: number;
  shape?: Shape;
  objects?: MapObject[];
  name: string;
  properties: {
    [k: string]: any;
    lighting?: boolean;
    lightingAmbientColor?: Color;
  };
  lighting?: Surface;

  constructor(map: Map, layerData: MapFileLayer) {
    this.map = map;
    this.layerData = layerData;

    this.name = layerData.name;
    this.width = layerData.width;
    this.height = layerData.height;
    this.tiles = layerData.data;
    this.visible = layerData.visible;
    this.x = layerData.x;
    this.y = layerData.y;

    this.properties = layerData!.properties
      ? layerData!.properties.reduce(
          (props, { name, type, value }) => {
            switch (type) {
              case 'color':
                log.debug(name, type, value);
                props[name] = colorFromTiledARGB(value);
                break;
              default:
                props[name] = value;
            }

            return props;
          },
          {} as { [k: string]: any }
        )
      : {};

    this.prepare();
  }

  prepare() {
    this.surface = new Surface(
      this.width * this.map.tilewidth,
      this.height * this.map.tileheight,
      Color.Transparent
    );

    if (this.properties.lighting) {
      this.lighting = new Surface(
        this.width * this.map.tilewidth,
        this.height * this.map.tileheight,
        Color.Transparent
      );
    }

    this.surface.blendOp = BlendOp.Replace;

    const sourceTile: {
      tileset: Tileset | null;
      x: number;
      y: number;
      w: number;
      h: number;
    } = {
      tileset: null,
      x: 0,
      y: 0,
      w: 0,
      h: 0
    };

    const mapTilewidth = this.map.tilewidth;
    const mapTileheight = this.map.tileheight;
    const mask = Color.White;

    for (let y = 0, i = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++, i++) {
        const gid =
          this.tiles[i] &
          ~(
            FLIPPED_DIAGONALLY_FLAG |
            FLIPPED_HORIZONTALLY_FLAG |
            FLIPPED_VERTICALLY_FLAG
          );

        const xpix = x * mapTilewidth;
        const ypix = y * mapTileheight;

        if (this.map.lookupTile(gid, sourceTile)) {
          const texw = sourceTile.tileset!.texture.width;
          const texh = sourceTile.tileset!.texture.height;
          const sxpix = sourceTile.x;
          const sypix = sourceTile.y;

          const x1 = xpix;
          const y1 = ypix;
          const x2 = xpix + sourceTile.w;
          const y2 = ypix + sourceTile.h;

          const u1 = sxpix / texw;
          const v1 = 1.0 - sypix / texh;
          const u2 = (sxpix + sourceTile.w) / texw;
          const v2 = 1.0 - (sypix + sourceTile.h) / texh;

          Shape.drawImmediate(
            this.surface,
            ShapeType.TriStrip,
            sourceTile.tileset!.texture,
            [
              { x: x1, y: y1, u: u1, v: v1, color: mask },
              { x: x2, y: y1, u: u2, v: v1, color: mask },
              { x: x1, y: y2, u: u1, v: v2, color: mask },
              { x: x2, y: y2, u: u2, v: v2, color: mask }
            ]
          );
        }
      }
    }

    const vertexList = [
      { x: 0, y: 0, u: 0, v: 1, color: mask },
      { x: 1, y: 0, u: 1, v: 1, color: mask },
      { x: 0, y: 1, u: 0, v: 0, color: mask },
      { x: 1, y: 1, u: 1, v: 0, color: mask }
    ];

    this.shape = new Shape(
      ShapeType.TriStrip,
      this.surface,
      new VertexList(vertexList)
    );
  }

  getTileAt(xpix: number, ypix: number): Tile | null {
    const tw = this.map.tilewidth;
    const th = this.map.tileheight;

    const x = Math.floor(xpix / tw);
    const y = Math.floor(ypix / th);

    const i = y * this.width + x;
    const gid =
      this.tiles[i] &
      ~(
        FLIPPED_DIAGONALLY_FLAG |
        FLIPPED_HORIZONTALLY_FLAG |
        FLIPPED_VERTICALLY_FLAG
      );

    const tile = this.map.getTile(gid);

    if (tile && tile.box) {
      tile.box = boxOffset(tile.box, x * tw, y * th);
    }

    return tile;
  }

  drawCollisions(
    target: Surface,
    offsetX: number,
    offsetY: number,
    zoom: number
  ) {
    let sourceTile: Tile | null = null;

    const mapTilewidth = this.map.tilewidth;
    const mapTileheight = this.map.tileheight;
    const color = new Color(1, 0.2, 0.2, 0.4);
    const colorOneWay = new Color(0.2, 0.2, 1, 0.4);

    for (let y = 0, i = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++, i++) {
        const gid =
          this.tiles[i] &
          ~(
            FLIPPED_DIAGONALLY_FLAG |
            FLIPPED_HORIZONTALLY_FLAG |
            FLIPPED_VERTICALLY_FLAG
          );

        const xpix = x * mapTilewidth * zoom;
        const ypix = y * mapTileheight * zoom;

        if ((sourceTile = this.map.getTile(gid)) && sourceTile.box) {
          const x1 = xpix;
          const y1 = ypix;

          const box = sourceTile.box;

          Prim.drawSolidRectangle(
            target,
            x1 + offsetX + (box.center.x - box.halfSize.x) * zoom,
            y1 + offsetY + (box.center.y - box.halfSize.y) * zoom,
            box.halfSize.x * 2 * zoom,
            box.halfSize.y * 2 * zoom,
            sourceTile.properties.oneway ? colorOneWay : color
          );
        }
      }
    }
  }
}
