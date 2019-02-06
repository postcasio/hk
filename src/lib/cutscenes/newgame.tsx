import { Dispatcher } from '../CutsceneController';
import { message } from '../commands/common';
import { createInitialParty } from '../initial-party';
import Game from '../Game';
import log from '../log';

export default async function newgame(
  dispatch: Dispatcher,
  game: Game
): Promise<any> {
  const journal = game.getJournal();

  journal.addParty('DEFAULT', createInitialParty());

  await dispatch(
    message('Journal created!', {
      x: 10,
      y: 10,
      w: 200,
      block: true,
      closeable: true
    })
  );

  log.debug(journal);

  await Sphere.sleep(60);
}
