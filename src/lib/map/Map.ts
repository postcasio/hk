import Tileset from './Tileset';
import { MapFile } from './Engine';
import Layer from './Layer';
import Camera from './Camera';
import ObjectLayer from './ObjectLayer';
import Prim from 'prim';
import './entities';
import Entity from './entities/Entity';
import CutsceneController from '../CutsceneController';
import log from '../log';

const DEBUG = true;

export default class Map_ {
  mapData: MapFile | null = null;
  path?: string;
  tilesets: Tileset[] = [];
  layers?: (Layer | ObjectLayer)[] = [];
  tilewidth: number = 0;
  tileheight: number = 0;
  zoom: number = 3;
  width: number;
  height: number;
  entities: Map<string, Entity> = new Map();
  properties: {
    [k: string]: any;

    cutsceneEnter?: string;
    cutsceneLeave?: string;
  };

  constructor(path: string) {
    log.debug(`Loading map: ${path}`);

    this.path = path;
    this.mapData = JSON.parse(FS.readFile(path));
    this.tilewidth = this.mapData!.tilewidth;
    this.tileheight = this.mapData!.tileheight;
    this.width = this.mapData!.width;
    this.height = this.mapData!.height;
    this.tilesets = this.mapData!.tilesets.map(tilesetData => {
      const tilesetPath = FS.fullPath(
        tilesetData.source,
        FS.directoryOf(path).replace(/\/$/, '')
      );

      const tileset = new Tileset(tilesetPath, tilesetData.firstgid);
      return tileset;
    });

    this.layers = this.mapData!.layers.map(layer => {
      switch (layer.type) {
        case 'tilelayer':
          return new Layer(this, layer);
        case 'objectgroup':
          return new ObjectLayer(this, layer);
        default:
          throw new Error('Unsupported layer type: ' + layer.type);
      }
    });

    for (let layer of this.layers) {
      if (layer instanceof ObjectLayer) {
        for (const object of layer.objects) {
          this.entities.set(object.name, Entity.createFromObject(object));
        }
      }
    }

    this.properties = this.mapData!.properties
      ? this.mapData!.properties.reduce(
          (props, { name, type, value }) => {
            props[name] = value;

            return props;
          },
          {} as { [k: string]: any }
        )
      : {};
  }

  draw(surface: Surface, camera: Camera) {
    if (!this.layers) {
      return;
    }

    for (const layer of this.layers) {
      if (layer.shape && layer.surface) {
        const transform = new Transform();

        const sx = camera.zoom * layer.surface.width;
        const sy = camera.zoom * layer.surface.height;

        const x = -(camera.x * camera.zoom - camera.frameW / 2) + camera.frameX;
        const y = -(camera.y * camera.zoom - camera.frameH / 2) + camera.frameY;

        transform.scale(sx, sy);
        transform.translate(x, y);

        layer.shape!.draw(surface, transform);
      } else if (layer.objects && DEBUG) {
        const objects = layer.objects!;

        for (const obj of objects) {
          const sx =
            camera.frameX +
            camera.frameW / 2 +
            (obj.x - camera.x) * camera.zoom;
          const sy =
            camera.frameY +
            camera.frameH / 2 +
            (obj.y - camera.y) * camera.zoom;

          Prim.drawSolidEllipse(
            surface,
            sx,
            sy,
            5,
            5,
            Color.White,
            new Color(1, 1, 1, 0.2)
          );

          Font.Default.drawText(
            surface,
            sx,
            sy - Font.Default.height,
            obj.name
          );
        }
      }
    }
  }

  lookupTile(
    id: number,
    out: { tileset: Tileset | null; x: number; y: number; w: number; h: number }
  ): boolean {
    for (let i = this.tilesets.length - 1; i >= 0; i--) {
      if (this.tilesets[i].firstgid <= id) {
        out.tileset = this.tilesets[i];
        this.tilesets[i].lookupTile(id, out);
        return true;
      }
    }

    return false;
  }

  findEntity(name: string): Entity | undefined {
    return this.entities.get(name);
  }

  findEntities<T extends Entity>(type: { new (...args: any[]): T }): T[] {
    return Array.from(this.entities.values()).filter(
      entity => entity.constructor === type
    ) as T[];
  }

  async mapDidLeave() {
    if (this.properties.cutsceneLeave) {
      log.debug('Starting cutscene ' + this.properties.cutsceneLeave);

      const controller = new CutsceneController(
        (await import('cutscenes/' + this.properties.cutsceneLeave)).default
      );
      await controller.exec();
    }
  }

  async mapDidEnter() {
    if (this.properties.cutsceneEnter) {
      log.debug('Starting cutscene ' + this.properties.cutsceneEnter);

      const controller = new CutsceneController(
        (await import('./cutscenes/' + this.properties.cutsceneEnter)).default
      );
      await controller.exec();
    }
  }
}
