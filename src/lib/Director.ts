import Game from './Game';
import Scene from './Scene';

export default class Director {
  game: Game;
  scene: Scene | null = null;

  constructor(game: Game) {
    this.game = game;
  }

  setScene(sceneConstructor: typeof Scene, ...args: Array<any>) {
    if (this.scene) {
      this.scene.sceneDidLeave();
    }
    this.scene = new sceneConstructor(this, ...args);
    this.scene.sceneDidEnter();
    this.game.ui.renderScene(this.scene);
  }

  getGame() {
    return this.game;
  }
}
