import Item from '../items/Item';

export default class InventorySlot {
  item: Item;
  quantity: number;

  constructor(item: Item, quantity = 1) {
    this.item = item;
    this.quantity = quantity;
  }
}
