import { Node } from 'kinetic';
import Director from './Director';
import UI from './UI';

export default class Scene {
  director: Director;
  ui: UI;

  constructor(director: Director, ..._args: Array<any>) {
    this.director = director;
    this.ui = director.getGame().getUI();
  }

  sceneDidEnter() {}
  sceneDidLeave() {}

  render(): Node | Array<Node> {
    return null;
  }
}
