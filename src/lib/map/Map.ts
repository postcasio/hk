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
import Prim from 'prim';
import { colorFromTiledRGB } from './utils';
import { Vec2, vec2eq, boxOverlapsSigned, vec2copy, vec2mul } from './Physics';
import { Collision } from './Collision';

const SubtractInverse = new BlendOp(
  BlendType.SubtractInverse,
  Blend.One,
  Blend.One, // (s.rgb * s.a) + (d.rgb * (1 - s.a)) = standard alpha blend
  BlendType.Add,
  Blend.One,
  Blend.Zero // (1 * s.a) + (0 * d.a) = copy src alpha to dest
);
const lightWhite = new Color(0.2, 0.2, 0.2);

export default class Map_ {
  mapData: MapFile | null = null;
  path?: string;
  tilesets: Tileset[] = [];
  layers?: (Layer | ObjectLayer)[] = [];
  lightingLayer?: Layer;
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
  backgroundcolor?: Color;
  gridAreaWidth: number = 128;
  gridAreaHeight: number = 128;
  gridAreaActors: Actor[][][] = [];

  constructor(path: string) {
    log.debug(`Loading map: ${path}`);

    this.path = path;
    this.mapData = JSON.parse(FS.readFile(path));
    this.tilewidth = this.mapData!.tilewidth;
    this.tileheight = this.mapData!.tileheight;
    this.width = this.mapData!.width;
    this.height = this.mapData!.height;

    const horizontalAreaCount = Math.ceil(
      (this.width * this.tilewidth) / this.gridAreaWidth
    );
    const verticalAreaCount = Math.ceil(
      (this.height * this.tileheight) / this.gridAreaHeight
    );

    for (let x = 0; x < horizontalAreaCount; x++) {
      this.gridAreaActors[x] = [];
      for (let y = 0; y < verticalAreaCount; y++) {
        this.gridAreaActors[x][y] = [];
      }
    }

    if (this.mapData!.backgroundcolor) {
      this.backgroundcolor = colorFromTiledRGB(this.mapData!.backgroundcolor);
    }
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
          if (layerInst.properties.lighting) {
            this.lightingLayer = layerInst;
          }
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
    const debug = Game.current.config.debugCollision;
    const hero = this.findEntity('hero') as Actor;

    const zoom = camera.zoom * Game.current.config.globalPixelZoom;
    Prim.drawSolidRectangle(
      surface,
      camera.frameX,
      camera.frameY,
      camera.frameW,
      camera.frameH,
      this.backgroundcolor || Color.Black
    );
    for (const layer of this.layers) {
      if (!layer.visible) {
        continue;
      }

      if (layer instanceof Layer && layer.surface && layer.shape) {
        const transform = new Transform();

        const sx = zoom * layer.surface.width;
        const sy = zoom * layer.surface.height;

        const x = -(camera.x * zoom - camera.frameW / 2) + camera.frameX;
        const y = -(camera.y * zoom - camera.frameH / 2) + camera.frameY;

        transform.scale(sx, sy);
        transform.translate(x, y);

        if (layer.properties.lighting && hero) {
          const lightRadius = 48;
          const lightSurface = camera.getLightSurface();
          lightSurface.blendOp = BlendOp.Replace;
          const lightX = hero.x * zoom + x;
          const lightY = hero.y * zoom + y;
          Prim.drawSolidRectangle(
            lightSurface,
            0,
            0,
            lightSurface.width,
            lightSurface.height,
            layer.properties.lightingAmbientColor || lightWhite
          );
          Prim.drawSolidEllipse(
            lightSurface,
            lightX,
            lightY,
            lightRadius * zoom,
            lightRadius * zoom,
            Color.Black,
            layer.properties.lightingAmbientColor || lightWhite
          );
          lightSurface.blendOp = SubtractInverse;
          layer.shape.draw(lightSurface, transform);
          Prim.blit(surface, 0, 0, lightSurface);
        } else {
          layer.shape.draw(surface, transform);
        }

        if (debug) {
          layer.drawCollisions(surface, x, y, zoom);
        }
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

          entity.draw(surface, transform, x, y, zoom);

          if (debug) {
            Prim.drawRectangle(
              surface,
              x + (entity.box.center.x - entity.box.halfSize.x) * zoom,
              y + (entity.box.center.y - entity.box.halfSize.y) * zoom,
              entity.box.halfSize.x * 2 * zoom,
              entity.box.halfSize.y * 2 * zoom,
              2,
              Color.White
            );
            if (entity.isPlayer) {
              const interactBox = {
                center: { x: entity.box.center.x, y: entity.box.center.y },
                halfSize: {
                  x: entity.box.halfSize.x * 4,
                  y: entity.box.halfSize.y * 2
                }
              };
              Prim.drawRectangle(
                surface,
                x + (interactBox.center.x - interactBox.halfSize.x) * zoom,
                y + (interactBox.center.y - interactBox.halfSize.y) * zoom,
                interactBox.halfSize.x * 2 * zoom,
                interactBox.halfSize.y * 2 * zoom,
                2,
                Color.White
              );
            }
            Font.Default.drawText(
              surface,
              x + (entity.box.center.x - entity.box.halfSize.x) * zoom,
              y + (entity.box.center.y - entity.box.halfSize.y) * zoom,
              String(entity.areas.length)
            );
            Prim.drawLine(
              surface,
              x + entity.box.center.x * zoom,
              y + entity.box.center.y * zoom,
              x + (entity.box.center.x + entity.velocity.x * 4) * zoom,
              y + (entity.box.center.y + entity.velocity.y * 4) * zoom,
              4,
              Color.Red
            );
          }
        }
      }
    }

    if (debug) {
      const sx = zoom;
      const sy = zoom;

      const xoff = -(camera.x * zoom - camera.frameW / 2) + camera.frameX;
      const yoff = -(camera.y * zoom - camera.frameH / 2) + camera.frameY;
      const c1 = new Color(1, 0.2, 0.2, 0.05);
      const c2 = new Color(0.2, 1, 0.2, 0.05);
      const c3 = new Color(1, 0, 0, 0.1);
      const c4 = new Color(0, 1, 0, 0.1);
      for (let x = 0; x < this.gridAreaActors.length; x++) {
        for (let y = 0; y < this.gridAreaActors[x].length; y++) {
          const active = this.gridAreaActors[x][y].includes(hero);
          Prim.drawSolidRectangle(
            surface,
            x * this.gridAreaWidth * sx + xoff,
            y * this.gridAreaHeight * sy + yoff,
            this.gridAreaWidth * sx,
            this.gridAreaHeight * sy,
            (y + x) % 2 ? (active ? c3 : c1) : active ? c4 : c2
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
      entity.collisions = [];
      entity.interactCollisions = [];
    }

    this.checkCollisions();

    for (const entity of this.entities.values()) {
      if (!(entity instanceof Actor)) {
        continue;
      }

      entity.updatePhysicsResponse();
    }
  }

  addEntity(entity: Entity) {
    entity.setMap(this);
    this.entities.set(entity.name, entity);
    if (entity instanceof Actor) {
      this.updateActorAreas(entity);
    }
  }

  updateActorAreas(actor: Actor) {
    let { center, halfSize } = actor.box;

    if (actor.isPlayer) {
      // account for the Interact Box.
      halfSize = vec2mul(vec2copy(halfSize), { x: 4, y: 2 });
    }

    const x1 = Math.floor((center.x - halfSize.x) / this.gridAreaWidth);
    const y1 = Math.floor((center.y - halfSize.y) / this.gridAreaHeight);
    const x2 = Math.floor((center.x + halfSize.x) / this.gridAreaWidth);
    const y2 = y1;
    const x3 = x2;
    const y3 = Math.floor((center.y + halfSize.y) / this.gridAreaHeight);
    const x4 = x1;
    const y4 = y3;

    const areas: Vec2[] = [];

    if (x1 === x2 && y1 === y4) {
      areas.push({ x: x1, y: y1 });
    } else if (x1 === x2) {
      areas.push({ x: x1, y: y1 }, { x: x3, y: y3 });
    } else if (y1 === y4) {
      areas.push({ x: x1, y: y1 }, { x: x2, y: y2 });
    } else {
      areas.push(
        { x: x1, y: y1 },
        { x: x2, y: y2 },
        { x: x3, y: y3 },
        { x: x4, y: y4 }
      );
    }

    const oldAreas = actor.areas;
    const oldIds = actor.idsInAreas;

    for (let i = 0; i < oldAreas.length; i++) {
      let includes = false;
      for (let j = 0; j < areas.length; j++) {
        if (vec2eq(areas[j], oldAreas[i])) {
          includes = true;
          break;
        }
      }

      if (!includes) {
        this.removeActorFromArea(actor, oldAreas[i], oldIds[i]);
        oldAreas.splice(i, 1);
        oldIds.splice(i, 1);
        i--;
        break;
      }
    }

    for (let i = 0; i < areas.length; i++) {
      let includes = false;
      for (let j = 0; j < oldAreas.length; j++) {
        if (vec2eq(areas[i], oldAreas[j])) {
          includes = true;
          break;
        }
      }

      if (!includes) {
        this.addActorToArea(actor, areas[i]);
      }
    }
  }

  addActorToArea(actor: Actor, area: Vec2) {
    if (
      this.gridAreaActors[area.x] === undefined ||
      this.gridAreaActors[area.x][area.y] === undefined
    ) {
      return;
    }

    const entityList = this.gridAreaActors[area.x][area.y];

    actor.areas.push(area);
    actor.idsInAreas.push(entityList.length);

    entityList.push(actor);
  }

  removeActorFromArea(actor: Actor, area: Vec2, index: number) {
    if (
      this.gridAreaActors[area.x] === undefined ||
      this.gridAreaActors[area.x][area.y] === undefined
    ) {
      return;
    }

    const entityList = this.gridAreaActors[area.x][area.y];
    const tmp = entityList[entityList.length - 1];
    entityList[entityList.length - 1] = actor;
    entityList[index] = tmp;

    var tmpIds = tmp.idsInAreas;
    var tmpAreas = tmp.areas;
    for (let i = 0; i < tmpAreas.length; ++i) {
      if (vec2eq(tmpAreas[i], area)) {
        tmpIds[i] = index;
        break;
      }
    }

    entityList.pop();
  }

  checkCollisions() {
    const gridHorizontalCount = this.gridAreaActors.length;
    const gridVerticalCount = this.gridAreaActors[0].length;

    for (let x = 0; x < gridHorizontalCount; ++x) {
      for (let y = 0; y < gridVerticalCount; ++y) {
        var actors = this.gridAreaActors[x][y];

        for (let i = 0; i < actors.length - 1; ++i) {
          const actor = actors[i];
          let interactBox;
          if (actor.isPlayer) {
            interactBox = {
              center: { x: actor.box.center.x, y: actor.box.center.y },
              halfSize: {
                x: actor.box.halfSize.x * 4,
                y: actor.box.halfSize.y * 2
              }
            };
          }

          for (let j = i + 1; j < actors.length; ++j) {
            const other = actors[j];
            const overlap: Partial<Vec2> = {};

            if (other.isPlayer) {
              interactBox = {
                center: { x: other.box.center.x, y: other.box.center.y },
                halfSize: {
                  x: other.box.halfSize.x * 4,
                  y: other.box.halfSize.y * 2
                }
              };
            }

            if (interactBox) {
              if (
                boxOverlapsSigned(
                  actor.isPlayer ? interactBox : actor.box,
                  actor.isPlayer ? other.box : interactBox,
                  overlap
                ) &&
                !actor.hasInteractCollisionWith(other)
              ) {
                actor.interactCollisions.push(
                  new Collision(
                    other,
                    overlap as Vec2,
                    vec2copy(actor.velocity),
                    vec2copy(other.velocity),
                    vec2copy(actor.oldPosition),
                    vec2copy(other.oldPosition),
                    vec2copy(actor.position),
                    vec2copy(other.position)
                  )
                );
                other.interactCollisions.push(
                  new Collision(
                    actor,
                    { x: -overlap.x!, y: -overlap.y! },
                    vec2copy(other.velocity),
                    vec2copy(actor.velocity),
                    vec2copy(other.oldPosition),
                    vec2copy(actor.oldPosition),
                    vec2copy(other.position),
                    vec2copy(actor.position)
                  )
                );
              }
            }

            if (
              !boxOverlapsSigned(actor.box, other.box, overlap) ||
              actor.hasCollisionWith(other)
            ) {
              continue;
            }

            actor.collisions.push(
              new Collision(
                other,
                overlap as Vec2,
                vec2copy(actor.velocity),
                vec2copy(other.velocity),
                vec2copy(actor.oldPosition),
                vec2copy(other.oldPosition),
                vec2copy(actor.position),
                vec2copy(other.position)
              )
            );
            other.collisions.push(
              new Collision(
                actor,
                { x: -overlap.x!, y: -overlap.y! },
                vec2copy(other.velocity),
                vec2copy(actor.velocity),
                vec2copy(other.oldPosition),
                vec2copy(actor.oldPosition),
                vec2copy(other.position),
                vec2copy(actor.position)
              )
            );
          }
        }
      }
    }
  }
}
