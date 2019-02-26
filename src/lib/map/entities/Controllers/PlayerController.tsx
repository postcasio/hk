import ActorController from './ActorController';
import {
  PHYS_JUMP_VEL,
  PHYS_WALK_VEL,
  PHYS_GRAVITY,
  PHYS_MAX_Y_VEL,
  PHYS_MIN_JUMP_VEL,
  PHYS_VEL_DECAY_AIR,
  PHYS_VEL_DECAY,
  PHYS_AIR_CONTROL,
  PHYS_GRAVITY_WALL_FACTOR,
  PHYS_JUMP_WALL_FACTOR_X,
  PHYS_JUMP_WALL_FACTOR_Y,
  PHYS_MAX_Y_VEL_WALL_TOUCH,
  vec2distance
} from '../../Physics';
import Actor, { CharacterState } from '../Actor';
import log from '../../../log';
import { Collision } from '../../Collision';
import Game from '../../../Game';
import Kinetic, { Size, Point } from 'kinetic';
import InteractionPromptContainer from '../../../components/InteractionPromptContainer';

const keyboard = Keyboard.Default;

export default class PlayerController extends ActorController {
  wasUpPressed: boolean = false;

  interactionPromptContainer?: InteractionPromptContainer;
  interactionPromptContainerClaim: { release: () => void };
  constructor() {
    super();

    this.interactionPromptContainerClaim = Game.current.getUI().addElement(
      <InteractionPromptContainer
        size={Size.of(Surface.Screen)}
        at={Point.zero}
        ref={(c: InteractionPromptContainer) => {
          log.debug('Updating InteractionPromptContainer');
          this.interactionPromptContainer = c;
        }}
      />
    );
  }

  update(actor: Actor, delta: number) {
    const leftPressed = keyboard.isPressed(Key.Left);
    const rightPressed = keyboard.isPressed(Key.Right);
    const upPressed = keyboard.isPressed(Key.Up);

    let animation: string | null = null;

    switch (actor.state) {
      case CharacterState.Idle:
        actor.velocity.x *= PHYS_VEL_DECAY;
        actor.velocity.y *= PHYS_VEL_DECAY;

        animation = 'idle';

        if (!actor.pushesBottom) {
          log.debug('IDLE -> JUMP (not on ground)');
          actor.state = CharacterState.Jump;
          break;
        }

        if (leftPressed !== rightPressed) {
          log.debug('IDLE -> WALK (direction)');
          actor.state = CharacterState.Walk;
        } else if (upPressed && !this.wasUpPressed) {
          log.debug('IDLE -> JUMP (direction)');
          actor.velocity.y = -PHYS_JUMP_VEL;
          actor.state = CharacterState.Jump;
        }
        break;
      case CharacterState.Walk:
        animation = 'idle';

        // actor.sprite.setAnimation('walk');
        if (leftPressed === rightPressed) {
          actor.state = CharacterState.Idle;
          log.debug('WALK -> IDLE (no input)');
        } else if (rightPressed) {
          if (actor.pushesRightTile) {
            actor.velocity.x = 0;
          } else {
            actor.velocity.x = PHYS_WALK_VEL;
          }
          actor.sprite.flip = false;
        } else if (leftPressed) {
          if (actor.pushesLeftTile) {
            actor.velocity.x = 0;
          } else {
            actor.velocity.x = -PHYS_WALK_VEL;
          }
          actor.sprite.flip = true;
        }

        if (upPressed && !this.wasUpPressed) {
          actor.velocity.y = -PHYS_JUMP_VEL;
          log.debug('WALK -> JUMP (direction');
          actor.state = CharacterState.Jump;
        } else if (!actor.pushesBottom) {
          log.debug('WALK -> JUMP (not on ground)');
          actor.state = CharacterState.Jump;
        }
        break;
      case CharacterState.Jump:
        actor.velocity.y = Math.min(
          actor.velocity.y + PHYS_GRAVITY * delta,
          PHYS_MAX_Y_VEL
        );

        animation = actor.velocity.y < 0 ? 'jump' : 'fall';

        if (!upPressed && actor.velocity.y < 0) {
          actor.velocity.y = Math.max(actor.velocity.y, -PHYS_MIN_JUMP_VEL);
        }

        if (rightPressed === leftPressed) {
          actor.velocity.x *= PHYS_VEL_DECAY_AIR;
        } else if (rightPressed) {
          if (actor.pushesRightTile) actor.velocity.x = 0;
          else {
            actor.velocity.x = Math.min(
              actor.velocity.x + PHYS_WALK_VEL * PHYS_AIR_CONTROL,
              PHYS_WALK_VEL
            );
          }
          actor.sprite.flip = false;
        } else if (leftPressed) {
          if (actor.pushesLeftTile) actor.velocity.x = 0;
          else {
            actor.velocity.x = Math.max(
              actor.velocity.x - PHYS_WALK_VEL * PHYS_AIR_CONTROL,
              -PHYS_WALK_VEL
            );
          }
          actor.sprite.flip = true;
        }

        if (actor.pushesBottom) {
          //if there's no movement change state to standing
          if (rightPressed === leftPressed) {
            log.debug('JUMP -> IDLE (on ground)');
            actor.state = CharacterState.Idle;
            actor.velocity.y = 0;
          } //either go right or go left are pressed so we change the state to walk
          else {
            log.debug('JUMP -> WALK (on ground, direction)');
            actor.state = CharacterState.Walk;
            actor.velocity.y = 0;
          }
        } else if (actor.pushesRightTile && actor.velocity.y > 0) {
          log.debug('JUMP -> RIGHT WALL (pushed wall)');
          actor.state = CharacterState.WallRight;
          actor.velocity.y = Math.min(
            actor.velocity.y,
            PHYS_MAX_Y_VEL_WALL_TOUCH
          );
        } else if (actor.pushesLeftTile && actor.velocity.y > 0) {
          log.debug('JUMP -> LEFT WALL (pushed wall)');
          actor.state = CharacterState.WallLeft;
          actor.velocity.y = Math.max(
            actor.velocity.y,
            PHYS_MAX_Y_VEL_WALL_TOUCH
          );
        }
        break;
      case CharacterState.WallLeft:
        animation = 'wallright';
        actor.sprite.flip = true;

        actor.velocity.y = Math.min(
          actor.velocity.y + PHYS_GRAVITY * delta * PHYS_GRAVITY_WALL_FACTOR,
          PHYS_MAX_Y_VEL
        );

        if (leftPressed === rightPressed) {
          actor.velocity.x *= PHYS_VEL_DECAY_AIR;
        } else if (leftPressed) {
          if (actor.pushesLeftTile || actor.pushedLeftTile) {
            actor.velocity.x = -0.1;
            actor.sprite.flip = true;
          } else {
            actor.state = CharacterState.Jump;
            log.debug('WALL LEFT -> JUMP (cleared)');
          }
        } else if (rightPressed) {
          if (actor.pushesLeftTile) {
            actor.velocity.x = 0;
            actor.state = CharacterState.Jump;
            log.debug('WALL LEFT -> JUMP (input right)');
          } else {
            actor.velocity.x = Math.min(
              actor.velocity.x + PHYS_WALK_VEL * PHYS_AIR_CONTROL,
              PHYS_WALK_VEL
            );
            actor.state = CharacterState.Jump;
            log.debug('WALL LEFT -> JUMP (input left)');
          }
        }

        if (upPressed && !this.wasUpPressed) {
          actor.velocity.y = -PHYS_JUMP_VEL * PHYS_JUMP_WALL_FACTOR_Y;
          actor.velocity.x = PHYS_JUMP_VEL * PHYS_JUMP_WALL_FACTOR_X;
          actor.state = CharacterState.Jump;
          log.debug('WALL LEFT -> JUMP (input jump)');
        }

        if (actor.pushesBottom) {
          //if there's no movement change state to standing
          if (leftPressed === leftPressed) {
            log.debug('WALL LEFT -> IDLE (on ground)');
            actor.state = CharacterState.Idle;
            actor.velocity.y = 0;
          } //either go left or go left are pressed so we change the state to walk
          else {
            log.debug('WALL LEFT -> WALK (on ground, direction)');
            actor.state = CharacterState.Walk;
            actor.velocity.y = 0;
          }
        }
        break;
      case CharacterState.WallRight:
        animation = 'wallright';

        actor.velocity.y = Math.min(
          actor.velocity.y + PHYS_GRAVITY * delta * PHYS_GRAVITY_WALL_FACTOR,
          PHYS_MAX_Y_VEL
        );

        if (rightPressed === leftPressed) {
          actor.velocity.x *= PHYS_VEL_DECAY_AIR;
        } else if (rightPressed) {
          if (actor.pushesRightTile || actor.pushedRightTile) {
            actor.velocity.x = 0.1;
            actor.sprite.flip = false;
          } else {
            actor.state = CharacterState.Jump;
            log.debug('WALL RIGHT -> JUMP (cleared)');
          }
        } else if (leftPressed) {
          if (actor.pushesLeftTile) {
            actor.velocity.x = 0;
            actor.state = CharacterState.Jump;
            log.debug('WALL RIGHT -> JUMP (input left)');
          } else {
            actor.velocity.x = Math.max(
              actor.velocity.x - PHYS_WALK_VEL * PHYS_AIR_CONTROL,
              -PHYS_WALK_VEL
            );
            actor.state = CharacterState.Jump;
            log.debug('WALL RIGHT -> JUMP (input left)');
          }
          actor.sprite.flip = true;
        }

        if (upPressed && !this.wasUpPressed) {
          actor.velocity.y = -PHYS_JUMP_VEL * PHYS_JUMP_WALL_FACTOR_Y;
          actor.velocity.x = -PHYS_JUMP_VEL * PHYS_JUMP_WALL_FACTOR_X;
          actor.state = CharacterState.Jump;
          log.debug('WALL RIGHT -> JUMP (input jump)');
        }

        if (actor.pushesBottom) {
          //if there's no movement change state to standing
          if (rightPressed === leftPressed) {
            log.debug('WALL RIGHT -> IDLE (on ground)');
            actor.state = CharacterState.Idle;
            actor.velocity.y = 0;
          } //either go right or go left are pressed so we change the state to walk
          else {
            log.debug('WALL RIGHT -> WALK (on ground, direction)');
            actor.state = CharacterState.Walk;
            actor.velocity.y = 0;
          }
        }
        break;
    }

    if (animation && animation !== actor.sprite.currentAnimationKey) {
      actor.sprite.setAnimation(animation);
    }

    this.wasUpPressed = upPressed;
  }

  oldCollisions: Collision[] = [];

  updateResponse(actor: Actor) {
    const remain: Collision[] = [];
    const newCollisions = actor.interactCollisions;
    let changed = false;
    for (const collision of this.oldCollisions) {
      if (!newCollisions.some(c => c.other === collision.other)) {
        this.removeInteractionPrompt(collision);
        changed = true;
      } else {
        remain.push(collision);
      }
    }

    for (const collision of newCollisions) {
      if (!remain.some(c => c.other === collision.other)) {
        this.addInteractionPrompt(collision);
        changed = true;
      }
    }
    this.oldCollisions = newCollisions;

    if (changed) {
      this.updateInteractionPrompts();
    }

    const talkPressed = Keyboard.Default.isPressed(Key.Enter);

    if (talkPressed) {
      log.debug('Talk pressed');
      let closestCollision = null,
        closestDistance = Infinity;

      for (const collision of this.interactionPromptCollisions) {
        const distance = vec2distance(collision.pos1, collision.pos2);
        if (distance < closestDistance) {
          closestCollision = collision;
          closestDistance = distance;
        }
      }

      if (closestCollision) {
        closestCollision.other.runScript('talk');
      }
    }
  }

  interactionPromptCollisions: Collision[] = [];

  removeInteractionPrompt(collision: Collision) {
    log.debug('Interaction prompt removed');
    this.interactionPromptCollisions = this.interactionPromptCollisions.filter(
      c => c.other !== collision.other
    );
  }

  addInteractionPrompt(collision: Collision) {
    log.debug('Interaction prompt added');
    this.interactionPromptCollisions.push(collision);
  }

  updateInteractionPrompts() {
    log.debug('Updating InteractionPrompts');
    this.interactionPromptContainer &&
      this.interactionPromptContainer.setState({
        collisions: this.interactionPromptCollisions
      });
  }
}
