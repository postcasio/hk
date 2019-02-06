import Party from './Party';
import Quest from './Quest';

export interface LocationState {
  map: string;
  x: number;
  y: number;
  layer: number;
  facing: Direction.EAST;
}

export default class Journal {
  parties: { [partyKey: string]: Party };
  quests: { [questKey: string]: Quest };

  constructor() {
    this.parties = {};
    this.quests = {};
  }

  addParty(key: string, party: Party) {
    this.parties[key] = party;
  }
}
