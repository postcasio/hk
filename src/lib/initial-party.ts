import Party from './Party';
import Character from './Character';
import Shortsword from './items/weapons/Shortsword';
import Element from './magic/Element';
import EquippedWeapon from './party/EquippedWeapon';

export function createInitialParty() {
  const party = new Party();
  party.addCharacter(
    new Character('Elvis', {
      weapon: new EquippedWeapon(new Shortsword()),
      baseStats: {
        str: 40,
        vit: 40,
        mag: 40,
        spr: 40,
        spd: 40,
        eva: 40,
        hit: 99,
        elementalStr: {
          [Element.FIRE]: 0,
          [Element.ICE]: 0,
          [Element.EARTH]: 0,
          [Element.AIR]: 0
        },
        elementalDef: {
          [Element.FIRE]: 0,
          [Element.ICE]: 0,
          [Element.EARTH]: 0,
          [Element.AIR]: 0
        }
      }
    })
  );

  return party;
}
