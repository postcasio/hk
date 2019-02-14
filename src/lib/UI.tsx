import Kinetic, { Point, Size, SurfaceHost, Component, Node } from 'kinetic';
import Game from './Game';
import Scene from './Scene';
import log from './log';

// Pass-through component, just to ensure that changing scene render or elements causes components to unmount
class UIContainer extends Component {}

export default class UI {
  kinetic: Kinetic;
  game: Game;

  private _elements: { id: number; element: Node }[] = [];

  renderScene(scene: Scene) {
    log.debug('Rendering scene: ' + scene.constructor.name);
    this.kinetic.render(
      <SurfaceHost
        color={new Color(0, 0, 0, 0)}
        at={Point.zero}
        size={Size.of(Surface.Screen)}
      >
        <UIContainer>{scene.render()}</UIContainer>
        <UIContainer>{this.renderElements()}</UIContainer>
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

  private _nextElementId: number = 1;

  addElement(element: Node): { release: () => void } {
    const id = this._nextElementId++;

    this._elements.push({
      id,
      element
    });

    return {
      release: () => {
        this._elements = this._elements.filter(e => e.id === id);
      }
    };
  }

  renderElements() {
    return this._elements.map(e => e.element);
  }
}
