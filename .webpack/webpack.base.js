const { join } = require('path');
const CssMinimizerWebpackPlugin = require('css-minimizer-webpack-plugin');
const plugins = require('./plugins');
const rules = require('./rules');
const LogAssetsPlugin = require('./LogAssetsPlugin');
const CombinedCsvMappingPlugin = require('./plugins/CombinedCsvMappingPlugin');  // Add this line

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'development';
const PRODUCTION = process.env.NODE_ENV === 'production';

/**
 * @param {string} [entryName]
 * @returns {import('webpack').Configuration}
 **/
module.exports = (entryName) => ({
    devtool: PRODUCTION ? 'source-map' : 'eval-source-map',
    externals: {
        'jquery': 'jQuery',
    },
    mode: process.env.NODE_ENV,
    module: {
        rules: [
            rules.asset,
            rules.html,
            rules.js,
            rules.jsx,
            rules.scss,
        ],
    },
    optimization: {
        mergeDuplicateChunks: false,
        minimizer: [
            '...',
            new CssMinimizerWebpackPlugin(),
        ],
        splitChunks: {
            automaticNameDelimiter: '--',
            cacheGroups: {
                default: {
                    minChunks: Infinity,
                },
            },
        },
    },
    output: {
        assetModuleFilename: `assets/${entryName}.[contenthash][ext]`,
        chunkFilename: `assets/${entryName}.[contenthash].js`,
        filename: `assets/${entryName}.js`,
        path: join(__dirname, '..', 'dist'),
    },
    plugins: [
        plugins.env(),
        plugins.progress(),
        new LogAssetsPlugin({
            outputDir: join(__dirname, '..', 'dist')
        }),
        new CombinedCsvMappingPlugin({  // Add this plugin
            outputDir: join(__dirname, '..', 'mappings')
        }),
    ],
    resolve: {
        extensions: ['.html', '.js', '.jsx', '.scss'],
    },
    target: 'web',
    watchOptions: {
        ignored: /node_modules/,
    },
});
