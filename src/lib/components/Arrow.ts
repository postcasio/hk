import Prim from 'prim';
import { PositionProps, SizeProps, Primitive } from 'kinetic';

interface ArrowProps extends PositionProps, SizeProps {
  fillColor?: Color;
  borderColor?: Color;
  borderWidth?: number;
}

interface ArrowState {
  height: number;
  dir: 1 | -1;
}

export default class Arrow extends Primitive<ArrowProps, ArrowState> {
  static defaultProps: Partial<ArrowProps> = {
    fillColor: Color.White,
    borderColor: Color.Transparent,
    borderWidth: 0
  };

  stop: boolean = false;

  getInitialState(): ArrowState {
    return { height: 0, dir: 1 };
  }

  componentDidMount() {
    this.frame();
  }

  componentWillUnmount() {
    this.stop = true;
  }

  frame = () => {
    if (this.stop) {
      return;
    }

    const { height, dir } = this.state;

    if (height == 8) {
      this.setState({ height: 7, dir: -1 });
    } else if (height == 0) {
      this.setState({ height: 1, dir: 1 });
    } else {
      this.setState({ height: height + dir });
    }

    Dispatch.later((8 - height) * 1.5, this.frame);
  };

  draw(target: Surface): void {
    if (!this.props.at || !this.props.size) {
      return;
    }

    const { at, size, fillColor, borderColor, borderWidth } = this.props;
    const { height } = this.state;

    const { x, y } = at.resolve();
    const { w, h } = size.resolve();

    const mid = y + h / 2;
    const inset = x + w / 4;
    const top = y;
    const bottom = y + h;

    if (fillColor) {
      Prim.drawSolidTriangle(
        target,
        x,
        top + height,
        x + w,
        mid,
        inset,
        mid,
        fillColor
      );
      Prim.drawSolidTriangle(
        target,
        inset,
        mid,
        x + w,
        mid,
        x,
        bottom - height,
        fillColor
      );
      Prim.drawLine(target, inset, mid, x + w, mid, 1, fillColor);
    }

    if (borderColor && borderWidth && borderWidth > 0) {
      // Prim.drawArrow(target, x, y, w, h, borderWidth, borderColor);
    }
  }
}
