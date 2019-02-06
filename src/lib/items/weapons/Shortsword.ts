import { CoreModuleType } from '../CoreModule';
import Weapon from '../Weapon';

export default class Shortsword extends Weapon {
  name = 'Shortsword';

  basePrice = 200;

  equippedStatDelta = {
    str: 20
  };

  coreModuleTemplate = [CoreModuleType.LINKED, CoreModuleType.UNLINKED];
}
