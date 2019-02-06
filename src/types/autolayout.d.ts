declare module 'autolayout' {
  interface ViewOptions {
    spacing?: number;
    width?: number;
    height?: number;
  }

  interface Constraint {
    view1: string;
    attr1: Attribute;
    view2: string;
    attr2: Attribute;
    multiplier: number;
    constant: number;
    priority: number;
  }

  export enum Attribute {
    CONST = 'const',
    NOTANATTRIBUTE = 'const',
    VARIABLE = 'var',
    LEFT = 'left',
    RIGHT = 'right',
    TOP = 'top',
    BOTTOM = 'bottom',
    WIDTH = 'width',
    HEIGHT = 'height',
    CENTERX = 'centerx',
    CENTERY = 'centery',
    ZINDEX = 'zIndex'
  }

  export enum Priority {
    REQUIRED = 1000,
    DEFAULTHIGH = 750,
    DEFAULTLOW = 250
  }

  export enum Relation {
    LEQ = 'leq',
    EQU = 'equ',
    GEQ = 'geq'
  }

  export class View {
    readonly width: number;
    readonly height: number;
    readonly fittingWidth: number;
    readonly fittingHeight: number;
    readonly subViews: { [name: string]: SubView };

    constructor(options?: ViewOptions);

    setSize(width: number, height: number): this;
    setSpacing(spacing: number | number[]): this;
    addConstraint(constraint: Constraint): this;
    addConstraints(constraints: Constraint[]): this;
  }

  export class SubView {
    readonly name: string;
    readonly left: number;
    readonly right: number;
    readonly top: number;
    readonly bottom: number;
    readonly width: number;
    readonly height: number;
    readonly centerX: number;
    readonly centerY: number;
    readonly zIndex: number;
    readonly type: string;

    intrinsicWidth: number;
    intrinsicHeight: number;

    toJSON(): {
      name: string;
      left: number;
      top: number;
      width: number;
      height: number;
    };
    toString(): string;

    getValue(attr: Attribute): number | void;
  }

  export class VisualFormat {
    static parseLine(
      visualFormat: string,
      options?: { extended?: boolean; lineIndex?: number }
    ): Constraint[];
    static parse(
      visualFormat: string[] | string,
      options?: {
        extended?: boolean;
        strict?: boolean;
        lineSeparator?: string;
      }
    ): Constraint[];
  }
}
