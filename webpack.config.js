/* eslint-disable */
"use strict";

const path = require("path");
const webpack = require("webpack");
const DashboardPlugin = require("webpack-dashboard/plugin");

const plugins = [
  new webpack.NoErrorsPlugin(),
];

/* NOTE: `==` */
if (process.env.DASH == 1) {
  plugins.push(new DashboardPlugin());
}

module.exports = {
  entry: {
    main: [
      "bootstrap/dist/css/bootstrap.css",
      "./src/main.ts",
    ],
    frame: "./src/frame.ts",
  },
  output: {
    path: path.resolve(__dirname, "server"),
    filename: "[name].js",
  },
  module: {
    loaders: [{
      loaders: ["style-loader", "css-loader"],
      test: /\.css$/,
    }, {

      loaders: ["eslint-loader", "ts-loader"],
      test: /\.tsx?$/,
    }]
  },
  plugins,
  devtool: "source-map",
  resolve: {
    extensions: ["", ".ts", ".tsx", ".js"],
  },
  eslint: {
    emitError: false,
  },
};
