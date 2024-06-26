const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');

module.exports = {
  entry: [
        "./herald-lexer.js",
        "./herald-grammar.js",
        "./herald-interpreter.js"
  ],
  output: {
    // We might be able to change this in a way to place the generated fie directly into the folder, where the file is needed.
    path: path.resolve(__dirname, 'dist'),
    filename: `${pkg.name}.js`,
    library: 'herald-core',
    libraryTarget: 'window'
  },
  mode: 'none',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUNDLED': "true",
    })
  ],
};

