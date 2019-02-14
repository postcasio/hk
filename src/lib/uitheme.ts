function c(r: number, g: number, b: number, a: number = 1) {
  return new Color(r, g, b, a);
}

export default {
  colors: {
    cores: {
      red: c(1, 0.4, 0.5)
    }
  },

  controls: {
    window: {
      background: c(0, 0, 0, 0.2)
    }
  }
};
