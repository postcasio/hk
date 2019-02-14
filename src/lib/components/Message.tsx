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
import Prim from 'prim';
import clipTo from '../clip';
import BMF from '../BMF';

const backgroundColor1 = new Color(0.5, 0.6, 0.9, 0.9);
const backgroundColor2 = new Color(0.1, 0.12, 0.3, 0.6);
const backgroundColor3 = new Color(0.1, 0.12, 0.3, 0.6);
const borderColor = new Color(1, 1, 1, 1);
const borderColor2 = new Color(1, 1, 1, 0.1);

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
    target.blendOp = BlendOp.Replace;
    Prim.drawSolidRectangle(target, x, y, w, h - 10, backgroundColor3);
    clipTo(target, x, y, w, h - 10, () => {
      Prim.drawSolidEllipse(
        target,
        x + w / 2,
        y + h,
        w / 2,
        h / 2,
        backgroundColor1,
        backgroundColor2
      );
    });
    target.blendOp = prevOp;

    Prim.drawLine(
      target,
      x,
      y + h - 10,
      x + w / 2,
      y + h - 10,
      2,
      borderColor2,
      borderColor
    );
    Prim.drawLine(
      target,
      x + w / 2,
      y + h - 10,
      x + w,
      y + h - 10,
      2,
      borderColor,
      borderColor2
    );

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
    return this.flow ? this.flow.getNaturalHeight() + 30 : 0;
  }
}
