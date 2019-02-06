import Scene from '../Scene';
import Kinetic /*, { Point, Size, Text }*/ from 'kinetic';
// import Menu, { Option } from '../components/Menu';
import Cutscene from '../Cutscene';

export default class Title extends Scene {
  render() {
    return (
      // <Menu at={new Point(40, 40)} size={Size.auto}>
      //   <Option>
      //     <Text content="New Game" />
      //   </Option>
      //   <Option>
      //     <Text content="Exit" />
      //   </Option>
      // </Menu>
      <Cutscene script={import('../cutscenes/newgame')} onComplete={() => {}} />
    );
  }
}
