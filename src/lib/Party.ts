import Character from './Character';

export default class Party {
  private funds: number = 0;
  private characters: Character[] = [];

  constructor() {}

  addCharacter(character: Character): this {
    this.characters.push(character);

    return this;
  }

  removeCharacter(character: Character): this {
    this.characters = this.characters.filter(c => c !== character);

    return this;
  }

  getCharacters(): Character[] {
    return [...this.characters];
  }

  setFunds(funds: number): this {
    this.funds = funds;

    return this;
  }

  addFunds(fundsDelta: number): this {
    this.funds += fundsDelta;

    return this;
  }

  hasSufficientFunds(requiredFunds: number): boolean {
    return this.funds >= requiredFunds;
  }

  getFunds(): number {
    return this.funds;
  }
}
