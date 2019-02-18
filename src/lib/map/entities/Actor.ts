import Entity from './Entity';
import { MapObject } from '../ObjectLayer';
import Sprite from '../../Sprite';
import ActorController from './Controllers/ActorController';
import { vec2add, vec2mul, Vec2, vec2copy, Box, boxOverlaps } from '../Physics';
import log from '../../log';
// import log from '../../log';

export enum CharacterState {
  Idle,
  Walk,
  Jump
}
export interface ActorOptions {
  gravity: number;
  controller?: ActorController;
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
  pushedRightWall: boolean = false;
  pushesRightWall: boolean = false;
  pushedLeftWall: boolean = false;
  pushesLeftWall: boolean = false;
  wasOnGround: boolean = false;
  onGround: boolean = false;
  wasAtCeiling: boolean = false;
  atCeiling: boolean = false;
  state: CharacterState = CharacterState.Idle;

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

  draw(target: Surface, transform: Transform, scale: number) {
    // transform.translate(this.x, this.y);
    this.sprite.draw(target, transform);
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
    this.pushedLeftWall = this.pushesLeftWall;
    this.pushedRightWall = this.pushesRightWall;
    this.wasOnGround = this.onGround;
    this.wasAtCeiling = this.atCeiling;

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
      this.onGround = true;
    } else {
      this.onGround = false;
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
      this.atCeiling = true;
    } else {
      this.atCeiling = false;
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
      this.pushesLeftWall = true;
      this.velocity.x = 0;
      this.position.x =
        collision.box!.center.x +
        collision.box!.halfSize.x +
        this.box.halfSize.x;
    } else {
      this.pushesLeftWall = false;
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
      this.pushesRightWall = true;
      this.velocity.x = 0;
      this.position.x =
        collision.box!.center.x -
        collision.box!.halfSize.x -
        this.box.halfSize.x;
    } else {
      this.pushesRightWall = false;
    }

    this.x = this.position.x;
    this.y = this.position.y;
  }

  hasGround(oldPos: Vec2, pos: Vec2, vel: Vec2, out?: { box?: Box }) {
    const center = this.box.center;
    const halfSize = this.box.halfSize;

    const left = center.x - halfSize.x + 1;
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
    return new Actor(object.name, object.x, object.y, object.properties.sprite);
  }
}

Entity.entityTypes.Actor = Actor;
