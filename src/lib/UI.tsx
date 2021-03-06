import Kinetic, {
  Point,
  Size,
  SurfaceHost,
  Node,
  RefProps,
  Component
} from 'kinetic';
import Game from './Game';
import Scene from './Scene';
import log from './log';

// Pass-through component, just to ensure that changing scene render or elements causes components to unmount

interface UIContainerState {
  elements: ElementHandle[];
}
class UIContainer extends Component<RefProps<UIContainer>, UIContainerState> {
  getInitialState() {
    return { elements: [] };
  }
  draw(target: Surface) {
    super.draw(target);
  }

  render() {
    return this.state.elements.map(handle => handle.element);
  }
}

interface ElementHandle {
  id: number;
  element: Node | Node[];
}

export default class UI {
  kinetic: Kinetic;
  game: Game;

  private _elements: ElementHandle[] = [];
  private elementsui?: UIContainer;
  private sceneui?: UIContainer;

  renderScene(scene: Scene) {
    log.debug('Rendering scene: ' + scene.constructor.name);
    const rendered = scene.render();
    this.sceneui!.setState({
      elements: Array.isArray(rendered)
        ? rendered.map((element, id) => ({ element, id }))
        : [{ id: 1, element: rendered }]
    });
  }

  constructor(game: Game) {
    this.game = game;
    this.kinetic = new Kinetic();

    this.kinetic.render(
      <SurfaceHost
        color={new Color(0, 0, 0, 0)}
        at={Point.zero}
        size={Size.of(Surface.Screen)}
      >
        <UIContainer
          ref={sceneui => {
            this.sceneui = sceneui;
          }}
        />

        <UIContainer
          ref={elementsui => {
            this.elementsui = elementsui;
          }}
        />
      </SurfaceHost>
    );
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

    this.elementsui!.setState({
      elements: this._elements
    });

    return {
      release: () => {
        this._elements = this._elements.filter(e => e.id !== id);

        this.elementsui!.setState({
          elements: this._elements
        });
      }
    };
  }
}
