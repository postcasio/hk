import log from '../log';
import { Box } from './Physics';
import { MapFileObject } from './ObjectLayer';

export interface TilesetFileTile {
  id: number;
  objectgroup: {
    draworder: string;
    name: string;
    objects: MapFileObject[];
    opacity: number;
    type: string;
    visible: boolean;
    x: number;
    y: number;
  };
}

export interface TilesetFile {
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tileheight: number;
  tilewidth: number;
  type: 'tileset';
  version: number;
  tiles?: TilesetFileTile[];
}

export interface Tile {
  index: number;
  box?: Box;
  properties: { [k: string]: any; oneway?: boolean };
}

export default class Tileset {
  path: string;
  firstgid: number;
  tilesetData: TilesetFile;
  texture: Texture;

  width: number;
  height: number;

  tilewidth: number;
  tileheight: number;

  tilecount: number;
  columns: number;
  margin: number;
  tiles: Map<number, Tile>;

  constructor(path: string, firstgid: number) {
    log.debug(`Loading tileset: ${path}`);

    this.path = path;
    this.firstgid = firstgid;

    this.tilesetData = JSON.parse(FS.readFile(this.path));
    const texturePath = FS.fullPath(
      this.tilesetData.image,
      FS.directoryOf(this.path)
    );
    log.debug(`Loading tileset texture: ${texturePath}`);
    this.texture = new Texture(texturePath);

    this.width = this.tilesetData.imagewidth;
    this.height = this.tilesetData.imageheight;
    this.tilewidth = this.tilesetData.tilewidth;
    this.tileheight = this.tilesetData.tileheight;
    this.tilecount = this.tilesetData.tilecount;
    this.columns = this.tilesetData.columns;
    this.margin = this.tilesetData.margin;
    this.tiles = new Map(
      this.tilesetData.tiles!.map(
        (tile): [number, Tile] => {
          let box: Box | undefined = undefined;
          let properties: { [k: string]: any } = {};

          if (tile.objectgroup.objects.length) {
            const object = tile.objectgroup.objects[0];
            const halfw = object.width / 2;
            const halfh = object.height / 2;
            box = {
              center: { x: object.x + halfw, y: object.y + halfh },
              halfSize: { x: halfw, y: halfh }
            };
            properties = object.properties
              ? object.properties.reduce(
                  (props, { name, type, value }) => {
                    props[name] = value;

                    return props;
                  },
                  {} as { [k: string]: any }
                )
              : {};
          }
          return [
            tile.id,
            {
              index: tile.id,
              box,
              properties
            }
          ];
        }
      )
    );
  }

  lookupTile(
    id: number,
    out: { x: number; y: number; w: number; h: number }
  ): boolean {
    const index = id - this.firstgid;
    const x = index % this.columns;
    out.x = x * this.tilewidth;
    out.y = ((index - x) / this.columns) * this.tileheight;
    out.w = this.tilewidth;
    out.h = this.tileheight;

    return true;
  }

  getTile(id: number): Tile | null {
    const index = id - this.firstgid;
    const tile = this.tiles.get(index);

    return tile
      ? {
          box: tile.box
            ? {
                center: { ...tile.box.center },
                halfSize: { ...tile.box.halfSize }
              }
            : undefined,
          properties: tile.properties,
          index: tile.index
        }
      : null;
  }
}
