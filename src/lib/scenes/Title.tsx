import Scene from '../Scene';
import Menu, { Option } from '../components/Menu';
import Kinetic, { Point, Size, Text } from 'kinetic';
import Map from './Map';
import BMF from '../BMF';
import CutsceneController from '../CutsceneController';

const font = new BMF('res/font/helvetica-32-regular.fnt');

export default class Title extends Scene {
  sceneDidEnter() {}

  draw() {}

  handleNewGameSelect = async () => {
    const cutscene = new CutsceneController(
      (await import('../../cutscenes/init')).default
    );

    await cutscene.exec();

    this.director.setScene(Map);
  };

  handleContinueSelect = () => {};

  render() {
    return (
      <Menu at={new Point(50, 50)} size={Size.auto}>
        <Option onSelect={this.handleNewGameSelect}>
          <Text font={font} content="New Game" />
        </Option>
        <Option onSelect={this.handleContinueSelect}>
          <Text font={font} content="Continue" />
        </Option>
      </Menu>
    );
  }
}
