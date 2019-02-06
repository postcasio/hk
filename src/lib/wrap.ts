import { Component, Size, SizeProps, Point, ComponentChild } from 'kinetic';
import Style, { StyleProps } from './components/Style';
import { isComponent } from 'kinetic/build/module/lib/Component';

export interface WrappedElement {
  node: Component | string;
  size: Size;
  style: StyleProps;
  at: Point;
}
export interface WrappedLine {
  elements: Array<WrappedElement>;
  lineHeight: number;
}

function newLine(lineHeight: number): WrappedLine {
  return {
    elements: [],
    lineHeight
  };
}

export interface StyledComponentChild {
  style: StyleProps;
  child: ComponentChild;
}

function flattenStyle(
  children: Array<ComponentChild>,
  style: StyleProps
): Array<StyledComponentChild> {
  let flat: Array<StyledComponentChild> = [];

  for (let child of children) {
    if (isComponent(child) && child instanceof Style) {
      flat = flat.concat(
        flattenStyle(child.children, { ...style, ...child.props })
      );
    } else {
      flat.push({ style, child });
    }
  }

  return flat;
}

export default function wrap(
  children: Array<ComponentChild>,
  font: Font,
  width: number,
  lineHeight: number,
  style: StyleProps = {}
): Array<WrappedLine> {
  const lines: Array<WrappedLine> = [];
  let currentLine: WrappedLine = newLine(lineHeight);
  let x = 0;
  let y = 0;

  let styled = [...flattenStyle(children, style)];

  function advance(size: Size) {
    currentLine.lineHeight = Math.max(currentLine.lineHeight, size.h());

    x += size.w();
  }

  function nextLine() {
    x = 0;
    y += currentLine.lineHeight;

    lines.push(currentLine);

    currentLine = newLine(lineHeight);
  }

  function wouldFit(size: Size) {
    if (x + size.w() > width) {
      return false;
    }

    return true;
  }

  for (let i = 0; i < styled.length; i++) {
    const { style, child } = styled[i];

    if (isComponent(child)) {
      const size = (child.props as SizeProps).size!;

      if (!wouldFit(size)) {
        nextLine();
      }

      currentLine.elements.push({
        node: child,
        size,
        style,
        at: new Point(x, y)
      });

      advance(size);
    } else {
      const text = String(child);
      const words = split(text);

      for (let word of words) {
        const textSize = font.getTextSize(word);
        const textSizeWithoutWhitespace = font.getTextSize(
          word.replace(/\s+$/, '')
        );

        const sizeWithoutWhitespace = new Size(
          textSizeWithoutWhitespace.width,
          textSizeWithoutWhitespace.height
        );

        if (!wouldFit(sizeWithoutWhitespace)) {
          nextLine();
        }

        const size = new Size(textSize.width, textSize.height);

        currentLine.elements.push({
          node: word.trim(),
          size,
          style,
          at: new Point(x, y)
        });

        advance(size);
      }
    }
  }

  if (currentLine.elements.length) {
    lines.push(currentLine);
  }

  return lines;
}

function split(text: string): Array<string> {
  const matches = text.match(/\S+(\s+)?/g);

  if (matches) {
    return Array.from(matches);
  }

  return [text];
}
