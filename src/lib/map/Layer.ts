import Tileset from './Tileset';
import Map from './Map';
import { MapFileObject } from './ObjectLayer';

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
  objects?: null = null;

  constructor(map: Map, layerData: MapFileLayer) {
    this.map = map;
    this.layerData = layerData;

    this.width = layerData.width;
    this.height = layerData.height;
    this.tiles = layerData.data;
    this.visible = layerData.visible;
    this.x = layerData.x;
    this.y = layerData.y;

    this.prepare();
  }

  prepare() {
    this.surface = new Surface(
      this.width * this.map.tilewidth,
      this.height * this.map.tileheight,
      Color.Transparent
    );

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

          // Prim.blitSection(
          //   this.surface,s
          //   xpix * zoom,
          //   ypix * zoom,
          //   sourceTile.tileset!.texture,
          //   sourceTile.x,
          //   sourceTile.y,
          //   sourceTile.w,
          //   sourceTile.h
          // );
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

  // createModel() {
  //   let x = 0;
  //   let y = 0;
  //   const shapes = [];
  //   const tileset = this.engine.tilesets[0];
  //   // const width = this.layerData.width * tileset.tilewidth;
  //   // const height = this.layerData.height * tileset.tileheight;

  //   for (let tileIndex of this.layerData.data) {
  //     // const flippedHoriz = tileIndex & FLIPPED_HORIZONTALLY_FLAG;
  //     // const flippedDiag = tileIndex & FLIPPED_DIAGONALLY_FLAG;
  //     // const flippedVert = tileIndex & FLIPPED_VERTICALLY_FLAG;

  //     tileIndex &= ~(
  //       FLIPPED_DIAGONALLY_FLAG |
  //       FLIPPED_HORIZONTALLY_FLAG |
  //       FLIPPED_VERTICALLY_FLAG
  //     );

  //     if (tileIndex >= tileset.firstgid) {
  //       const index = tileIndex - tileset.firstgid + 2;

  //       const widthInTiles = tileset.imagewidth / tileset.tilewidth;
  //       const srcx = ((index + 1) % widthInTiles) * tileset.tilewidth;
  //       const srcy = Math.floor(index / widthInTiles) * tileset.tileheight;

  //       log.debug([
  //         tileset.texture,
  //         srcx / tileset.texture.width,
  //         srcy / tileset.texture.height,
  //         tileset.tilewidth / tileset.texture.width,
  //         tileset.tileheight / tileset.texture.height,
  //         x * tileset.tilewidth,
  //         y * tileset.tilewidth,
  //         tileset.tilewidth,
  //         tileset.tilewidth
  //       ]);

  //       shapes.push(
  //         createShape(
  //           tileset.texture,
  //           srcx / tileset.texture.width,
  //           srcy / tileset.texture.height,
  //           tileset.tilewidth / tileset.texture.width,
  //           tileset.tileheight / tileset.texture.height,
  //           x * tileset.tilewidth,
  //           y * tileset.tilewidth,
  //           tileset.tilewidth,
  //           tileset.tilewidth
  //         )
  //       );
  //     }
  //     if (++x === this.layerData.width) {
  //       x = 0;
  //       y++;
  //     }
  //   }

  //   return (this.model = new Model(shapes));
  // }
}
