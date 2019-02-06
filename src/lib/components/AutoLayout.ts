import '../shims/cassowary';

import {
  Component,
  PositionProps,
  SizeProps,
  Node,
  isElement,
  Point,
  Size
} from 'kinetic';
import AutoLayoutJs from 'autolayout';
import Kinetic from 'kinetic';
import { ComponentClass } from 'kinetic/build/module/lib/Component';
import lodash from 'lodash';

const View: typeof AutoLayoutJs.View = AutoLayoutJs.View;
const VisualFormat: typeof AutoLayoutJs.VisualFormat =
  AutoLayoutJs.VisualFormat;

export interface AutoLayoutProps extends PositionProps, SizeProps {
  spacing?: number;
  children?: Node[];
  constraints: string[];
}

export default class AutoLayout extends Component<AutoLayoutProps> {
  superview: AutoLayoutJs.View;

  static defaultProps = {
    spacing: 8
  };

  constructor(props: AutoLayoutProps) {
    super(props);

    this.superview = new View();
  }

  componentDidUpdate() {
    this.superview.setSpacing(this.props.spacing!);
    this.superview.addConstraints(
      VisualFormat.parse(this.props.constraints, { extended: true })
    );
  }

  render() {
    return (this.props.children || []).map(child =>
      isElement(child)
        ? child.withProps({
            at: child.props.at ? child.props.at : Point.zero,
            size: child.props.size
              ? child.props.size
              : new Size(Size.AUTO, Size.AUTO)
          })
        : child
    );
  }

  draw(target: Surface) {
    SSj.log('AutoLayout is drawing');

    for (const child of this.components) {
      if (isSubview(child)) {
        const subviewProps: SubviewProps = child.props as SubviewProps;
        const name = subviewProps.name;

        if (name) {
          const subview = this.superview.subViews[name];

          if (!subview) {
            continue;
          }

          if (subviewProps.autoWidth) {
            subview.intrinsicWidth = child.getNaturalWidth();
          }
          if (subviewProps.autoHeight) {
            subview.intrinsicHeight = child.getNaturalHeight();
            SSj.log(`setting intrinsic height to ${child.getNaturalHeight()}`);
          }
        }
      }
    }

    this.superview.setSize(this.props.size!.w(), this.props.size!.h());

    for (const child of this.components) {
      if (isSubview(child)) {
        const subviewProps: SubviewProps = child.props as SubviewProps;
        const name = subviewProps.name;

        if (name) {
          const subview = this.superview.subViews[name];
          (child.props as PositionProps).at!.replaceWith(
            new Point(subview.left, subview.top)
          );
          (child.props as SizeProps).size!.replaceWith(
            new Size(subview.width, subview.height)
          );

          child.reposition();
        }
      }

      child.draw(target);
    }
  }
}

export interface SubviewProps extends PositionProps, SizeProps {
  constrain?: string;
  children?: Array<Node>;
  name: string;
  autoHeight?: boolean;
  autoWidth?: boolean;
}

export interface SubviewState {}

class SubviewInner<P, S> extends Component<P & SubviewProps, S> {}

export function subview<P extends {}, S extends {}>(
  wrappedComponent: ComponentClass<P, S>
): ComponentClass<P & SubviewProps, SubviewState> {
  return class Subview extends SubviewInner<P, S> {
    static defaultProps: P & SubviewProps = Object.assign(
      {},
      wrappedComponent.defaultProps
    ) as P & SubviewProps;

    __kinetic_subview: boolean = true;

    render(): Node {
      return Kinetic.createElement(
        wrappedComponent,
        {
          ...(lodash.omit(this.props, [
            'constrain',
            'children',
            'name',
            'at',
            'size'
          ]) as any),
          at: this.props.at!.inherit(),
          size: this.props.size!.inherit()
        },
        ...(this.props.children || [])
      );
    }
  };
}

export function isSubview(component: any): component is SubviewInner<any, any> {
  return component && component.__kinetic_subview === true;
}
