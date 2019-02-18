import ActorController from './ActorController';
import {
  PHYS_JUMP_VEL,
  PHYS_WALK_VEL,
  PHYS_GRAVITY,
  PHYS_MAX_Y_VEL,
  PHYS_MIN_JUMP_VEL,
  PHYS_VEL_DECAY_AIR,
  PHYS_VEL_DECAY,
  PHYS_AIR_CONTROL
} from '../../Physics';
import Actor, { CharacterState } from '../Actor';
import log from '../../../log';

const keyboard = Keyboard.Default;

export default class PlayerController extends ActorController {
  wasUpPressed: boolean = false;

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

        if (!actor.onGround) {
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
          if (actor.pushesRightWall) {
            actor.velocity.x = 0;
          } else {
            actor.velocity.x = PHYS_WALK_VEL;
          }
          actor.sprite.flip = false;
        } else if (leftPressed) {
          if (actor.pushesLeftWall) {
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
        } else if (!actor.onGround) {
          log.debug('WALK -> JUMP (not on ground)');
          actor.state = CharacterState.Jump;
        }
        break;
      case CharacterState.Jump:
        animation = 'jump';

        actor.velocity.y = Math.min(
          actor.velocity.y + PHYS_GRAVITY * delta,
          PHYS_MAX_Y_VEL
        );

        if (!upPressed && actor.velocity.y < 0) {
          actor.velocity.y = Math.max(actor.velocity.y, -PHYS_MIN_JUMP_VEL);
        }

        if (rightPressed === leftPressed) {
          actor.velocity.x *= PHYS_VEL_DECAY_AIR;
        } else if (rightPressed) {
          if (actor.pushesRightWall) actor.velocity.x = 0;
          else {
            actor.velocity.x = Math.min(
              actor.velocity.x + PHYS_WALK_VEL * PHYS_AIR_CONTROL,
              PHYS_WALK_VEL
            );
          }
          actor.sprite.flip = false;
        } else if (leftPressed) {
          if (actor.pushesLeftWall) actor.velocity.x = 0;
          else {
            actor.velocity.x = Math.max(
              actor.velocity.x - PHYS_WALK_VEL * PHYS_AIR_CONTROL,
              -PHYS_WALK_VEL
            );
          }
          actor.sprite.flip = true;
        }

        if (actor.onGround) {
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
        }
        break;
    }

    if (animation && animation !== actor.sprite.currentAnimationKey) {
      actor.sprite.setAnimation(animation);
    }

    this.wasUpPressed = upPressed;
  }
}
