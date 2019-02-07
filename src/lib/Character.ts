import EquippedWeapon from './party/EquippedWeapon';

export interface CharacterDefaults {
  weapon: EquippedWeapon;
  baseStats: CharacterStats;
}

export default class Character {
  name: string;
  weapon: EquippedWeapon;

  // armor: EquippedArmor;
  // shield: EquippedShield;
  // accessories: EquippedAccessory[];
  baseStats: CharacterStats;

  constructor(name: string, { weapon, baseStats }: CharacterDefaults) {
    this.name = name;
    this.weapon = weapon;
    this.baseStats = baseStats;
  }

  stat(name: keyof CharacterStats): number {
    return this.baseStats[name];
  }
}

export interface CharacterStats {
  str: number;
  vit: number;
  mag: number;
  spr: number;
  spd: number;
  hit: number;
  eva: number;

  hp: number;
  hpMax: number;
  mp: number;
  mpMax: number;

  fireStr: number;
  iceStr: number;
  earthStr: number;
  airStr: number;
  fireDef: number;
  iceDef: number;
  earthDef: number;
  airDef: number;
}
