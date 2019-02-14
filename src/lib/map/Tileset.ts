import log from '../log';

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
}
