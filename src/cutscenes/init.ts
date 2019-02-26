import { createInitialParty } from '../lib/initial-party';
import Game from '../lib/Game';
import { changeMap, getEngine } from '../lib/commands/map';
import log from '../lib/log';
import Actor from '../lib/map/entities/Actor';
import PlayerController from '../lib/map/entities/Controllers/PlayerController';

export default async function init(game: Game): Promise<any> {
  log.debug('Starting a new game...');

  log.debug('Creating the journal...');
  const journal = game.getJournal();

  log.debug('Creating the initial party...');
  const initialParty = createInitialParty();
  journal.addParty('DEFAULT', initialParty);

  log.debug('Changing to first map...');
  const map = await changeMap('res/map/cave.json');

  const marker = map.findEntity('start');

  if (!marker) {
    throw new Error(`Could not find party start marker in map`);
  }
  const hero = new Actor(
    'hero',
    marker.x,
    marker.y,
    initialParty.getPointCharacter().sprite,
    {
      controller: new PlayerController()
    }
  );
  hero.isPlayer = true;
  // hero.isKinematic = true;
  map.addEntity(hero);
  const layer = marker.getLayer();
  if (!layer) {
    throw new Error('Start marker had no layer');
  }
  hero.setLayer(layer);
  hero.attachCamera(getEngine().camera!);

  log.debug('Game started.');
}
