import Kinetic, { Node, Point, Size, Image } from 'kinetic';
import CutsceneController, { ObjectClaim } from '../CutsceneController';
import Message from '../components/Message';
import Journal from '../Journal';
import Game from '../Game';

export function pause(frames: number) {
  return function(this: CutsceneController): Promise<void> {
    return Sphere.sleep(frames);
  };
}

export function addUIElement(element: Array<Node> | Node) {
  return function(this: CutsceneController): ObjectClaim {
    return this.addUIElement(element);
  };
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
) {
  return function(this: CutsceneController): Promise<ObjectClaim> {
    return new Promise((resolve, _reject) => {
      SSj.log('called message func');
      const messageComponent = this.addUIElement(
        <Message
          at={new Point(x, y)}
          size={new Size(w, h || Size.AUTO)}
          onClose={closeable ? close : undefined}
        >
          {content}
        </Message>
      );
      SSj.log('created message');

      function close() {
        messageComponent.release();
        resolve(messageComponent);
        SSj.log('aclled message close callback');
      }

      if (!block) {
        SSj.log('resolving message component');
        resolve(messageComponent);
      }
    });
  };
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
  return async function(this: CutsceneController) {
    return this.addUIElement(
      <Image
        src={src}
        at={new Point(x, y)}
        size={new Size(w || Size.AUTO, h || Size.AUTO)}
      />
    );
  };
}

export function withJournal(callback: (journal: Journal) => any) {
  return function(this: CutsceneController) {
    const journal = Game.current.getJournal();

    return callback(journal);
  };
}
