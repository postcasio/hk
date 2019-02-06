import Kinetic, { Node, Component, Point, Size } from 'kinetic';
import { ComponentClass } from 'kinetic/build/module/lib/Component';
import { isBindable } from 'kinetic/build/module/lib/Bindable';
import lodash from 'lodash';
import { isComparable } from './Comparable';

export type Easing = (t: number) => number;

export interface AnimateProps<T> {
  animateProps?: { [P in keyof T]: [Easing, number] };
  children?: Array<Node>;
}

export interface AnimateState<T> {
  lastProps: { [P in keyof T]: T[P] } | null;
  nextProps: { [P in keyof T]: T[P] } | null;
  startTime: number;
}

class AnimatedInner<P> extends Component<
  P & AnimateProps<P>,
  AnimateState<P>
> {}

export default function animate<P extends {}, S extends {}>(
  wrappedComponent: ComponentClass<P, S>
): ComponentClass<P & AnimateProps<P>, AnimateState<P>> {
  return class Animated extends AnimatedInner<P> {
    static defaultProps: P & AnimateProps<P> = Object.assign(
      {},
      wrappedComponent.defaultProps
    ) as P & AnimateProps<P>;

    getInitialState() {
      return {
        lastProps: null,
        nextProps: null,
        startTime: 0
      };
    }

    getDerivedStateFromProps(newProps: P & AnimateProps<P>) {
      return {
        lastProps: lodash(this.props)
          .omit(['animateProps', 'children'])
          .value() as P & AnimateProps<P>,
        nextProps: lodash(newProps)
          .omit(['animateProps', 'children'])
          .mapValues(v => {
            if (v instanceof Point || v instanceof Size) {
              return v.copy();
            }

            return v;
          })
          .value() as P & AnimateProps<P>
      };
    }

    __kinetic_animate: boolean = true;

    render(): Node {
      return Kinetic.createElement(
        wrappedComponent,
        (lodash(this.props)
          .omit(['animateProps', 'children'])
          .mapValues(value => {
            if (isBindable(value)) {
              return value.inherit();
            }
            return value;
          })
          .value() as unknown) as P,
        ...(this.props.children || [])
      );
    }

    draw(target: Surface) {
      const { lastProps, nextProps } = this.state;

      const newAnimations: any = {};

      if (nextProps && lastProps) {
        for (const key in nextProps) {
          const value = lastProps[key];
          const nextValue = (nextProps as any)[key];

          if (
            isComparable(value) &&
            nextValue &&
            value.constructor === nextValue.constructor
          ) {
            if (value.compare(nextValue) !== 0) {
              newAnimations[key] = {};
            }
          }
        }
      }

      this.components[0].draw(target);
    }
  };
}

export function isAnimated(component: any): component is AnimatedInner<any> {
  return component && component.__kinetic_animate === true;
}

export type AnimatedComponent = AnimatedInner<any>;
