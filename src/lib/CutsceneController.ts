import { Node } from 'kinetic';
import Cutscene from './Cutscene';
import Game from './Game';

export type CutsceneScriptCommand<T> = (
  this: CutsceneController
) => Promise<T> | T;

export type CutsceneScript = (dispatch: Dispatcher, game: Game) => Promise<any>;

export interface CutsceneScriptModule {
  default?: CutsceneScript;
}

export type Dispatcher = <T>(command: CutsceneScriptCommand<T>) => Promise<T>;

export interface ObjectClaim {
  release: () => void;
}

export function isObjectClaim(object: any): object is ObjectClaim {
  return object && typeof object === 'object' && 'release' in object;
}

export default class CutsceneController {
  cutscene: Cutscene;
  script: CutsceneScript;

  constructor(cutscene: Cutscene, script: CutsceneScript) {
    this.cutscene = cutscene;
    this.script = script;
  }

  async exec() {
    return await this.script(this.dispatch, Game.current);
  }

  addUIElement(element: Node) {
    return this.cutscene.addUIElement(element);
  }

  dispatch = async <T>(command: CutsceneScriptCommand<T>): Promise<T> => {
    return await command.call(this);
  };
}
