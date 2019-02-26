import Actor from './entities/Actor';
import { Vec2 } from './Physics';

export class Collision {
  other: Actor;
  overlap: Vec2;
  speed1: Vec2;
  speed2: Vec2;
  oldPos1: Vec2;
  oldPos2: Vec2;
  pos1: Vec2;
  pos2: Vec2;

  constructor(
    other: Actor,
    overlap: Vec2,
    speed1: Vec2,
    speed2: Vec2,
    oldPos1: Vec2,
    oldPos2: Vec2,
    pos1: Vec2,
    pos2: Vec2
  ) {
    this.other = other;
    this.overlap = overlap;
    this.speed1 = speed1;
    this.speed2 = speed2;
    this.oldPos1 = oldPos1;
    this.oldPos2 = oldPos2;
    this.pos1 = pos1;
    this.pos2 = pos2;
  }
}
