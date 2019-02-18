import Kinetic, {
  PositionProps,
  SizeProps,
  Component,
  Node,
  Focused,
  KeyPressEvent,
  IFont
} from 'kinetic';
import Flow from './Flow';
import BMF from '../BMF';
import Game from '../Game';

const windowImage = new Texture('res/image/window-bg.png');
const cornerImage = new Texture('res/image/window-border-cut.png');
interface MessageProps extends PositionProps, SizeProps {
  children?: Array<Node>;
  font?: IFont;
  onClose?: () => void;
}

export default class Message extends Component<MessageProps> {
  flow?: Flow;

  static defaultProps = {
    font: new BMF('res/font/helvetica-32-regular.fnt')
  };

  handleKeyPress = (event: KeyPressEvent) => {
    switch (event.key) {
      case Key.Enter:
        event.stopPropagation();
        this.props.onClose && this.props.onClose();
        break;
    }
  };

  draw(target: Surface) {
    const { at, size } = this.props;

    const { x, y } = at!.resolve();
    const { w, h } = size!.resolve();

    const prevOp = target.blendOp;
    const mask = new Color(1, 1, 1, 1);
    const zoom = Game.current.config.globalPixelZoom;

    // Draw tiled background

    const u2 = w / windowImage.width / zoom;
    const v1 = 1 - h / windowImage.height / zoom;
    const v2 = 1;
    let x2 = x + w;
    let y2 = y + h;

    Shape.drawImmediate(target, ShapeType.TriStrip, windowImage, [
      { x: x, y: y, u: 0, v: v2, color: mask },
      { x: x2, y: y, u: u2, v: v2, color: mask },
      { x: x, y: y2, u: 0, v: v1, color: mask },
      { x: x2, y: y2, u: u2, v: v1, color: mask }
    ]);

    // Subtract the corners

    x2 = x + cornerImage.width * zoom;
    y2 = y + cornerImage.height * zoom;

    target.blendOp = BlendOp.Subtract;

    Shape.drawImmediate(target, ShapeType.TriStrip, cornerImage, [
      { x: x, y: y, u: 0, v: 1, color: mask },
      { x: x2, y: y, u: 1, v: 1, color: mask },
      { x: x, y: y2, u: 0, v: 0, color: mask },
      { x: x2, y: y2, u: 1, v: 0, color: mask }
    ]);

    target.blendOp = prevOp;

    super.draw(target);
  }

  render() {
    const { font } = this.props;

    return (
      <Focused onKeyPress={this.handleKeyPress}>
        <Flow
          at={this.props
            .at!.inherit()
            .addX(10)
            .addY(10)}
          size={this.props
            .size!.inherit()
            .addW(-20)
            .addH(-20)}
          lineHeight={18}
          font={font}
          ref={flow => (this.flow = flow)}
        >
          {this.props.children}
        </Flow>
      </Focused>
    );
  }

  getNaturalWidth() {
    return this.flow ? this.flow.getNaturalWidth() + 20 : 0;
  }

  getNaturalHeight() {
    return this.flow ? this.flow.getNaturalHeight() + 20 : 0;
  }
}
