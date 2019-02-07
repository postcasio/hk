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
  KeyPressEvent
} from 'kinetic';
import uitheme from '../uitheme';

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
      <Focused onKeyPress={this.handleKeyPress}>
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
              child.withProps({ selected: selectedIndex === index })
            )}
        </Layout>
      </Focused>
    );
  }

  componentDidUpdate() {
    SSj.log(this.components.map(component => component.constructor.name));
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

    const { at, size, padding } = this.props;

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
