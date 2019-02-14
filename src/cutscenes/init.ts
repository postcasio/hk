import { createInitialParty } from '../lib/initial-party';
import Game from '../lib/Game';
import { changeMap } from '../lib/commands/map';
import log from '../lib/log';

export default async function init(game: Game): Promise<any> {
  log.debug('Starting a new game...');

  log.debug('Creating the journal...');
  const journal = game.getJournal();

  log.debug('Creating the initial party...');
  journal.addParty('DEFAULT', createInitialParty());

  log.debug('Changing to first map...');
  await changeMap('res/map/test2.json');

  log.debug('Game started.');
}
