import Game from './Game';
import Scene from './Scene';
import Engine from './map/Engine';

export default class Director {
  game: Game;
  mapEngine: Engine;
  scene: Scene | null = null;

  constructor(game: Game) {
    this.game = game;
    this.mapEngine = new Engine();
  }

  getMapEngine() {
    return this.mapEngine;
  }

  setScene(
    sceneConstructor: typeof Scene,
    ...args: Array<any>
  ): Promise<Scene> {
    return new Promise((resolve, reject) => {
      Dispatch.now(() => {
        if (this.scene) {
          this.scene.sceneDidLeave();
        }
        this.scene = new sceneConstructor(this, ...args);
        this.scene.sceneDidEnter();
        this.game.ui.renderScene(this.scene);

        resolve(this.scene);
      });
    });
  }

  getGame() {
    return this.game;
  }

  draw() {
    this.mapEngine.draw(Surface.Screen);

    if (this.scene) {
      this.scene.draw();
    }
  }
}
