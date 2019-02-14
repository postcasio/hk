import Kinetic, { Component, PositionProps, SizeProps, Size } from 'kinetic';
import Party from '../../party';
import Character from './Character';
import Menu, { Option } from '../Menu';

export interface PartyProps extends PositionProps, SizeProps {
  party: Party;
}
export default class MainMenuParty extends Component<PartyProps> {
  render() {
    const { at, party } = this.props;

    return (
      <Menu
        at={at!.inherit().addY(10)}
        size={Size.auto}
        backgroundColor={new Color(0, 0, 0, 0.5)}
      >
        {party.getCharacters().map(character => (
          <Option padding={0}>
            <Character character={character} />
          </Option>
        ))}
      </Menu>
    );
  }
}
