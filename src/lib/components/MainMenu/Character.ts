import { Component } from 'kinetic';
import Character from '../../Character';

export interface CharacterProps {
  character: Character;
}
export default class CharacterComponent extends Component<CharacterProps> {}
