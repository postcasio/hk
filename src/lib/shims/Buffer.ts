//@ts-ignore
global.Buffer = class Buffer {
  static isBuffer() {
    return false;
  }
};
