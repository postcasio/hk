import Game from '../../lib/Game';
import { message } from '../../lib/commands/common';

export default async function init(game: Game): Promise<any> {
  await message('Hello!', {
    x: 20,
    y: 20,
    w: 400,
    h: 100,
    block: true,
    closeable: true
  });
}
