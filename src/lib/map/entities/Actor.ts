import Entity from './Entity';
import { MapObject } from '../ObjectLayer';
import Sprite from '../../Sprite';
import ActorController from './Controllers/ActorController';
import { vec2add, vec2mul, Vec2, vec2copy, Box, boxOverlaps } from '../Physics';
import log from '../../log';
import { Collision } from '../Collision';
import { getEngine } from '../../commands/map';
import Game from '../../Game';
import CutsceneController from '../../CutsceneController';

export enum CharacterState {
  Idle,
  Walk,
  Jump,
  WallLeft,
  WallRight
}
export interface ActorOptions {
  gravity: number;
  controller?: ActorController;
  scripts?: {
    [k: string]: string | undefined;
    talk?: string;
  };
}

export default class Actor extends Entity {
  sprite: Sprite;
  width: number;
  height: number;

  options: ActorOptions;

  velocity: Vec2 = { x: 0, y: 0 };
  oldVelocity: Vec2 = { x: 0, y: 0 };
  position: Vec2 = { x: 0, y: 0 };
  oldPosition: Vec2 = { x: 0, y: 0 };
  box: Box = { center: { x: 0, y: 0 }, halfSize: { x: 0, y: 0 } };
  isPlayer: boolean = false;
  pushedRightTile: boolean = false;
  pushesRightTile: boolean = false;
  pushedLeftTile: boolean = false;
  pushesLeftTile: boolean = false;

  pushesRight: boolean = false;
  pushesLeft: boolean = false;
  pushesBottom: boolean = false;
  pushesTop: boolean = false;

  pushedTop: boolean = false;
  pushedBottom: boolean = false;
  pushedRight: boolean = false;
  pushedLeft: boolean = false;

  pushesLeftObject: boolean = false;
  pushesRightObject: boolean = false;
  pushesBottomObject: boolean = false;
  pushesTopObject: boolean = false;

  pushedLeftObject: boolean = false;
  pushedRightObject: boolean = false;
  pushedBottomObject: boolean = false;
  pushedTopObject: boolean = false;

  pushesBottomTile: boolean = false;
  pushesTopTile: boolean = false;
  pushedTopTile: boolean = false;
  pushedBottomTile: boolean = false;

  state: CharacterState = CharacterState.Idle;
  collisions: Collision[] = [];
  interactCollisions: Collision[] = [];

  isKinematic: boolean = false;

  static defaultOptions: ActorOptions = {
    gravity: 1.0
  };

  constructor(
    name: string,
    x: number,
    y: number,
    sprite: string | Sprite,
    options?: Partial<ActorOptions>
  ) {
    super(name, x, y);

    log.debug(`Creating Actor(${name}) at ${x},${y}`);

    this.options = { ...Actor.defaultOptions, ...options };

    this.sprite =
      typeof sprite === 'string'
        ? new Sprite(`res/sprite/${sprite}.json`)
        : sprite;

    this.width = this.sprite.currentAnimationFrame.sourceSize.w;
    this.height = this.sprite.currentAnimationFrame.sourceSize.h;

    this.box.halfSize.x = this.width / 2;
    this.box.halfSize.y = this.height / 2;

    this.position = { x: this.x, y: this.y };
    this.oldPosition = { ...this.position };

    this.box.center = this.position;

    this.sprite.beginAnimating();
  }

  draw(
    target: Surface,
    transform: Transform,
    offsetX: number,
    offsetY: number,
    scale: number
  ) {
    // transform.translate(this.x, this.y);
    this.sprite.draw(target, transform, Color.White);
  }

  update(delta: number) {
    if (this.options.controller) {
      this.options.controller.update(this, delta);
    }

    this.updatePhysics(delta);

    super.update(delta);
  }

  updatePhysics(delta: number) {
    this.oldPosition = vec2copy(this.position);
    this.oldVelocity = vec2copy(this.velocity);
    this.pushedLeftTile = this.pushesLeftTile;
    this.pushedRightTile = this.pushesRightTile;
    this.pushedTopTile = this.pushesTopTile;
    this.pushedBottomTile = this.pushesBottomTile;
    this.pushedBottomObject = this.pushesBottomObject;
    this.pushedRightObject = this.pushesRightObject;
    this.pushedLeftObject = this.pushesLeftObject;
    this.pushedTopObject = this.pushesTopObject;

    const workVec: Vec2 = { x: this.velocity.x, y: this.velocity.y };
    const deltaVec: Vec2 = { x: delta, y: delta };

    vec2mul(workVec, deltaVec);
    vec2add(this.position, workVec);

    const collision: { box?: Box } = {};

    this.box.center = this.position;

    if (
      this.velocity.y >= 0 &&
      this.hasGround(this.oldPosition, this.position, this.velocity, collision)
    ) {
      this.position.y =
        collision.box!.center.y -
        collision.box!.halfSize.y -
        this.box.halfSize.y;
      // this.velocity.y = 0;
      this.pushesBottomTile = true;
    } else {
      this.pushesBottomTile = false;
    }

    if (
      this.velocity.y < 0 &&
      this.hasCeiling(this.oldPosition, this.position, this.velocity, collision)
    ) {
      this.position.y =
        collision.box!.center.y +
        collision.box!.halfSize.y +
        this.box.halfSize.y;
      this.velocity.y *= 0.5;
      this.pushesTopTile = true;
    } else {
      this.pushesTopTile = false;
    }

    if (
      this.velocity.x < 0 &&
      this.hasLeftWall(
        this.oldPosition,
        this.position,
        this.velocity,
        collision
      )
    ) {
      this.pushesLeftTile = true;
      this.velocity.x = 0;
      this.position.x =
        collision.box!.center.x +
        collision.box!.halfSize.x +
        this.box.halfSize.x;
    } else {
      this.pushesLeftTile = false;
    }

    if (
      this.velocity.x > 0 &&
      this.hasRightWall(
        this.oldPosition,
        this.position,
        this.velocity,
        collision
      )
    ) {
      this.pushesRightTile = true;
      this.velocity.x = 0;
      this.position.x =
        collision.box!.center.x -
        collision.box!.halfSize.x -
        this.box.halfSize.x;
    } else {
      this.pushesRightTile = false;
    }

    this.pushesBottom = this.pushesBottomTile || this.pushesBottomObject;
    this.pushesRight = this.pushesRightTile || this.pushesRightObject;
    this.pushesLeft = this.pushesLeftTile || this.pushesLeftObject;
    this.pushesTop = this.pushesTopTile || this.pushesTopObject;

    this.x = this.position.x;
    this.y = this.position.y;

    this.map!.updateActorAreas(this);
  }

  hasGround(oldPos: Vec2, pos: Vec2, vel: Vec2, out?: { box?: Box }) {
    const center = this.box.center;
    const halfSize = this.box.halfSize;

    const left = center.x - halfSize.x + 2;
    const right = center.x + halfSize.x - 2;
    const y = center.y + halfSize.y + 1;

    for (let check = left; ; check += this.map!.tilewidth) {
      check = Math.min(check, right);

      const tile = this.layer!.getTileAt(check, y);

      if (tile && tile.box) {
        const box = tile.box;

        if (boxOverlaps(this.box, box)) {
          if (out !== undefined) {
            out.box = box;
          }
          return true;
        }
      }

      if (check >= right) {
        return false;
      }
    }
  }

  hasCeiling(oldPos: Vec2, pos: Vec2, vel: Vec2, out?: { box?: Box }) {
    const center = this.box.center;
    const halfSize = this.box.halfSize;

    const left = center.x - halfSize.x + 1;
    const right = center.x + halfSize.x - 2;
    const y = center.y - halfSize.y - 1;

    for (let check = left; ; check += this.map!.tilewidth) {
      check = Math.min(check, right);

      const tile = this.layer!.getTileAt(check, y);

      if (tile && tile.box && !tile.properties.oneway) {
        const box = tile.box;
        if (boxOverlaps(this.box, box)) {
          if (out !== undefined) {
            out.box = box;
          }
          return true;
        }
      }

      if (check >= right) {
        return false;
      }
    }
  }

  hasLeftWall(oldPos: Vec2, pos: Vec2, vel: Vec2, out?: { box?: Box }) {
    const center = this.box.center;
    const halfSize = this.box.halfSize;

    const top = center.y - halfSize.y + 1;
    const bottom = center.y + halfSize.y - 2;

    const x = center.x - halfSize.x - 1;

    for (let check = top; ; check += this.map!.tileheight) {
      check = Math.min(check, bottom);

      const tile = this.layer!.getTileAt(x, check);

      if (tile && tile.box && !tile.properties.oneway) {
        const box = tile.box;
        if (boxOverlaps(this.box, box)) {
          if (out !== undefined) {
            out.box = box;
          }
          return true;
        }
      }

      if (check >= bottom) {
        return false;
      }
    }
  }

  hasRightWall(oldPos: Vec2, pos: Vec2, vel: Vec2, out?: { box?: Box }) {
    const center = this.box.center;
    const halfSize = this.box.halfSize;

    const top = center.y - halfSize.y + 1;
    const bottom = center.y + halfSize.y - 2;

    const x = center.x + halfSize.x + 1;
    for (let check = top; ; check += this.map!.tileheight) {
      check = Math.min(check, bottom);

      const tile = this.layer!.getTileAt(x, check);

      if (tile && tile.box && !tile.properties.oneway) {
        const box = tile.box;
        if (boxOverlaps(this.box, box)) {
          if (out !== undefined) {
            out.box = box;
          }
          return true;
        }
      }

      if (check >= bottom) {
        return false;
      }
    }
  }

  static fromObject(object: MapObject): Actor {
    return new Actor(
      object.name,
      object.x,
      object.y,
      object.properties.sprite,
      {
        scripts: {
          talk: object.properties.cutsceneTalk
        }
      }
    );
  }

  hasCollisionWith(other: Actor) {
    for (let i = 0; i < this.collisions.length; i++) {
      if (this.collisions[i].other === other) {
        return true;
      }
    }

    return false;
  }

  hasInteractCollisionWith(other: Actor) {
    for (let i = 0; i < this.interactCollisions.length; i++) {
      if (this.interactCollisions[i].other === other) {
        return true;
      }
    }

    return false;
  }

  updatePhysicsResponse() {
    if (this.isKinematic) {
      return;
    }

    this.pushesBottomObject = false;
    this.pushesRightObject = false;
    this.pushesLeftObject = false;
    this.pushesTopObject = false;

    let offsetSum = { x: 0, y: 0 };

    for (let i = 0; i < this.collisions.length; i++) {
      const collision = this.collisions[i];
      const { other, oldPos1, pos1, oldPos2, pos2 } = collision;

      let overlap = {
        x: collision.overlap.x - offsetSum.x,
        y: collision.overlap.y - offsetSum.y
      };

      if (overlap.x === 0) {
        if (other.box.center.x > this.box.center.x) {
          this.pushesRightObject = true;
          this.velocity.x = Math.min(this.velocity.x, 0);
        } else {
          this.pushesLeftObject = true;
          this.velocity.x = Math.max(this.velocity.x, 0);
        }
        continue;
      } else if (overlap.y === 0) {
        if (other.box.center.y > this.box.center.y) {
          this.pushesBottomObject = true;
          this.velocity.y = Math.min(this.velocity.y, 0);
        } else {
          this.pushesTopObject = true;
          this.velocity.y = Math.max(this.velocity.y, 0);
        }
        continue;
      }

      const absSpeed1 = {
        x: Math.abs(pos1.x - oldPos1.x),
        y: Math.abs(pos1.y - oldPos1.y)
      };
      const absSpeed2 = {
        x: Math.abs(pos2.x - oldPos2.x),
        y: Math.abs(pos2.y - oldPos2.y)
      };

      const speedSum = vec2add(vec2copy(absSpeed1), absSpeed2);

      let speedRatioX = 0;
      let speedRatioY = 0;
      if (other.isKinematic) {
        speedRatioX = speedRatioY = 1;
      } else {
        if (speedSum.x === 0 && speedSum.y === 0) {
          speedRatioX = speedRatioY = 0.5;
        } else if (speedSum.x === 0) {
          speedRatioX = 0.5;
          speedRatioY = absSpeed1.y / speedSum.y;
        } else if (speedSum.y === 0) {
          speedRatioX = absSpeed1.x / speedSum.x;
          speedRatioY = 0.5;
        } else {
          speedRatioX = absSpeed1.x / speedSum.x;
          speedRatioY = absSpeed1.y / speedSum.y;
        }
      }

      const offsetX = overlap.x * speedRatioX;
      const offsetY = overlap.y * speedRatioY;

      const overlappedLastFrameX =
        Math.abs(oldPos1.x - oldPos2.x) <
        this.box.halfSize.x + other.box.halfSize.x;
      const overlappedLastFrameY =
        Math.abs(oldPos1.y - oldPos2.y) <
        this.box.halfSize.y + other.box.halfSize.y;

      if (
        (!overlappedLastFrameX && overlappedLastFrameY) ||
        (!overlappedLastFrameX &&
          !overlappedLastFrameY &&
          Math.abs(overlap.x) <= Math.abs(overlap.y))
      ) {
        this.position.x += offsetX;
        offsetSum.x += offsetX;

        if (overlap.x < 0) {
          this.pushesRightObject = true;
          this.velocity.x = Math.min(this.velocity.x, 0);
        } else {
          this.pushesLeftObject = true;
          this.velocity.x = Math.max(this.velocity.x, 0);
        }
      } else {
        this.position.y += offsetY;
        offsetSum.y += offsetY;

        if (overlap.y < 0) {
          this.pushesBottomObject = true;
          this.velocity.y = Math.min(this.velocity.y, 0);
        } else {
          this.pushesTopObject = true;
          this.velocity.y = Math.max(this.velocity.y, 0);
        }
      }
    }

    //update the aabb
    this.x = this.position.x;
    this.y = this.position.y;
    this.box.center.x = this.x;
    this.box.center.y = this.y;

    this.options.controller && this.options.controller.updateResponse(this);
  }

  getScreenBox() {
    const camera = getEngine().camera!;
    const zoom = camera.zoom * Game.current.config.globalPixelZoom;

    const x = -(camera.x * zoom - camera.frameW / 2) + camera.frameX;
    const y = -(camera.y * zoom - camera.frameH / 2) + camera.frameY;

    const box = {
      center: {
        x: this.box.center.x * zoom + x,
        y: this.box.center.y * zoom + y
      },
      halfSize: { x: this.box.halfSize.x * zoom, y: this.box.halfSize.y * zoom }
    };

    return box;
  }

  async runScript(name: string) {
    if (!this.options.scripts || !this.options.scripts[name]) {
      log.debug(`Actor(${this.name}) cannot run script ${name}`);
    } else {
      log.debug(`Actor(${this.name}) running script ${name}`);
      const script = await import('./cutscenes/' + this.options.scripts[name]!);
      const controller = new CutsceneController(script.default);
      await controller.exec();
    }
  }
}

Entity.entityTypes.Actor = Actor;
