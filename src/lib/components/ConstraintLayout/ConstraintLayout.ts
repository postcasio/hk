import {
  Component,
  PositionProps,
  SizeProps,
  Point,
  Size,
  Node,
  isElement
} from 'kinetic';
import { Solver, Variable, Strength, Operator } from 'kiwi.js';
import { isSubview, SubviewProps } from './Subview/Subview';
import { SubviewLayout } from './Subview';
import {
  SuperviewLayout,
  ConstraintCallback,
  LayoutConstraint
} from './Subview/SubviewLayout';

const varNames = ['x', 'y', 'w', 'h', 'r', 'b', 'cx', 'cy'];

export interface ConstraintLayoutProps extends PositionProps, SizeProps {
  children?: Node[];
}

export interface ConstraintLayoutState {}

export type AddConstraintCallback = (constraint: LayoutConstraint) => void;

interface Subview {
  variables: { [name: string]: Variable };
  constraintInitializer: ConstraintCallback | void;
  component: Component;
  layout: SubviewLayout;
  name: string;
}

export default class ConstraintLayout extends Component<
  ConstraintLayoutProps,
  ConstraintLayoutState
> {
  solver: Solver;

  subviews: Map<string, Subview> = new Map();
  superview: SuperviewLayout;
  superVariables: { [name: string]: Variable };
  superviewInitialized: boolean = false;

  constructor(props: ConstraintLayoutProps) {
    super(props);

    this.solver = new Solver();
    this.superVariables = {};
    this.superview = new SuperviewLayout(this, this.superVariables);
  }

  componentDidMount() {}

  draw(surface: Surface) {
    if (!this.superviewInitialized) {
      this.initializeSuperVariables();
      this.superviewInitialized = true;
    }

    this.updateVariables();

    for (const [name, subview] of this.subviews) {
      const props = subview.component.props as PositionProps & SizeProps;

      props.at!.replaceWith(
        new Point(
          subview.variables[`${name}__x`].value(),
          subview.variables[`${name}__y`].value()
        )
      );
      props.size!.replaceWith(
        new Size(
          subview.variables[`${name}__w`].value(),
          subview.variables[`${name}__h`].value()
        )
      );

      SSj.log(
        `Superview is ${this.superVariables.super__w.value()}x${this.superVariables.super__h.value()}@${this.superVariables.super__x.value()},${this.superVariables.super__y.value()} [${this.superVariables.super__cx.value()},${this.superVariables.super__cy.value()}]`
      );

      SSj.log(
        subview.component.constructor.name +
          `${(props as any).name} is ` +
          props.size!.w() +
          'x' +
          props.size!.h() +
          '@' +
          props.at!.x() +
          ',' +
          props.at!.y()
      );
    }

    Component.prototype.draw.call(this, surface);
  }

  getSubview(name: string) {
    const subview = this.subviews.get(name);

    return subview && subview.layout;
  }

  getSuperview() {
    return this.superview;
  }

  initializeSuperVariables() {
    SSj.log('Initializing super variables');

    const vars = this.superVariables;

    for (const varName of varNames) {
      const varKey = `super__${varName}`;

      if (!vars[varKey]) {
        vars[varKey] = new Variable();

        this.solver.addEditVariable(vars[varKey], Strength.strong);
      }
    }

    this.solver.createConstraint(
      vars.super__r,
      Operator.Eq,
      vars.super__x.plus(vars.super__w),
      Strength.required
    );
    this.solver.createConstraint(
      vars.super__b,
      Operator.Eq,
      vars.super__y.plus(vars.super__h),
      Strength.required
    );
    this.solver.createConstraint(
      vars.super__cx,
      Operator.Eq,
      vars.super__w.divide(2).plus(vars.super__x),
      Strength.required
    );
    this.solver.createConstraint(
      vars.super__cy,
      Operator.Eq,
      vars.super__h.divide(2).plus(vars.super__y),
      Strength.required
    );
  }

  updateVariables() {
    const subviewsToInitialize: Array<Subview> = [];

    for (const child of this.components) {
      if (isSubview(child)) {
        const name = (child.props as SubviewProps).name;
        const variables = {};
        const subview: Subview = this.subviews.get(name) || {
          variables,
          constraintInitializer: (child.props as SubviewProps).constrain,
          layout: new SubviewLayout(this, name, variables),
          component: child,
          name
        };

        subview.component = child;

        for (const varName of varNames) {
          const varKey = `${name}__${varName}`;

          if (!subview.variables[varKey]) {
            subview.variables[varKey] = new Variable();

            this.solver.addEditVariable(
              subview.variables[varKey],
              Strength.weak
            );
          }
        }

        if (!this.subviews.has(name)) {
          this.subviews.set(name, subview);
          subviewsToInitialize.push(subview);
        }
      }
    }

    subviewsToInitialize.map(this.initializeConstraints.bind(this));

    for (const [name, subview] of this.subviews) {
      const props = subview.component.props as PositionProps & SizeProps;
      if (props.at) {
        this.solver.suggestValue(subview.variables[`${name}__x`], props.at.x());
        this.solver.suggestValue(subview.variables[`${name}__y`], props.at.y());
      }
      if (props.size) {
        this.solver.suggestValue(
          subview.variables[`${name}__w`],
          props.size.w()
        );
        this.solver.suggestValue(
          subview.variables[`${name}__h`],
          props.size.h()
        );
      }
    }

    const superVars = this.superVariables;

    this.solver.suggestValue(superVars.super__x, this.props.at!.x());
    this.solver.suggestValue(superVars.super__y, this.props.at!.y());
    this.solver.suggestValue(superVars.super__w, this.props.size!.w());
    this.solver.suggestValue(superVars.super__h, this.props.size!.h());

    this.solver.updateVariables();
  }

  initializeConstraints(subview: Subview) {
    const vars = subview.variables;

    const w = vars[`${subview.name}__w`];
    const h = vars[`${subview.name}__h`];
    const x = vars[`${subview.name}__x`];
    const y = vars[`${subview.name}__y`];

    this.solver.createConstraint(
      vars[`${subview.name}__r`],
      Operator.Eq,
      x.plus(w),
      Strength.weak
    );
    this.solver.createConstraint(
      vars[`${subview.name}__b`],
      Operator.Eq,
      y.plus(h),
      Strength.weak
    );
    this.solver.createConstraint(
      vars[`${subview.name}__cx`],
      Operator.Eq,
      w.divide(2).plus(x),
      Strength.weak
    );
    this.solver.createConstraint(
      vars[`${subview.name}__cy`],
      Operator.Eq,
      h.divide(2).plus(y),
      Strength.weak
    );

    if (!subview.constraintInitializer) {
      return;
    }

    subview.constraintInitializer.call(
      subview.layout,
      (constraint: LayoutConstraint) => {
        this.solver.addConstraint(constraint.getConstraint());
      }
    );
  }

  render() {
    return (this.props.children || []).map(child =>
      isElement(child)
        ? child.withProps({
            at: child.props.at || Point.zero,
            size: child.props.size || new Size(Size.AUTO, Size.AUTO)
          })
        : child
    );
  }
}
