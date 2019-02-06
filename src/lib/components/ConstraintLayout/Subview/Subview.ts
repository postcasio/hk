import Kinetic, { Node, Component, PositionProps, SizeProps } from 'kinetic';
import lodash from 'lodash';
import { ComponentClass } from 'kinetic/build/module/lib/Component';
import { ConstraintCallback } from './SubviewLayout';

export interface SubviewProps extends PositionProps, SizeProps {
  constrain?: ConstraintCallback;
  children?: Array<Node>;
  name: string;
}

export interface SubviewState {}

class SubviewInner<P, S> extends Component<P & SubviewProps, S> {}

export default function subview<P extends {}, S extends {}>(
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

    draw(target: Surface) {
      for (const child of this.components) {
        child.draw(target);
      }
    }
  };
}

export function isSubview(component: any): component is SubviewInner<any, any> {
  return component && component.__kinetic_subview === true;
}
