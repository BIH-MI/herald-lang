#!/bin/bash

echo "Installing Webpack and dependencies"
npm install --save-dev webpack webpack-cli
npm install --save-dev html-loader css-loader style-loader html-webpack-plugin mini-css-extract-plugin

echo "Preparing distribution folder"
if [ -d "dist" ]; then
  rm -r "dist"
fi
mkdir dist

echo "Bundling GHDM Data"
cd ./ghdm-data/
npx webpack
echo "Copying to dist folder"
cp dist/* ../dist/
rm -r ./dist

echo "Bundling GHDM UI"
cd ../ghdm-ui/
npx webpack
echo "Copying to dist folder"
cp dist/* ../dist/
rm -r ./dist

echo "Bundling HERALD Core"
cd ../herald-core/
npx webpack
echo "Copying to dist folder"
cp dist/* ../dist/
rm -r ./dist

echo "Bundling HERALD UI"
cd ../herald-ui/
npx webpack
echo "Copying to dist folder"
cp dist/* ../dist/
rm -r ./dist

echo "Done."
