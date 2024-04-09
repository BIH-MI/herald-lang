#!/bin/bash

echo "Installing Webpack and dependencies"
npm install --save-dev webpack webpack-cli
npm install --save-dev html-loader css-loader style-loader html-webpack-plugin mini-css-extract-plugin

echo "Bunding GHDM Data"
cd ./ghdm-data/
npx webpack

echo "Bunding GHDM UI"
cd ../ghdm-ui/
npx webpack

echo "Bunding Herald Core"
cd ../herald-core/
npx webpack

echo "Bunding Herald UI"
cd ../herald-ui/
npx webpack

echo "Done."
