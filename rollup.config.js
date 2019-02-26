import pluginNodeResolve from 'rollup-plugin-node-resolve';
import pluginCommonJs from 'rollup-plugin-commonjs';
import pluginBabel from 'rollup-plugin-babel';
import { terser as pluginTerser } from 'rollup-plugin-terser';

import glob from 'glob';

const cutscenes = glob.sync('build/main/cutscenes/**/*.js');
const input = {
  index: 'build/main/index.js',
  ...cutscenes.reduce(
    (res, fn) => ({
      ...res,
      [fn.replace(/^build\/main\//, '').replace(/\.js$/, '')]: fn
    }),
    {}
  )
};

export default {
  input,
  output: {
    dir: 'build/bundles',
    format: 'esm'
  },
  plugins: [
    pluginNodeResolve(),
    pluginCommonJs(),
    pluginBabel({
      // exclude: 'node_modules/**'
    })
    // pluginTerser()
  ]
};
