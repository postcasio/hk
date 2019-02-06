import pluginNodeResolve from 'rollup-plugin-node-resolve';
import pluginCommonJs from 'rollup-plugin-commonjs';
import pluginBabel from 'rollup-plugin-babel';

export default {
  input: 'build/main/index.js',
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
  ]
};
