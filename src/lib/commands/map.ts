import Game from '../Game';
import Map from '../map/Map';
import Camera from '../map/Camera';
import Engine from '../map/Engine';
import CameraMarker from '../map/entities/CameraMarker';
import Tween, { Easing } from 'tween';

export function getEngine(): Engine {
  return Game.current.getDirector().getMapEngine();
}

export function getMap(): Map {
  const engine = getEngine();
  if (!engine.map) {
    throw new Error('Unable to get map, no map is loaded');
  }

  return engine.map;
}

export function getCamera(): Camera {
  const engine = getEngine();
  if (!engine.camera) {
    throw new Error('Unable to get camera, no camera exists');
  }

  return engine.camera;
}

export async function changeMap(map: string) {
  const engine = Game.current.getDirector().getMapEngine();
  engine.changeMap(map);
  return engine.map!;
}

export async function panToCameraMarker(
  marker: CameraMarker,
  frames: number,
  easing: Easing = Easing.Sine
) {
  return panTo(
    marker.x,
    marker.y,
    marker.zoom,
    frames,
    easing,
    marker.frameX,
    marker.frameY,
    marker.frameW,
    marker.frameH
  );
}

export async function panTo(
  x: number,
  y: number,
  zoom: number,
  frames: number,
  easing: Easing = Easing.Sine,
  frameX?: number,
  frameY?: number,
  frameW?: number,
  frameH?: number
) {
  const camera = getCamera();
  const frame: { [k: string]: number } = {};

  if (frameX !== undefined) {
    frame.frameX = frameX;
  }
  if (frameY !== undefined) {
    frame.frameY = frameY;
  }
  if (frameW !== undefined) {
    frame.frameW = frameW;
  }
  if (frameH !== undefined) {
    frame.frameH = frameH;
  }

  return new Tween(camera, easing).easeInOut(
    {
      x,
      y,
      zoom,
      ...frame
    },
    frames
  );
}
