import parse from 'parse-bmfont-ascii';
import { IFont } from 'kinetic';

interface CharDef {
  chnl: number;
  height: number;
  id: number;
  page: number;
  width: number;
  x: number;
  y: number;
  xoffset: number;
  yoffset: number;
  xadvance: number;
}

interface Character {
  id: number;
  atlas: Texture;
  xadvance: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: Shape;
  xoffset: number;
  yoffset: number;
}

function createTriStripList(
  w: number,
  h: number,
  x: number,
  y: number,
  mask: Color = Color.White
) {
  return new VertexList([
    { x: 0, y: 0, u: x, v: 1 - y, color: mask },
    { x: 1, y: 0, u: x + w, v: 1 - y, color: mask },
    { x: 0, y: 1, u: x, v: 1 - (y + h), color: mask },
    { x: 1, y: 1, u: x + w, v: 1 - (y + h), color: mask }
  ]);
}

function createShape(
  texture: Texture,
  w: number,
  h: number,
  x: number,
  y: number,
  mask: Color = Color.White
) {
  return new Shape(
    ShapeType.TriStrip,
    texture,
    createTriStripList(
      w / texture.width,
      h / texture.height,
      x / texture.width,
      y / texture.height,
      // w,
      // h,
      // x / w,
      // y / h,
      mask
    )
  );
}

export default class BMF implements IFont {
  path: string;
  data: any = null;

  pages: Texture[];
  chars: { [key: string]: Character } = {};
  height: number;
  base: number;

  constructor(path: string) {
    this.path = path;
    const dir = FS.directoryOf(path);

    const data = parse(FS.readFile(path));
    this.pages = data.pages.map(page => new Texture(dir + '/' + page));
    this.height = Number(data.common.lineHeight);
    this.base = Number(data.common.base);
    this.chars = data.chars
      .map((char: CharDef) => {
        return {
          id: char.id,
          atlas: this.pages[char.page],
          xadvance: char.xadvance,
          x: char.x,
          y: char.y,
          width: char.width,
          height: char.height,
          xoffset: char.xoffset,
          yoffset: char.yoffset,
          shape: createShape(
            this.pages[char.page],
            char.width,
            char.height,
            char.x,
            char.y
          )
        } as Character;
      })
      .reduce((res: { [key: string]: Character }, char: Character) => {
        res[char.id] = char;
        return res;
      }, {});

    this.chars[0x20] = {
      ...this.chars['m'.charCodeAt(0)],
      id: 0x20,
      xadvance: this.chars[10].xadvance
    };
  }

  drawText(
    surface: Surface,
    x: number,
    y: number,
    text: string,
    color?: Color,
    wrap_width?: number
  ): void {
    let currentX = x;
    let currentY = y;
    const transform = new Transform();

    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);

      if (charCode === 10) {
        currentX = x;
        currentY += this.height;
        continue;
      }

      const char = this.chars[charCode];

      if (!char) {
        continue;
      }

      if (char.id >= 33) {
        transform.identity();
        transform.scale(char.width, char.height);
        transform.translate(
          currentX + char.xoffset,
          currentY + char.yoffset + this.height / this.base
        );

        char.shape.draw(surface, transform);
      }

      currentX += char.xadvance;
      if (wrap_width && currentX >= wrap_width + x) {
        currentX = x;
        currentY += this.height;
      }
    }
  }

  getTextSize(text: string, wrap?: number) {
    let currentX = 0;
    let currentY = 0;
    let maxX = 0;

    for (let i = 0; i < text.length; i++) {
      let charCode = text.charCodeAt(i);

      if (charCode === 10) {
        maxX = Math.max(currentX, maxX);
        currentX = 0;
        currentY += this.height;
        continue;
      }

      const char = this.chars[charCode];

      if (!char) {
        continue;
      }

      currentX += char.xadvance;
      if (wrap && currentX >= wrap) {
        maxX = Math.max(currentX, maxX);
        currentX = 0;
        currentY += this.height;
      }
    }
    return { width: Math.max(currentX, maxX), height: currentY + this.height };
  }
}
