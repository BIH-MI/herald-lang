const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');

module.exports = {
  module: {
      rules: [
        {
          test: /\.css$/,
          use: [MiniCssExtractPlugin.loader, 'css-loader'],
        }
      ]
  },
  entry: [
      "./ghdm-ui-generic.js",
      "./ghdm-ui-modals.js",
      "./ghdm-styles.css"
  ],
  output: {
    // We might be able to change this in a way to place the generated fie directly into the folder, where the file is needed.
    path: path.resolve(__dirname, 'dist'),
    filename: `${pkg.name}.js`,
    library: 'ghdm-ui',   // This will expose the bundled export under the name 'ghdm'
    libraryTarget: 'window' // This will make it a variable in global window scope
  },
  mode: 'none',
  plugins: [
    new MiniCssExtractPlugin({
      filename: `${pkg.name}.css`
    }),
    new webpack.DefinePlugin({
      'process.env.BUNDLED': "true",
    })
  ],
};

