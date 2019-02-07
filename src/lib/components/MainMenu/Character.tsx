import Kinetic, {
  Component,
  PositionProps,
  SizeProps,
  Text,
  Size,
  Fragment,
  Line
} from 'kinetic';
import Character from '../../Character';
import Flow, { Spacer } from '../Flow';
import Style from '../Style';

export interface CharacterProps extends PositionProps, SizeProps {
  character: Character;
}
export default class CharacterComponent extends Component<CharacterProps> {
  render() {
    const { at, size, character } = this.props;

    const flowAt = at!.inherit();
    const flowSize = size!.inherit();

    return (
      <Fragment>
        <Flow at={flowAt} size={flowSize} lineHeight={40}>
          <Text content={character.name} size={new Size(60, Size.AUTO)} />
          HP {character.stat('hp')}/
          <Style
            yOffset={2}
            font={Font.Default}
            fontColor={new Color(1, 1, 1, 0.7)}
          >
            {character.stat('hpMax')}
          </Style>
          <Spacer size={new Size(20, 0)} />
          MP {character.stat('mp')}/
          <Style
            yOffset={2}
            font={Font.Default}
            fontColor={new Color(1, 1, 1, 0.7)}
          >
            {character.stat('mpMax')}
          </Style>
        </Flow>
        <Line
          at={at!
            .inherit()
            .addY(size!.h)
            .addY(-1)}
          size={new Size(size!.w, 1)}
          fillColor={new Color(1, 1, 1, 0.9)}
          fillColor2={new Color(1, 1, 1, 0.2)}
        />
      </Fragment>
    );
  }
}
