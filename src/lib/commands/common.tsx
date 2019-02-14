import Kinetic, { Node, Point, Size, Image } from 'kinetic';
import CutsceneController from '../CutsceneController';
import Message from '../components/Message';
import Journal from '../Journal';
import Game from '../Game';

export function addUIElement(element: Array<Node> | Node) {
  Game.current.getUI().addElement(element);
}

export function message(
  content: Array<Node> | Node,
  {
    x,
    y,
    w,
    h = 0,
    block = true,
    closeable = true
  }: {
    x: number;
    y: number;
    w: number;
    h?: number;
    block?: boolean;
    closeable?: boolean;
  }
): Promise<{ release: () => void }> {
  return new Promise((resolve, _reject) => {
    const messageComponent = Game.current.getUI().addElement(
      <Message
        at={new Point(x, y)}
        size={new Size(w, h || Size.AUTO)}
        onClose={closeable ? close : undefined}
      >
        {content}
      </Message>
    );

    function close() {
      messageComponent.release();
      resolve(messageComponent);
    }

    if (!block) {
      resolve(messageComponent);
    }
  });
}

export function image(
  src: string | Texture | Promise<Texture>,
  {
    x,
    y,
    w = 0,
    h = 0
  }: {
    x: number;
    y: number;
    w?: number;
    h?: number;
  }
) {
  return Game.current
    .getUI()
    .addElement(
      <Image
        src={src}
        at={new Point(x, y)}
        size={new Size(w || Size.AUTO, h || Size.AUTO)}
      />
    );
}

export function withJournal(callback: (journal: Journal) => any) {
  return function(this: CutsceneController) {
    const journal = Game.current.getJournal();

    return callback(journal);
  };
}

export function sleep(frames: number): Promise<void> {
  return Sphere.sleep(frames);
}
