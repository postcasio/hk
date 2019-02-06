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
  isElementComponent
} from 'kinetic';
import { Nullable } from 'kinetic/build/main/lib/types';
import Style from './Style';
import {
  isComponentClass,
  isComponent
} from 'kinetic/build/module/lib/Component';
import wrap, { WrappedLine, WrappedElement } from '../wrap';

interface FlowProps extends PositionProps, SizeProps, RefProps<Flow> {
  children?: Array<Node>;
  lineHeight?: number;
  font?: Font;
}

export default class Flow extends SurfaceHost<FlowProps> {
  static defaultProps = {
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
      SSj.log('encountered style');
      return child.withProps({
        children: child.props.children!.map(this.renderChild)
      });
    } else {
      SSj.log(
        `encountered ${isComponentClass(child.component) &&
          child.component.name}`
      );
      return child.withProps({
        at: new Point(0, 0),
        size:
          child.props.size ||
          new Size((component: Nullable<Component>) => {
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

    SSj.log('Recalculating flow at width: ' + w);
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

    SSj.log('Repositioning flow at width: ' + w);

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

    SSj.log(
      `Rendering a Flow of ${this.wrapped.length} lines on a ${w}x${h} surface`
    );

    for (const line of this.wrapped) {
      SSj.log(
        `Line of ${line.elements.length} elements, height ${line.lineHeight}`
      );

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

          this.props.font!.drawText(
            surface,
            x,
            y,
            element.node,
            element.style.fontColor || Color.White
          );
        }
      }
    }

    if (
      !this.repositioning &&
      this._kinetic.hasRootComponent() &&
      !this._kinetic.isRootComponent(this)
    ) {
      this._kinetic.scheduleDraw(this.getSurfaceHost()!);
    }
  }

  getNaturalHeight() {
    SSj.log('Getting natural height of a Flow');
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
