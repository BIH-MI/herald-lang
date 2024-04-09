const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');

module.exports = {
  entry: [
      "./ghdm-data-wrangling.js",
      "./ghdm-data-model.js",
      "./ghdm-loading.js"
  ],
  output: {
    // We might be able to change this in a way to place the generated fie directly into the folder, where the file is needed.
    path: path.resolve(__dirname, 'dist'),
    filename: `${pkg.name}.js`,
    library: 'ghdm',   // This will expose the bundled export under the name 'ghdm'
    libraryTarget: 'window' // This will make it a variable in global window scope
  },
  mode: 'none',
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BUNDLED': "true",
    })
  ],
};
