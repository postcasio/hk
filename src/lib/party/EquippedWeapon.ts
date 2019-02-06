import Weapon from '../items/Weapon';
import CoreModule from '../items/CoreModule';

export default class EquippedWeapon {
  weapon: Weapon;
  coreModules: CoreModule[];

  constructor(weapon: Weapon) {
    this.weapon = weapon;
    this.coreModules = weapon.createCoreModules();
  }
}
