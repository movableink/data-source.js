module.exports = {
  babelrc: false,
  runtimeHelpers: true,
  extensions: ['.ts', '.js'],
  exclude: ['node_modules/**'],
  presets: [
    [
      '@babel/env',
      {
        modules: false
      }
    ],
    '@babel/typescript'
  ],
  plugins: [
    '@babel/external-helpers',
    ['@babel/proposal-class-properties', { loose: false }],
    ['@babel/transform-runtime', { corejs: 2 }]
  ]
};
