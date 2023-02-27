const { merge } = require("webpack-merge");
const commonConfiguration = require("./webpack.common.js");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const path = require("path");

module.exports = merge(
  commonConfiguration,
  {
    mode: "production",
    plugins:
      [
        new HtmlWebpackPlugin({
          template: path.resolve(__dirname, "../src/index.html"),
          ogImage: `https://cheetolay-web.vercel.app/${path.resolve(__dirname, "../src/favicon/fav-512.png")}`
        }),
        new CleanWebpackPlugin(),
      ]
  }
);
