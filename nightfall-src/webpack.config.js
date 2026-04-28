const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
  entry: "./index.tsx",
  output: {
    path: path.resolve(__dirname, "../static"),
    filename: "js/bundle.js",
    publicPath: "/static/",
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
        test: /\.(mp3|wav)$/,
        use: "arraybuffer-loader",
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ttf|woff|woff2|eot)$/,
        use: [
          {
            loader: "file-loader",
            options: {
              name: "[name].[hash:8].[ext]",
              outputPath: "media/",
              publicPath: "/static/media/",
              esModule: false,
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: "css/bundle.css",
    }),
  ],
};
