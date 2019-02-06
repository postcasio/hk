import ItemCategory from './ItemCategory';
import { CharacterStats } from '../Character';

export default abstract class Item {
  name: string = '???';
  category: ItemCategory = ItemCategory.UNKNOWN;

  basePrice: number = 0;
  baseSellFactor: number = 0.5;

  saleable: boolean = false;

  equippedStatDelta: Partial<CharacterStats> = {};
}
