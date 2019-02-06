import { Component, Node } from 'kinetic';
import CutsceneController, {
  ObjectClaim,
  CutsceneScript,
  CutsceneScriptModule
} from './CutsceneController';
import 'core-js/shim';

let idCounter = 1;
function uniqueId() {
  return idCounter++;
}

export interface CutsceneProps {
  script:
    | CutsceneScript
    | Promise<CutsceneScript>
    | Promise<CutsceneScriptModule>;

  onComplete?: () => void;
}

export interface CutsceneState {
  script: null | CutsceneScript;
  elements: Array<{ element: Node; id: number }>;
}

export default class Cutscene extends Component<CutsceneProps, CutsceneState> {
  getInitialState() {
    return {
      script: null,
      elements: []
    };
  }

  async componentDidMount() {
    await this.setState({
      script: await Promise.resolve(this.props.script as any).then(
        (script: CutsceneScript | CutsceneScriptModule): CutsceneScript =>
          'default' in script && script.default
            ? script.default
            : (script as CutsceneScript)
      )
    });

    const controller = new CutsceneController(this, this.state.script!);

    await controller.exec();

    if (this.props.onComplete) {
      this.props.onComplete();
    }
  }

  addUIElement(element: Node): ObjectClaim {
    const id = uniqueId();

    this.setState({
      elements: this.state.elements.concat([
        {
          id,
          element
        }
      ])
    });

    return {
      release: () => {
        this.setState({
          elements: this.state.elements.filter(el => el.id !== id)
        });
      }
    };
  }

  render() {
    return this.state.elements.map(el => el.element);
  }
}
