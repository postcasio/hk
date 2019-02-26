import log from './log';

interface SpritesheetFileFrameTag {
  name: string;
  from: number;
  to: number;
  direction: 'forward' | 'reverse' | 'pingpong';
}
interface SpritesheetFileFrame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  duration: number;
}

interface SpritesheetFile {
  frames: SpritesheetFileFrame[];
  meta: {
    app: string;
    version: string;
    image: string;
    format: string;
    size: { w: number; height: number };
    scale: number;
    frameTags: SpritesheetFileFrameTag[];
    // layers, slices unused
  };
}

export class SpriteAnimation {
  key: string;
  frames: SpriteAnimationFrame[];

  constructor(key: string, frames: SpriteAnimationFrame[]) {
    this.key = key;
    this.frames = frames;
  }
}

export class SpriteAnimationFrame {
  filename: string;
  frame: { x: number; y: number; w: number; h: number };
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: { x: number; y: number; w: number; h: number };
  sourceSize: { w: number; h: number };
  duration: number;
  verts!: VertexList;
  flippedVerts!: VertexList;
  shape: Shape;
  sprite: Sprite;
  mask: Color = Color.White;

  constructor(sprite: Sprite, frameData: SpritesheetFileFrame) {
    this.sprite = sprite;
    this.filename = frameData.filename;
    this.frame = frameData.frame;
    this.rotated = frameData.rotated;
    this.trimmed = frameData.trimmed;
    this.spriteSourceSize = frameData.spriteSourceSize;
    this.sourceSize = frameData.sourceSize;
    this.duration = frameData.duration;

    this.updateVerts();

    this.shape = new Shape(ShapeType.TriStrip, this.sprite.texture, this.verts);
  }

  updateVerts() {
    const u1 = this.frame.x / this.sprite.texture.width;
    const u2 = (this.frame.x + this.frame.w) / this.sprite.texture.width;
    const v1 = 1 - this.frame.y / this.sprite.texture.height;
    const v2 = 1 - (this.frame.y + this.frame.h) / this.sprite.texture.height;
    const mask = this.mask;

    this.verts = new VertexList([
      { x: 0, y: 0, u: u1, v: v1, color: mask },
      { x: 1, y: 0, u: u2, v: v1, color: mask },
      { x: 0, y: 1, u: u1, v: v2, color: mask },
      { x: 1, y: 1, u: u2, v: v2, color: mask }
    ]);
    this.flippedVerts = new VertexList([
      { x: 0, y: 0, u: u2, v: v1, color: mask },
      { x: 1, y: 0, u: u1, v: v1, color: mask },
      { x: 0, y: 1, u: u2, v: v2, color: mask },
      { x: 1, y: 1, u: u1, v: v2, color: mask }
    ]);
  }
}

export default class Sprite {
  path: string;
  spritesheetData: SpritesheetFile;
  animations: Map<string, SpriteAnimation> = new Map();
  texture: Texture;
  currentAnimation: SpriteAnimation;
  currentAnimationKey: string;
  currentAnimationFrame: SpriteAnimationFrame;
  currentAnimationFrameIndex: number;
  job?: JobToken;
  flip: boolean = false;

  constructor(path: string) {
    log.debug(`Loading sprite: ${path}`);
    this.path = path;
    this.spritesheetData = JSON.parse(FS.readFile(path));

    const texturePath = FS.fullPath(
      this.spritesheetData.meta.image,
      FS.directoryOf(path).replace(/\/$/, '')
    );
    log.debug(`Loading sprite texture: ${texturePath}`);

    this.texture = new Texture(texturePath);

    for (const tag of this.spritesheetData.meta.frameTags) {
      const anim = new SpriteAnimation(
        tag.name,
        this.spritesheetData.frames
          .slice(tag.from, tag.to + 1)
          .map(frame => new SpriteAnimationFrame(this, frame))
      );

      this.animations.set(anim.key, anim);
    }

    if (!this.animations.size) {
      throw new Error('No animations defined in ' + this.path);
    }

    const animation = this.animations.values().next().value;

    this.currentAnimation = animation;
    this.currentAnimationKey = animation.key;
    this.currentAnimationFrame = animation.frames[0];
    this.currentAnimationFrameIndex = 0;
  }

  setCurrentAnimation(animation: SpriteAnimation) {
    this.currentAnimation = animation;
    this.currentAnimationKey = animation.key;
    this.currentAnimationFrame = animation.frames[0];
    this.currentAnimationFrameIndex = 0;
  }

  draw(target: Surface, transform: Transform, mask: Color = Color.White) {
    if (this.currentAnimationFrame.mask !== mask) {
      this.currentAnimationFrame.mask = mask;
      this.currentAnimationFrame.updateVerts();
    }

    if (this.flip) {
      this.currentAnimationFrame.shape.vertexList = this.currentAnimationFrame.flippedVerts;
    } else {
      this.currentAnimationFrame.shape.vertexList = this.currentAnimationFrame.verts;
    }

    this.currentAnimationFrame.shape.draw(target, transform);
  }

  setAnimation(key: string, begin: boolean = true) {
    const anim = this.animations.get(key);
    if (!anim) {
      throw new Error('No such animation exists: ' + key);
    }

    this.currentAnimation = anim;
    this.currentAnimationFrameIndex = 0;
    this.currentAnimationFrame = this.currentAnimation.frames[0];
    this.currentAnimationKey = anim.key;

    if (begin) {
      this.beginAnimating();
    }
  }

  beginAnimating(reset: boolean = false) {
    if (reset) {
      this.currentAnimationFrameIndex = 0;
      this.currentAnimationFrame = this.currentAnimation.frames[0];
    }

    this.queueAdvance();
  }

  queueAdvance() {
    if (this.job) {
      this.job.cancel();
    }

    if (this.currentAnimationFrame.duration <= 1) {
      return;
    }

    this.job = Dispatch.later(this.currentAnimationFrame.duration, () => {
      this.currentAnimationFrameIndex++;

      if (
        this.currentAnimationFrameIndex >= this.currentAnimation.frames.length
      ) {
        this.currentAnimationFrameIndex = 0;
      }

      this.currentAnimationFrame = this.currentAnimation.frames[
        this.currentAnimationFrameIndex
      ];

      this.job = undefined;
      this.queueAdvance();
    });
  }
}
