import Game from './Game';

export type CutsceneScript = (game: Game) => Promise<any>;

export interface CutsceneScriptModule {
  default?: CutsceneScript;
}

export default class CutsceneController {
  script: CutsceneScript;

  constructor(script: CutsceneScript) {
    this.script = script;
  }

  async exec() {
    return await this.script(Game.current);
  }
}
