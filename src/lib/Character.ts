import EquippedWeapon from './party/EquippedWeapon';
import Sprite from './Sprite';

export interface CharacterDefaults {
  weapon: EquippedWeapon;
  baseStats: CharacterStats;
  sprite: Sprite;
}

export default class Character {
  name: string;
  weapon: EquippedWeapon;

  // armor: EquippedArmor;
  // shield: EquippedShield;
  // accessories: EquippedAccessory[];
  baseStats: CharacterStats;
  sprite: Sprite;

  constructor(name: string, { weapon, baseStats, sprite }: CharacterDefaults) {
    this.name = name;
    this.weapon = weapon;
    this.baseStats = baseStats;
    this.sprite = sprite;
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
