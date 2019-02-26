import Actor from '../Actor';

export default abstract class ActorController {
  abstract update(actor: Actor, delta: number): void;
  abstract updateResponse(actor: Actor): void;
}
