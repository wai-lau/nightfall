const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");

const isProd = process.env.NODE_ENV === "production";
const staticPublicPath = isProd ? "/nightfall-game/static/" : "/static/";

// Fail build if campaign/netmap.baked.ts is stale relative to campaign/netmap.ts.
// Re-run via: node scripts/bakeNetmap.js
class NetmapBakeGuardPlugin {
  apply(compiler) {
    compiler.hooks.beforeCompile.tap("NetmapBakeGuardPlugin", () => {
      const srcPath = path.resolve(__dirname, "campaign/netmap.ts");
      const bakedPath = path.resolve(__dirname, "campaign/netmap.baked.ts");
      if (!fs.existsSync(bakedPath)) {
        throw new Error(
          "NetmapBakeGuard: campaign/netmap.baked.ts missing. " +
            "Run: node scripts/bakeNetmap.js"
        );
      }
      const srcHash = crypto
        .createHash("sha256")
        .update(fs.readFileSync(srcPath, "utf8"))
        .digest("hex")
        .slice(0, 16);
      const baked = fs.readFileSync(bakedPath, "utf8");
      const m = baked.match(/NETMAP_SOURCE_HASH\s*=\s*"([a-f0-9]+)"/);
      if (!m) {
        throw new Error(
          "NetmapBakeGuard: NETMAP_SOURCE_HASH missing in netmap.baked.ts. " +
            "Run: node scripts/bakeNetmap.js"
        );
      }
      if (m[1] !== srcHash) {
        throw new Error(
          `NetmapBakeGuard: stale bake. netmap.ts hash=${srcHash} but baked=${m[1]}. ` +
            "Run: node scripts/bakeNetmap.js"
        );
      }
    });
  }
}

module.exports = {
  entry: "./index.tsx",
  output: {
    path: path.resolve(__dirname, "../static"),
    filename: "js/bundle.js",
    publicPath: staticPublicPath,
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
        test: /\.(gltf|glb)$/,
        type: "asset/resource",
        generator: {
          filename: "media/[name].[contenthash:8][ext]",
          publicPath: staticPublicPath,
        },
      },
      {
        test: /\.(png|jpg|jpeg|gif|svg|ttf|woff|woff2|eot)$/,
        type: "asset/resource",
        generator: {
          filename: "media/[name].[contenthash:8][ext]",
          publicPath: staticPublicPath,
        },
      },
    ],
  },
  performance: {
    maxAssetSize: 2 * 1024 * 1024,
    maxEntrypointSize: 2 * 1024 * 1024,
  },
  ignoreWarnings: [{ module: /node_modules/ }],
  plugins: [
    new NetmapBakeGuardPlugin(),
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
