import Kinetic, {
  Component,
  PositionProps,
  SizeProps,
  Text,
  Size,
  Fragment
} from 'kinetic';
import Character from '../../Character';
import Flow, { Spacer } from '../Flow';
import Style from '../Style';

const font = new Font('res/font/helvetica-22-regular.rfn');
const smallFont = new Font('res/font/helvetica-18-regular.rfn');

export interface CharacterProps extends PositionProps, SizeProps {
  character: Character;
}
export default class CharacterComponent extends Component<CharacterProps> {
  render() {
    const { at, size, character } = this.props;

    const flowAt = at!.inherit().addX(40);
    const flowSize = new Size(800, size!.h);

    return (
      <Fragment>
        <Flow font={font} at={flowAt} size={flowSize} lineHeight={100}>
          <Text
            font={font}
            content={character.name}
            size={new Size(260, Size.AUTO)}
          />
          HP {character.stat('hp')}
          <Style
            yOffset={10}
            font={smallFont}
            fontColor={new Color(1, 1, 1, 0.7)}
          >
            /{character.stat('hpMax')}
          </Style>
          <Spacer size={new Size(20, 0)} />
          MP {character.stat('mp')}
          <Style
            yOffset={10}
            font={smallFont}
            fontColor={new Color(1, 1, 1, 0.7)}
          >
            /{character.stat('mpMax')}
          </Style>
        </Flow>
      </Fragment>
    );
  }

  getNaturalWidth() {
    return 840;
  }
}
