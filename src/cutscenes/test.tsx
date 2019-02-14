import { panToCameraMarker, getMap } from '../lib/commands/map';
import Game from '../lib/Game';

import CameraMarker from '../lib/map/entities/CameraMarker';
import { message, sleep } from '../lib/commands/common';
import Kinetic, { Fragment } from 'kinetic';
import Style from '../lib/components/Style';
import BMF from '../lib/BMF';
import { Break } from '../lib/components/Flow';

export default async function newgame(game: Game): Promise<any> {
  const map = getMap();

  const cutsceneCameraMarker = map.findEntity(
    'cutsceneCameraMarker'
  ) as CameraMarker;
  const cutsceneCameraMarker2 = map.findEntity(
    'cutsceneCameraMarker2'
  ) as CameraMarker;

  await panToCameraMarker(cutsceneCameraMarker, 120);

  await sleep(60);

  const msg = await message(
    <Fragment>
      <Style font={new BMF('res/font/helvetica-32-gold.fnt')}>Character</Style>
      <Break />
      {'    '}"That's the{' '}
      <Style font={new BMF('res/font/helvetica-32-blue.fnt')}>
        Mysterious Cave
      </Style>{' '}
      I told you about..."
    </Fragment>,
    {
      x: 100,
      y: 80,
      w: 500,
      block: false,
      closeable: true
    }
  );

  await sleep(60 * 4);

  msg.release();

  await panToCameraMarker(cutsceneCameraMarker2, 120);
}
