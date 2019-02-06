module.exports = {
  plugins: [
    [
      '@babel/proposal-object-rest-spread',
      {
        useBuiltIns: true
      }
    ],
    ['@babel/plugin-syntax-dynamic-import']
  ],
  presets: [['@babel/env', { targets: { edge: '44' } }]]
};
