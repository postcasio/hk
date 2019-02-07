import Party from './Party';
import Quest from './Quest';
import { Emitter } from 'event-kit';

export interface LocationState {
  map: string;
  x: number;
  y: number;
  layer: number;
  facing: Direction.EAST;
}

export type DidChangeActivePartyEvent = { party: Party; oldParty: Party };

export type DidChangeActivePartyCallback = (
  event: DidChangeActivePartyEvent
) => void;

export default class Journal {
  parties: { [partyKey: string]: Party };
  quests: { [questKey: string]: Quest };
  emitter: Emitter = new Emitter();

  activeParty: string | null = null;

  constructor() {
    this.parties = {};
    this.quests = {};
  }

  addParty(key: string, party: Party) {
    this.parties[key] = party;

    if (Object.entries(this.parties).length === 1) {
      this.setActiveParty(key);
    }
  }

  getParty(key: string) {
    return this.parties[key];
  }

  getActiveParty(): Party | null {
    return this.activeParty ? this.parties[this.activeParty] : null;
  }

  setActiveParty(key: string): void {
    if (key === this.activeParty) {
      return;
    }

    const oldParty = this.activeParty;

    this.activeParty = key;

    this.emitter.emit('did-change-active-party', {
      party: key,
      oldParty
    });
  }

  onDidChangeActiveParty(callback: DidChangeActivePartyCallback) {
    return this.emitter.on('did-change-active-party', callback);
  }
}
