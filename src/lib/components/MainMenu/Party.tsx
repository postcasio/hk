import Kinetic, { Component, PositionProps, SizeProps } from 'kinetic';
import Party from '../../party';
import Character from './Character';
import Menu, { Option } from '../Menu';

export interface PartyProps extends PositionProps, SizeProps {
  party: Party;
}
export default class MainMenuParty extends Component<PartyProps> {
  render() {
    const { at, size, party } = this.props;

    return (
      <Menu at={at!.inherit()} size={size!.inherit()}>
        {party.getCharacters().map(character => (
          <Option>
            <Character character={character} />
          </Option>
        ))}
      </Menu>
    );
  }
}
