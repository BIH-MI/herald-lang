#!/bin/bash

echo "Installing Webpack and dependencies"
npm install --save-dev webpack webpack-cli
npm install --save-dev html-loader css-loader style-loader html-webpack-plugin mini-css-extract-plugin

echo "Bundling GHDM Data"
cd ./ghdm-data/
npx webpack

echo "Bundling GHDM UI"
cd ../ghdm-ui/
npx webpack

echo "Bundling HERALD Core"
cd ../herald-core/
npx webpack

echo "Bundling HERALD UI"
cd ../herald-ui/
npx webpack

echo "Done."
