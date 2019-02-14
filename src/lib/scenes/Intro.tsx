import Scene from '../Scene';
import Title from './Title';

export default class Intro extends Scene {
  sceneDidEnter() {
    this.director.setScene(Title);
  }

  render() {}
}
