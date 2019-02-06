import Item from './Item';
import ItemCategory from './ItemCategory';

export default class MagicCore extends Item {
  category = ItemCategory.MAGIC_CORE;

  coreColor: Color = Color.White;
}
