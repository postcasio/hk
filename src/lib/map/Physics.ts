const abs = Math.abs;

export const PHYS_GRAVITY = 0.18;
export const PHYS_JUMP_VEL = 3.9;
export const PHYS_MIN_JUMP_VEL = 0.6;
export const PHYS_WALK_VEL = 1.6;
export const PHYS_MAX_Y_VEL = 3;
export const PHYS_VEL_DECAY = 0.8;
export const PHYS_VEL_DECAY_AIR = 0.9;
export const PHYS_AIR_CONTROL = 0.2;

export interface Vec2 {
  x: number;
  y: number;
}

export interface Box {
  center: Vec2;
  halfSize: Vec2;
}

export function boxOverlaps(a: Box, b: Box) {
  if (abs(a.center.x - b.center.x) > a.halfSize.x + b.halfSize.x) return false;
  if (abs(a.center.y - b.center.y) > a.halfSize.y + b.halfSize.y) return false;
  return true;
}

export function boxOffset(box: Box, x: number, y: number) {
  return {
    halfSize: box.halfSize,
    center: { x: box.center.x + x, y: box.center.y + y }
  };
}

export function vec2add(a: Vec2, b: Vec2) {
  a.x += b.x;
  a.y += b.y;

  return a;
}

export function vec2mul(a: Vec2, b: Vec2) {
  a.x *= b.x;
  a.y *= b.y;

  return a;
}

export function vec2copy(vec: Vec2) {
  return { x: vec.x, y: vec.y };
}
