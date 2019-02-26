import Actor from '../map/entities/Actor';
import Kinetic, { Component, Image, Fragment, Point, Size } from 'kinetic';
// import BMF from '../BMF';
import Game from '../Game';

export interface InteractionPromptProps {
  actor: Actor;
}

const img = new Texture('res/image/interact.png');

// const font = new BMF('res/font/helvetica-32-regular.fnt');
// const size = font.getTextSize('X');

export default class InteractionPrompt extends Component<
  InteractionPromptProps
> {
  updateJob?: JobToken;

  componentDidMount() {
    this.updateJob = Dispatch.onUpdate(() =>
      this._kinetic.scheduleUpdate(this)
    );
  }

  componentDidUnmount() {
    this.updateJob!.cancel();
  }

  render() {
    const { center, halfSize } = this.props.actor.getScreenBox();

    const zoom = Game.current.config.globalPixelZoom;
    return (
      <Fragment>
        <Image
          src={img}
          at={
            new Point(
              center.x - (img.width * zoom) / 2,
              center.y - halfSize.y - (img.height * zoom) / 2 - 4
            )
          }
          size={new Size(img.width * zoom, img.height * zoom)}
        />
      </Fragment>
    );
  }
}
