import ItemCategory from './ItemCategory';
import Item from './Item';
import CoreModule, { CoreModuleType } from './CoreModule';
import UnlinkedCoreModule from './UnlinkedCoreModule';
import LinkedCoreModule from './LinkedCoreModule';

export default class Weapon extends Item {
  category: ItemCategory = ItemCategory.WEAPON;

  coreModuleTemplate: CoreModuleType[] = [];

  createCoreModules(): CoreModule[] {
    return this.coreModuleTemplate.map(type => {
      switch (type) {
        default:
        case CoreModuleType.UNLINKED:
          return new UnlinkedCoreModule();
        case CoreModuleType.LINKED:
          return new LinkedCoreModule();
      }
    });
  }
}
