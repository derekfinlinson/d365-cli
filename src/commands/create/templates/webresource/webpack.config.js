const WebpackEventPlugin = require("webpack-event-plugin");
const webResource = require("node-webresource");
const creds = require("./creds.json");
const config = require("./config.json");
const path = require("path");

module.exports = function(env) {
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
      new WebpackEventPlugin([
        {
          hook: "afterEmit",
          callback: compilation => {
            if (compilation.errors != null && compilation.errors.length > 0) {
              return;
            } else {
              const uploadConfig = {
                tenant: creds.tenant,
                server: creds.server,
                clientId: creds.clientId,
                clientSecret: creds.clientSecret,
                username: creds.username,
                password: creds.password,
                webResources: config.webResources,
                solution: creds.solution
              };

              const assets = Object.keys(compilation.assets)
                .filter(asset => {
                  return compilation.assets[asset].emitted;
                })
                .map(asset => {
                  return {
                    path: "./dist/" + asset,
                    content: compilation.assets[asset].source().toString("utf8")
                  };
                });

              webResource.upload(uploadConfig, assets).then(
                () => {
                  return;
                },
                error => {
                  console.log(error.message);
                }
              );
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
