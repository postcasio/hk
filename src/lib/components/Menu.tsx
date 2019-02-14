import Kinetic, {
  Component,
  Rectangle,
  Fragment,
  PositionProps,
  SizeProps,
  Node,
  Layout,
  Element,
  isElement,
  Focused,
  KeyPressEvent,
  Size,
  Line,
  isElementComponent
} from 'kinetic';
import uitheme from '../uitheme';
import Arrow from './Arrow';

interface MenuProps extends PositionProps, SizeProps {
  children?: Array<Element>;
  backgroundColor?: Color;
}

interface OptionProps extends PositionProps, SizeProps {
  onSelect?: () => void;
  backgroundColor?: Color;
  selectedBackgroundColor?: Color;
  children?: Array<Node>;
  selected?: boolean;
  index?: number;
  padding?: number;
}

interface MenuState {
  selectedIndex: number;
}

export default class Menu extends Component<MenuProps, MenuState> {
  static defaultProps = {
    backgroundColor: uitheme.controls.window.background
  };

  constructor(props: MenuProps) {
    super(props);
  }

  getInitialState(): MenuState {
    return {
      selectedIndex: 0
    };
  }

  handleKeyPress = (event: KeyPressEvent) => {
    switch (event.key) {
      case Key.Enter:
        const selected = this.props.children![this.state.selectedIndex];
        if (isElementComponent(selected, Option)) {
          selected.props.onSelect!();
        }
        break;
      case Key.Down:
        this.setState({
          selectedIndex: this.state.selectedIndex + 1
        });
        break;
      case Key.Up:
        this.setState({
          selectedIndex: this.state.selectedIndex - 1
        });
        break;
    }
  };

  render() {
    if (!this.props.at || !this.props.size) {
      return;
    }

    const { backgroundColor } = this.props;
    const { selectedIndex } = this.state;

    const at = this.props.at;
    const size = this.props.size;

    return (
      <Focused
        onKeyPress={this.handleKeyPress}
        at={at.inherit()}
        size={size.inherit()}
      >
        <Rectangle
          at={at.inherit()}
          size={size.inherit()}
          fillColor={backgroundColor}
        />
        <Layout flow="vertical" at={at.inherit()} size={size.inherit()}>
          {this.props.children &&
            this.props.children.map((child, index) =>
              child.withProps({ index, selected: selectedIndex === index })
            )}
        </Layout>
      </Focused>
    );
  }
}

export class Option extends Component<OptionProps> {
  static defaultProps = {
    backgroundColor: Color.Transparent,
    selected: false,
    padding: 10
  };

  render() {
    if (!this.props.at || !this.props.size) {
      return;
    }

    const { at, size, padding, selected } = this.props;

    return (
      <Fragment>
        {this.props.children &&
          this.props.children.filter(isElement).map(child =>
            child.withProps({
              at: at
                .inherit()
                .addX(padding!)
                .addY(padding!),
              size: size
                .inherit()
                .addW(-padding! * 2)
                .addH(-padding! * 2)
            })
          )}

        {this.props.index === 0 && (
          <Line
            at={at!.inherit()}
            to={at!.inherit().addX(size!.w)}
            fillColor={new Color(1, 1, 1, 0.9)}
            fillColor2={new Color(1, 1, 1, 0.2)}
            width={2}
          />
        )}
        <Line
          at={at!
            .inherit()
            .addY(size!.h)
            .addY(-1)}
          to={at!
            .inherit()
            .addY(size!.h)
            .addY(-1)
            .addX(size!.w)}
          fillColor={new Color(1, 1, 1, 0.9)}
          fillColor2={new Color(1, 1, 1, 0)}
          width={2}
        />

        {selected && (
          <Arrow
            at={at
              .inherit()
              .addY(() => size.h() / 2 - 8)
              .addX(-20)}
            size={new Size(16, 16)}
          />
        )}
      </Fragment>
    );
  }

  getNaturalWidth() {
    return super.getNaturalWidth() + this.props.padding! * 2;
  }

  getNaturalHeight() {
    return super.getNaturalHeight() + this.props.padding! * 2;
  }
}
