import { Variable, Constraint, Operator, Expression, Strength } from 'kiwi.js';
import ConstraintLayout from '../ConstraintLayout';

export type ConstraintCallback = (
  this: SubviewLayout,
  constrain: (constraint: LayoutConstraint) => void
) => void;

type LayoutValue = LayoutVariableReference | LayoutExpression | number;

type Layout = SubviewLayout | SuperviewLayout;

export class LayoutConstraint {
  private left: LayoutValue;
  private right: LayoutValue;
  private op: Operator;

  constructor(left: LayoutValue, op: Operator, right: LayoutValue) {
    this.left = left;
    this.right = right;
    this.op = op;
  }

  getConstraint() {
    return new Constraint(
      (this.left as { getValue: () => Expression | Variable }).getValue(),
      this.op,
      typeof this.right === 'number' ? this.right : this.right.getValue(),
      Strength.medium
    );
  }
}

class LayoutExpression {
  left: LayoutValue;
  right: LayoutValue;
  op: 'div' | 'mul' | 'add' | 'sub';

  constructor(
    left: LayoutValue,
    op: LayoutExpression['op'],
    right: LayoutValue
  ) {
    if ((op === 'div' || op === 'mul') && typeof right !== 'number') {
      throw new Error(
        'Right-hand side of a multiplication or division LayoutExpression must be a number'
      );
    }

    this.left = left;
    this.op = op;
    this.right = right;
  }

  getValue() {
    return this.getExpression();
  }

  getExpression(): Expression {
    if (typeof this.left === 'number') {
      throw new Error('Left-hand side of an expression cannot be a number');
    }

    const expr = new Expression(this.left.getValue());

    switch (this.op) {
      case 'div':
        return expr.divide(this.right as number);
      case 'mul':
        return expr.multiply(this.right as number);
      case 'add':
        return expr.plus(
          typeof this.right === 'number' ? this.right : this.right.getValue()
        );
      case 'sub':
        return expr.plus(
          typeof this.right === 'number' ? this.right : this.right.getValue()
        );
    }
  }
}

class LayoutVariableReference {
  private layout: Layout;
  private variable: string;

  constructor(layout: Layout, variable: string) {
    this.layout = layout;
    this.variable = variable;
  }

  div(other: LayoutValue) {
    return new LayoutExpression(this, 'div', other);
  }

  mul(other: LayoutValue) {
    return new LayoutExpression(this, 'mul', other);
  }

  add(other: LayoutValue) {
    return new LayoutExpression(this, 'add', other);
  }

  sub(other: LayoutValue) {
    return new LayoutExpression(this, 'sub', other);
  }

  eq(other: LayoutValue) {
    return new LayoutConstraint(this, Operator.Eq, other);
  }

  ge(other: LayoutValue) {
    return new LayoutConstraint(this, Operator.Ge, other);
  }

  le(other: LayoutValue) {
    return new LayoutConstraint(this, Operator.Le, other);
  }

  getValue(): Variable {
    return this.layout.findVariable(this.variable);
  }
}

export default class SubviewLayout {
  private layout: ConstraintLayout;
  private name: string;
  private variables: { [name: string]: Variable };

  constructor(
    layout: ConstraintLayout,
    name: string,
    variables: { [name: string]: Variable }
  ) {
    this.layout = layout;
    this.name = name;
    this.variables = variables;
  }

  get x() {
    return new LayoutVariableReference(this, 'x');
  }

  get y() {
    return new LayoutVariableReference(this, 'y');
  }

  get w() {
    return new LayoutVariableReference(this, 'w');
  }

  get h() {
    return new LayoutVariableReference(this, 'h');
  }

  get r() {
    return new LayoutVariableReference(this, 'r');
  }

  get b() {
    return new LayoutVariableReference(this, 'b');
  }

  get cx() {
    return new LayoutVariableReference(this, 'cx');
  }

  get cy() {
    return new LayoutVariableReference(this, 'cy');
  }

  get super() {
    return this.layout.getSuperview();
  }

  subview(name: string) {
    return this.layout.getSubview(name);
  }

  findVariable(name: string): Variable {
    const fullName = `${this.name}__${name}`;

    if (this.variables[fullName]) {
      return this.variables[fullName];
    }

    throw new Error(`Invalid variable name "${fullName}"`);
  }
}

export class SuperviewLayout {
  layout: ConstraintLayout;
  variables: { [name: string]: Variable };

  constructor(
    layout: ConstraintLayout,
    variables: { [name: string]: Variable }
  ) {
    this.layout = layout;
    this.variables = variables;
  }

  get x() {
    return new LayoutVariableReference(this, 'x');
  }

  get y() {
    return new LayoutVariableReference(this, 'y');
  }

  get w() {
    return new LayoutVariableReference(this, 'w');
  }

  get h() {
    return new LayoutVariableReference(this, 'h');
  }

  get r() {
    return new LayoutVariableReference(this, 'r');
  }

  get b() {
    return new LayoutVariableReference(this, 'b');
  }

  get cx() {
    return new LayoutVariableReference(this, 'cx');
  }

  get cy() {
    return new LayoutVariableReference(this, 'cy');
  }

  findVariable(name: string): Variable {
    const fullName = `super__${name}`;

    if (this.variables[fullName]) {
      return this.variables[fullName];
    }

    throw new Error(`Invalid variable name "${fullName}"`);
  }
}
