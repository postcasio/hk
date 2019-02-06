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
}

interface MenuState {
  selectedIndex: number;
}

export default class Menu extends Component<MenuProps, MenuState> {
  static defaultProps = {
    backgroundColor: new Color(0.5, 0.6, 0.6)
  };

  constructor(props: MenuProps) {
    super(props);
  }

  getInitialState(): MenuState {
    return {
      selectedIndex: 0
    };
  }

  componentDidMount() {
    Dispatch.later(320, () => {
      this.setState({
        selectedIndex: 1
      });
    });
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
    selectedBackgroundColor: new Color(0.8, 0.95, 0.9, 0.25),
    selected: false
  };

  render() {
    if (!this.props.at || !this.props.size) {
      return;
    }

    const { at, size } = this.props;

    const { backgroundColor, selectedBackgroundColor, selected } = this.props;

    return (
      <Fragment>
        <Rectangle
          at={at.inherit()}
          size={size.inherit()}
          fillColor={selected ? selectedBackgroundColor : backgroundColor}
        />
        {this.props.children &&
          this.props.children
            .filter(isElement)
            .map(child =>
              child.withProps({ at: at.inherit(), size: size.inherit() })
            )}
      </Fragment>
    );
  }
}
