const path = require("path");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./index.tsx",
  output: {
    path: path.resolve(__dirname, "../static"),
    filename: "js/bundle.js",
    publicPath: "/nightfall-game/static/",
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname, ".."),
      publicPath: "/",
    },
    port: 3000,
    open: false,
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: { loader: "ts-loader", options: { transpileOnly: true } },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, { loader: "css-loader", options: { url: false } }],
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ttf|woff|woff2|eot)$/,
        type: "asset/resource",
        generator: {
          filename: "media/[name].[contenthash:8][ext]",
          publicPath: "/nightfall-game/static/",
        },
      },
    ],
  },
  performance: {
    maxAssetSize: 512 * 1024,
    maxEntrypointSize: 512 * 1024,
  },
  plugins: [
    new webpack.DefinePlugin({
      AUDIO_BASE_URL: JSON.stringify(
        process.env.NODE_ENV === "production" ? "/nightfall-game/audio" : "/audio"
      ),
    }),
    new MiniCssExtractPlugin({
      filename: "css/bundle.css",
    }),
  ],
};
