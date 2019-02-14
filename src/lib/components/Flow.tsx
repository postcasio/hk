import {
  PositionProps,
  SizeProps,
  RefProps,
  Node,
  Size,
  isElement,
  SurfaceHost,
  Point,
  Component,
  isAspectRatioAware,
  isElementComponent,
  Primitive,
  isComponent,
  IFont
} from 'kinetic';
import Style from './Style';
import wrap, { WrappedLine, WrappedElement } from '../wrap';
// import { DefaultKeepSourceAlphaBlendOp } from 'kinetic/build/module/lib/prim/SurfaceHost';

interface FlowProps extends PositionProps, SizeProps, RefProps<Flow> {
  children?: Array<Node>;
  lineHeight?: number;
  font?: IFont;
}

export class Spacer extends Primitive<SizeProps> {}

export class Break extends Primitive {}

export default class Flow extends SurfaceHost<FlowProps> {
  static defaultProps = {
    ...SurfaceHost.defaultProps,
    blendOp: BlendOp.Replace,
    lineHeight: Font.Default.height,
    font: Font.Default
  };

  wrapped?: Array<WrappedLine>;
  wrappedSize?: Size;

  renderChild = (child: Node): Node => {
    const { lineHeight } = this.props;

    if (!isElement(child)) {
      return child;
    }

    if (isElementComponent(child, Style)) {
      return child.withProps({
        children: child.props.children!.map(this.renderChild)
      });
    } else {
      return child.withProps({
        at: new Point(0, 0),
        size:
          child.props.size ||
          new Size((component: Component | null) => {
            if (
              isAspectRatioAware(component) &&
              component.shouldMaintainAspectRatio()
            ) {
              const w = component!.getNaturalWidth();
              const h = component!.getNaturalHeight();
              return w * (lineHeight! / h);
            }

            return component!.getNaturalWidth();
          }, lineHeight!)
      });
    }
  };

  render() {
    return (this.props.children || []).map(this.renderChild);
  }

  componentDidUpdate() {
    const { w } = this.props.size!.resolve();

    if (w <= 0) {
      return;
    }

    const wrapped = wrap(
      this.children,
      this.props.font!,
      w,
      this.props.lineHeight!
    );

    this.wrapped = wrapped;

    super.componentDidUpdate();
  }

  componentDidReposition() {
    const { w } = this.props.size!.resolve();

    if (w <= 0) {
      return;
    }

    const wrapped = wrap(
      this.children,
      this.props.font!,
      w,
      this.props.lineHeight!
    );

    this.wrapped = wrapped;

    this.drawSurface();
  }

  drawSurface() {
    if (!this.props.size || !this.wrapped) {
      return;
    }

    const { w, h } = this.props.size.resolve();
    const surface = this.prepareSurface(w, h);

    for (const line of this.wrapped) {
      for (const element of line.elements) {
        if (isComponent(element.node)) {
          (element.node.props as PositionProps).at!.replaceWith(
            element.at.inherit().addY(offset(element, line.lineHeight))
          );

          element.node.reposition();

          element.node.draw(surface);
        } else {
          const { x, y } = element.at
            .inherit()
            .addY(offset(element, line.lineHeight))
            .resolve();
          const prevOp = surface.blendOp;
          surface.blendOp = BlendOp.Add;
          (element.style.font || this.props.font)!.drawText(
            surface,
            x,
            y + (element.style.yOffset || 0),
            element.node,
            element.style.fontColor || Color.White
          );
          surface.blendOp = prevOp;
        }
      }
    }

    if (this._shouldScheduleSurfaceHostDraw) {
      if (
        !this.repositioning &&
        this._kinetic.hasRootComponent() &&
        !this._kinetic.isRootComponent(this)
      ) {
        this._kinetic.scheduleDraw(this.getSurfaceHost()!);
      }
    }
  }

  getNaturalHeight() {
    return this.wrapped
      ? this.wrapped.reduce((height, line) => height + line.lineHeight, 0)
      : 0;
  }
}

function offset(element: WrappedElement, height: number) {
  switch (element.style.verticalAlign) {
    case 'top':
      return 0;
    case 'middle':
    default:
      return (height - element.size.h()) / 2;
    case 'bottom':
      return height - element.size.h();
  }

  return 0;
}
