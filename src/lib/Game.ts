import Director from './Director';
import UI from './UI';
import Scene from './Scene';
import Journal from './Journal';

export interface GameConfig {
  initialScene: typeof Scene;
  globalPixelZoom: number;
}

export const defaultConfig: Partial<GameConfig> = {};

export default class Game {
  director: Director;
  ui: UI;
  config: GameConfig;
  journal: Journal;
  static current: Game;

  constructor(config: GameConfig) {
    this.config = { ...defaultConfig, ...config };

    this.ui = new UI(this);
    this.director = new Director(this);
    this.journal = new Journal();

    Game.current = this;
  }

  start() {
    this.handleErrors(() => {
      this.attachLifecycleHooks();
      this.director.setScene(this.config.initialScene);
    });
  }

  handleErrors(callback: () => void) {
    try {
      callback();
    } catch (e) {
      throw e;
    }
  }

  attachLifecycleHooks() {
    Dispatch.onRender(() => {
      this.handleErrors(() => {
        this.director.draw();
        this.ui.draw();
      });
    });

    Dispatch.onUpdate(() => {
      this.handleErrors(() => {
        this.director.update();
        this.ui.update();
      });
    });
  }

  getUI() {
    return this.ui;
  }

  getJournal() {
    return this.journal;
  }

  getDirector() {
    return this.director;
  }
}
