import {
  PositionProps,
  SizeProps,
  SurfaceHost,
  SurfaceHostProps
} from 'kinetic';

export interface VignetteProps
  extends SurfaceHostProps,
    PositionProps,
    SizeProps {}

function createTriStripList(texture: Texture, mask: Color = Color.White) {
  return new VertexList([
    { x: 0, y: 0, u: 0, v: 1, color: mask },
    { x: 1, y: 0, u: 1, v: 1, color: mask },
    { x: 0, y: 1, u: 0, v: 0, color: mask },
    { x: 1, y: 1, u: 1, v: 0, color: mask }
  ]);
}

function createShape(texture: Texture, mask: Color = Color.White) {
  return new Shape(
    ShapeType.TriStrip,
    texture,
    createTriStripList(texture, mask)
  );
}

export default class Vignette extends SurfaceHost<VignetteProps> {
  bufferSurface?: Surface;
  model?: Model;

  shader: Shader = new Shader({
    vertexFile: 'res/shader/blur/dist/vert.glsl',
    fragmentFile: 'res/shader/blur/dist/frag.glsl'
  });

  constructor(props: VignetteProps) {
    super(props);
  }

  prepareSurface(w: number, h: number): Surface {
    const surface = super.prepareSurface(w, h);

    const { x, y } = this.props.at!.resolve();

    const shape = createShape(surface);
    this.shader.setFloatVector('resolution', [w, h]);
    this.shader.setBoolean('flip', false);
    this.model = new Model([shape], this.shader);
    this.model.transform.translate(x / w, y / h);
    this.model.transform.scale(w, h);

    return surface;
  }

  draw(target: Surface) {
    if (this.model && this.props.at && this.props.size) {
      const model = this.model;
      const oldOp = target.blendOp;
      model!.draw(target);
      target.blendOp = oldOp;
    }
  }
}
