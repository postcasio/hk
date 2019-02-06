export default class ItemCategory {
  name: string;
  icon: string;

  static WEAPON = new ItemCategory('Weapons', 'weapon.png');
  static UNKNOWN = new ItemCategory('Unknown', 'unknown.png');
  static MAGIC_CORE = new ItemCategory('Magic Cores', 'mcore.png');

  constructor(name: string, icon: string) {
    this.name = name;
    this.icon = icon;
  }
}
