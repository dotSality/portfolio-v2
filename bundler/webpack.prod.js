const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = merge(
  commonConfiguration,
  {
    mode: "production",
    plugins:
      [
        new HtmlWebpackPlugin({
          template: "index.html",
        }),
        new CleanWebpackPlugin(),
      ]
  }
);
