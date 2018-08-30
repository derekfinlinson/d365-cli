const WebpackEventPlugin = require('webpack-event-plugin');
const webResource = require('node-webresource');
const creds = require('./creds.json');
const config = require('./config.json');
const path = require('path');

module.exports = function (env) {
    let webpackConfig = {
        entry: config.entries,

        output: {
            filename: 'js/[name].js',
            library: [ '<%= namespace %>', '[name]'],
            path: path.resolve(__dirname, 'dist')
        },

        resolve: { extensions: ['.ts', '.tsx', '.js', '.jsx'] },

        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    exclude: /(node_modules)/,
                    use: [ 'babel-loader', 'ts-loader' ]
                },
                {
                    enforce: 'pre',
                    test: /\.js$/,
                    use: ['source-map-loader']
                },
                {
                    enforce: 'pre',
                    test: /\.tsx?$/,
                    use: ['source-map-loader']
                },
                {
                    test: /\.jsx?$/,
                    exclude: /(node_modules)/,
                    use: 'babel-loader'
                }
            ]
        },

        plugins: [
            new WebpackEventPlugin([
                {
                    hook: 'after-emit',
                    callback: (compilation, callback) => {
                        if (compilation.errors != null && compilation.errors.length > 0) {
                            callback();
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
                            
                            const assets = Object.keys(compilation.assets).filter(asset => {
                                return compilation.assets[asset].emitted;
                            }).map(asset => {
                                return {
                                    path: './dist/' + asset,
                                    content: compilation.assets[asset].source().toString('utf8')
                                };
                            });

                            webResource.upload(uploadConfig, assets).then(() => {
                                callback();
                            }, (error) => {
                                throw new Error(error);
                            });
                        }
                    }
                }                
            ])
        ]
    }

    if (env === 'prod') {
        webpackConfig.mode = 'production';
    } else {
        webpackConfig.mode = 'development';
        webpackConfig.watch = true;
    }

    return webpackConfig;
}