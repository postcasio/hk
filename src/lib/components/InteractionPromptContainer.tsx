import Kinetic, {
  RefProps,
  SizeProps,
  PositionProps,
  SurfaceHost,
  SurfaceHostProps
} from 'kinetic';
import { Collision } from '../map/Collision';
import { vec2distance } from '../map/Physics';
import InteractionPrompt from './InteractionPrompt';

interface InteractionPromptContainerState {
  collisions: Collision[];
}

export default class InteractionPromptContainer extends SurfaceHost<
  SurfaceHostProps &
    RefProps<InteractionPromptContainer> &
    SizeProps &
    PositionProps,
  InteractionPromptContainerState
> {
  getInitialState() {
    return { collisions: [] };
  }

  static defaultProps = {
    ...SurfaceHost.defaultProps,
    blendOp: BlendOp.Replace
  };

  draw(target: Surface) {
    super.draw(target);
  }

  drawSurface() {
    super.drawSurface();
  }

  render() {
    let closestCollision = null,
      closestDistance = Infinity;

    for (const collision of this.state.collisions) {
      const distance = vec2distance(collision.pos1, collision.pos2);
      if (distance < closestDistance) {
        closestCollision = collision;
        closestDistance = distance;
      }
    }

    if (closestCollision) {
      return <InteractionPrompt actor={closestCollision.other} />;
    }
  }
}
