import { Component, PositionProps, SizeProps, Node } from 'kinetic';

export interface StyleProps extends PositionProps, SizeProps {
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fontColor?: Color;
  children?: Array<Node>;
}

export default class Style extends Component<StyleProps> {
  render() {
    return this.props.children || [];
  }
}
