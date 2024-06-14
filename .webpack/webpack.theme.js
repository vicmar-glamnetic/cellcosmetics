const { join } = require('path');
const { merge } = require('webpack-merge');
const CsvMappingPlugin = require('./webpack.map'); // Include the CsvMappingPlugin

const base = require('./webpack.base');
const plugins = require('./plugins');

let config;
try {
    config = require('../config.json');
} catch (e) {
    console.log('config.json not found');
}

module.exports = merge(base('theme'), {
    entry: {
        theme: join(__dirname, '..', 'src', 'scripts-1r', 'index.js'),
    },
    experiments: {
        topLevelAwait: true,
    },
    plugins: [
        plugins.clean([
            'assets/theme*',
            'snippets/script-tags.theme.liquid',
            'snippets/style-tags.theme.liquid',
        ]),
        plugins.cssExtract('theme'),
        plugins.scriptTags('theme'),
        plugins.styleTags('theme'),
        // Only load ShopifyDevPlugin if config.json exists
        ...(config ? [new plugins.shopifyDev({
            store: config.store,
            password: config.password
        })] : []),
        new CsvMappingPlugin({ outputFile: 'file-mapping.csv' }), // Add the CsvMappingPlugin
    ],
    resolve: {
        alias: {
            '@': join(__dirname, '..', 'src', 'scripts-1r'),
        },
    },
});