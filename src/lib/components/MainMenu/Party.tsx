import Kinetic, { Component, PositionProps, SizeProps } from 'kinetic';
import Party from '../../party';
import Character from './Character';
import Menu, { Option } from '../Menu';

export interface PartyProps extends PositionProps, SizeProps {
  party: Party;
}
export default class PartyComponent extends Component<PartyProps> {
  render() {
    return (
      <Menu at={this.props.at} size={this.props.size}>
        {this.props.party.getCharacters().map(character => (
          <Option>
            <Character character={character} />
          </Option>
        ))}
      </Menu>
    );
  }
}
