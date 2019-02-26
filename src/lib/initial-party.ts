import Party from './Party';
import Character from './Character';
import Shortsword from './items/weapons/Shortsword';
import EquippedWeapon from './party/EquippedWeapon';
import Sprite from './Sprite';

export function createInitialParty() {
  const party = new Party();
  for (const characterName of ['Elvis', 'Buddy', 'Michael']) {
    party.addCharacter(
      new Character(characterName, {
        sprite: new Sprite('res/sprite/stick.json'),
        weapon: new EquippedWeapon(new Shortsword()),
        baseStats: {
          str: 40,
          vit: 40,
          mag: 40,
          spr: 40,
          spd: 40,
          eva: 40,
          hit: 99,
          hp: Math.floor(200 * Math.random()),
          hpMax: 200,
          mp: Math.floor(30 * Math.random()),
          mpMax: 30,
          fireStr: 0,
          iceStr: 0,
          earthStr: 0,
          airStr: 0,
          fireDef: 0,
          iceDef: 0,
          earthDef: 0,
          airDef: 0
        }
      })
    );
  }

  return party;
}
