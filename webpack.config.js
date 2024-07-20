const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { InjectManifest } = require('workbox-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';

    const plugins = [
        new HtmlWebpackPlugin({
            template: './src/index.html',
        }),
        new webpack.HotModuleReplacementPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                { from: 'src/manifest.webmanifest', to: 'manifest.webmanifest' },
                { from: 'src/images/icons', to: 'images/icons' }
            ],
        }),
    ];

    if (isProduction) {
        plugins.push(
            new InjectManifest({
                swSrc: './src/service-worker.js',
                swDest: 'service-worker.js',
            })
        );
    } else {
        plugins.push(
            new InjectManifest({
                swSrc: './src/service-worker-dev.js',
                swDest: 'service-worker.js',
            })
        );
    }

    return {
        mode: isProduction ? 'production' : 'development',
        entry: './src/index.ts',
        devtool: isProduction ? 'source-map' : 'inline-source-map',
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: 'ts-loader',
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.js'],
        },
        output: {
            filename: 'bundle.js',
            path: path.resolve(__dirname, 'dist'),
            clean: true,
        },
        plugins: plugins,
        devServer: {
            static: path.resolve(__dirname, 'dist'),
            compress: true,
            port: 9000,
            hot: true,
            open: true,
            historyApiFallback: true,
            watchFiles: ['src/**/*'],
            client: {
                overlay: {
                    warnings: false,
                    errors: true,
                },
                logging: 'info',
                progress: true,
            },
            webSocketServer: 'ws',
        },
    };
};
