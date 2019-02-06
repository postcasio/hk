import Kinetic, { Point, Size, SurfaceHost } from 'kinetic';
import Game from './Game';
import Scene from './Scene';

export default class UI {
  kinetic: Kinetic;
  game: Game;

  renderScene(scene: Scene) {
    this.kinetic.render(
      <SurfaceHost at={Point.zero} size={Size.of(Surface.Screen)}>
        {scene.render()}
      </SurfaceHost>
    );
  }

  constructor(game: Game) {
    this.game = game;
    this.kinetic = new Kinetic();
  }

  draw() {
    this.kinetic.hasRootComponent() && this.kinetic.draw();
  }

  update() {
    let key;
    while ((key = Keyboard.Default.getKey())) {
      this.kinetic.registerKeyPress(key);
    }

    this.kinetic.update();
  }
}
