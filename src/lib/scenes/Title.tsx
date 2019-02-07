import Scene from '../Scene';
import Kinetic, {
  Fragment /*, { Point, Size, Text }*/,
  Point,
  Size
} from 'kinetic';
// import Menu, { Option } from '../components/Menu';
import Cutscene from '../Cutscene';
import MainMenuParty from '../components/MainMenu/Party';
import Game from '../Game';
import Director from '../Director';
import { Disposable } from 'event-kit';
import log from '../log';

export default class Title extends Scene {
  private subscriptions: {
    journalDidChangeActiveParty?: Disposable;
  } = {};

  constructor(director: Director) {
    super(director);

    this.subscriptions = {};
  }

  sceneDidEnter() {
    this.subscriptions.journalDidChangeActiveParty = Game.current
      .getJournal()
      .onDidChangeActiveParty(
        this.handleJournalDidChangeActiveParty.bind(this)
      );
  }

  sceneDidLeave() {
    for (const disposable of Object.values(this.subscriptions)) {
      if (disposable) {
        disposable.dispose();
      }
    }
  }

  handleJournalDidChangeActiveParty() {
    log.debug('re-rendering title');
    this.ui.renderScene(this);
  }

  render() {
    const party = Game.current.getJournal().getActiveParty();

    return (
      <Fragment>
        {party && (
          <MainMenuParty
            at={new Point(Surface.Screen.width / 4, 0)}
            size={Size.of(Surface.Screen).addW(Surface.Screen.width / -4)}
            party={party}
          />
        )}
        <Cutscene
          script={import('../cutscenes/newgame')}
          onComplete={() => {}}
        />
      </Fragment>
    );
  }
}
