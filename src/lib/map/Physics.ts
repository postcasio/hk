const abs = Math.abs;

export const PHYS_GRAVITY = 0.18;
export const PHYS_JUMP_VEL = 3.6;
export const PHYS_MIN_JUMP_VEL = 0.6;
export const PHYS_WALK_VEL = 1.3;
export const PHYS_MAX_Y_VEL = 3;
export const PHYS_VEL_DECAY = 0.8;
export const PHYS_VEL_DECAY_AIR = 0.9;
export const PHYS_AIR_CONTROL = 0.2;
export const PHYS_GRAVITY_WALL_FACTOR = 0.27;
export const PHYS_JUMP_WALL_FACTOR_X = 0.5;
export const PHYS_JUMP_WALL_FACTOR_Y = 0.87;
export const PHYS_MAX_Y_VEL_WALL_TOUCH = 0.25;

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

export function boxOverlapsSigned(a: Box, b: Box, out: Partial<Vec2>) {
  out.x = 0;
  out.y = 0;

  if (
    a.halfSize.x === 0 ||
    a.halfSize.y === 0 ||
    b.halfSize.x === 0 ||
    b.halfSize.y === 0 ||
    Math.abs(a.center.x - b.center.x) > a.halfSize.x + b.halfSize.x ||
    Math.abs(a.center.y - b.center.y) > a.halfSize.y + b.halfSize.y
  )
    return false;

  out.x =
    (Math.sign(a.center.x - b.center.x) || 1) *
    (b.halfSize.x + a.halfSize.x - Math.abs(a.center.x - b.center.x));
  out.y =
    (Math.sign(a.center.y - b.center.y) || 1) *
    (b.halfSize.y + a.halfSize.y - Math.abs(a.center.y - b.center.y));

  return true;
}

export function boxOffset(box: Box, x: number, y: number) {
  return {
    halfSize: vec2copy(box.halfSize),
    center: vec2add(vec2copy(box.center), { x, y })
  };
}

export function boxScale(box: Box, x: number, y: number) {
  return {
    halfSize: vec2mul(vec2copy(box.halfSize), { x, y }),
    center: vec2mul(vec2copy(box.center), { x, y })
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

export function vec2eq(vec: Vec2, vec2: Vec2) {
  return vec.x === vec2.x && vec.y === vec2.y;
}

export function vec2distance(vec: Vec2, vec2: Vec2) {
  const dx = vec.x - vec2.x;
  const dy = vec.y - vec2.y;
  return Math.sqrt(dx * dx + dy * dy);
}
