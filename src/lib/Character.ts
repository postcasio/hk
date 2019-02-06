import EquippedWeapon from './party/EquippedWeapon';
import Element from './magic/Element';

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
}

export interface CharacterStats {
  str: number;
  vit: number;
  mag: number;
  spr: number;
  spd: number;
  hit: number;
  eva: number;

  elementalStr: {
    [Element.FIRE]: number;
    [Element.ICE]: number;
    [Element.EARTH]: number;
    [Element.AIR]: number;
  };

  elementalDef: {
    [Element.FIRE]: number;
    [Element.ICE]: number;
    [Element.EARTH]: number;
    [Element.AIR]: number;
  };
}
