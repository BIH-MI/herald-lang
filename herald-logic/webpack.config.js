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
    path: path.resolve(__dirname, 'dist'),  // adjust the path if necessary
    filename: `${pkg.name}.js`,
    library: 'herald-logic',   // this will expose the bundled export under the name 'ghdm'
    libraryTarget: 'window' // this will make it a variable in global window scope
  },
  mode: 'none',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUNDLED': "true",
    })
  ],
};

