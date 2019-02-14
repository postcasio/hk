declare module 'parse-bmfont-ascii' {
  export default function parse(
    data: string
  ): {
    pages: string[];
    chars: {
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
    }[];
    info: any;
    common: any;
    kernings: any;
  };
}
