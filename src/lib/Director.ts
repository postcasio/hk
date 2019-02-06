import Game from './Game';
import Scene from './Scene';

export default class Director {
  game: Game;
  scene: Scene | null = null;

  constructor(game: Game) {
    this.game = game;
  }

  setScene(sceneConstructor: typeof Scene, ...args: Array<any>) {
    this.scene = new sceneConstructor(this, ...args);
    this.game.ui.renderScene(this.scene);
  }

  getGame() {
    return this.game;
  }
}
