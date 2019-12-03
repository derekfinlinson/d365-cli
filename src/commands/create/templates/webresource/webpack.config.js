const WebpackEventPlugin = require("webpack-event-plugin");
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const spawn = require('cross-spawn');
const config = require("./config.json");
const path = require("path");

module.exports = function (env) {
  let webpackConfig = {
    entry: config.entries,

    output: {
      filename: "scripts/[name].js",
      library: ["<%= namespace %>", "[name]"],
      path: path.resolve(__dirname, "dist")
    },

    resolve: {
      extensions: [".ts", ".tsx", ".js", ".jsx"]
    },

    module: {
      rules: [
        {
          test: /\.ts(x?)$/,
          exclude: /node_modules/,
          use: ["babel-loader", "ts-loader"]
        },
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: ["babel-loader"]
        },
        {
          enforce: "pre",
          test: /\.(ts)|(js)$/,
          loader: "source-map-loader"
        }
      ]
    },

    plugins: [
      new CleanWebpackPlugin(),
      new CopyWebpackPlugin([
        {
          context: "./src",
          from: "**/*.html"
        }
      ]),
      new WebpackEventPlugin([
        {
          hook: "afterEmit",
          callback: compilation => {
            if (compilation.errors != null && compilation.errors.length > 0) {
              return;
            } else {
              const assets = Object.keys(compilation.assets)
                .filter(asset => compilation.assets[asset].emitted)
                .map(asset => path.basename(asset));

              spawn('d365', ['deploy', 'webresource', assets.join(',')], { cwd: process.cwd(), stdio: 'inherit' });
            }
          }
        }
      ])
    ]
  };

  if (env.prod) {
    webpackConfig.mode = "production";
  } else {
    webpackConfig.mode = "development";
    webpackConfig.watch = true;
    webpackConfig.devtool = "eval-source-map";
  }

  return webpackConfig;
};
