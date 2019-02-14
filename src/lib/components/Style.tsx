import { Component, PositionProps, SizeProps, Node, IFont } from 'kinetic';

export interface StyleProps extends PositionProps, SizeProps {
  verticalAlign?: 'top' | 'middle' | 'bottom';
  fontColor?: Color;
  font?: IFont;
  children?: Array<Node>;
  yOffset?: number;
  width?: number;
}

export default class Style extends Component<StyleProps> {
  render() {
    return this.props.children || [];
  }
}
