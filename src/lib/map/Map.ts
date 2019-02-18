import Tileset, { Tile } from './Tileset';
import { MapFile } from './Engine';
import Layer from './Layer';
import Camera from './Camera';
import ObjectLayer from './ObjectLayer';
import './entities';
import Entity from './entities/Entity';
import CutsceneController from '../CutsceneController';
import log from '../log';
import Game from '../Game';
import Actor from './entities/Actor';

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
  lastFrame: number = 0;

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

    const layerMap: Map<string, Layer> = new Map();

    this.layers = this.mapData!.layers.map(layer => {
      switch (layer.type) {
        case 'tilelayer':
          const layerInst = new Layer(this, layer);
          layerMap.set(layer.name, layerInst);
          return layerInst;
        case 'objectgroup':
          return new ObjectLayer(this, layer);
        default:
          throw new Error('Unsupported layer type: ' + layer.type);
      }
    });

    for (let layer of this.layers) {
      if (layer instanceof ObjectLayer && layer.objects) {
        for (const object of layer.objects) {
          const entity = Entity.createFromObject(object);
          entity.setMap(this);
          const desiredLayerName = object.properties.layer;
          if (desiredLayerName) {
            const desiredLayer = layerMap.get(String(desiredLayerName));
            if (!desiredLayer) {
              throw new Error(
                `Entity ${object.name} has non-existent layer ${String(
                  desiredLayerName
                )}`
              );
            }
            entity.setLayer(desiredLayer);
          } else {
            entity.setLayer(layer);
          }
          this.entities.set(object.name, entity);
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

    const zoom = camera.zoom * Game.current.config.globalPixelZoom;

    for (const layer of this.layers) {
      if (!layer.visible) {
        continue;
      }

      if (layer.shape && layer.surface) {
        const transform = new Transform();

        const sx = zoom * layer.surface.width;
        const sy = zoom * layer.surface.height;

        const x = -(camera.x * zoom - camera.frameW / 2) + camera.frameX;
        const y = -(camera.y * zoom - camera.frameH / 2) + camera.frameY;

        transform.scale(sx, sy);
        transform.translate(x, y);

        layer.shape!.draw(surface, transform);
      } else if (layer.objects) {
        for (const entity of this.entities.values()) {
          if (!(entity instanceof Actor)) {
            continue;
          }

          const transform = new Transform();

          const sx = zoom * entity.width;
          const sy = zoom * entity.height;

          const x = -(camera.x * zoom - camera.frameW / 2) + camera.frameX;
          const y = -(camera.y * zoom - camera.frameH / 2) + camera.frameY;

          transform.scale(sx, sy);
          transform.translate(
            x + (entity.x - entity.box.halfSize.x) * zoom,
            y + (entity.y - entity.box.halfSize.y) * zoom
          );

          entity.draw(surface, transform, zoom);
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

  getTile(id: number): Tile | null {
    for (let i = this.tilesets.length - 1; i >= 0; i--) {
      if (this.tilesets[i].firstgid <= id) {
        return this.tilesets[i].getTile(id);
      }
    }

    return null;
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

  update() {
    const now = Sphere.now();
    const last = this.lastFrame;
    this.lastFrame = now;

    if (last === 0) {
      return;
    }

    const delta = now - last;

    for (const entity of this.entities.values()) {
      if (!(entity instanceof Actor)) {
        continue;
      }
      entity.update(delta);
    }
  }

  addEntity(entity: Entity) {
    entity.setMap(this);
    this.entities.set(entity.name, entity);
  }
}
