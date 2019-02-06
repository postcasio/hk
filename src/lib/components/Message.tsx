import Kinetic, {
  PositionProps,
  SizeProps,
  Component,
  Node,
  Rectangle,
  Focused,
  KeyPressEvent
} from 'kinetic';
import Flow from './Flow';

interface MessageProps extends PositionProps, SizeProps {
  children?: Array<Node>;
  onClose?: () => void;
}

export default class Message extends Component<MessageProps> {
  flow?: Flow;

  handleKeyPress = (event: KeyPressEvent) => {
    SSj.log('message handling key press');
    switch (event.key) {
      case Key.Enter:
        event.stopPropagation();
        this.props.onClose && this.props.onClose();
        break;
    }
  };

  render() {
    SSj.log('rendering message');
    return (
      <Focused onKeyPress={this.handleKeyPress}>
        <Rectangle
          at={this.props.at!.inherit()}
          size={this.props.size!.inherit()}
          fillColor={new Color(0.5, 0.6, 0.6)}
          borderColor={new Color(0.9, 0.9, 0.9)}
          borderWidth={1}
        />
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
          font={Font.Default}
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
    SSj.log('Get natural height of message....');
    return this.flow ? this.flow.getNaturalHeight() + 20 : 0;
  }
}
