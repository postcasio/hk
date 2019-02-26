import Intro from './lib/scenes/Intro';
import { GameConfig } from './lib/Game';

const config: GameConfig = {
  initialScene: Intro,
  globalPixelZoom: 4,
  debugCollision: false
};

export default config;
