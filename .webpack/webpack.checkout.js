const { join } = require('path');
const { merge } = require('webpack-merge');
const CsvMappingPlugin = require('./webpack.map'); // Include the CsvMappingPlugin

const base = require('./webpack.base');
const plugins = require('./plugins');

module.exports = merge(base('checkout'), {
    entry: {
        checkout: join(__dirname, '..', 'src', 'scripts-1r', 'checkout.js'),
    },
    experiments: {
        topLevelAwait: true,
    },
    plugins: [
        plugins.clean([
            'assets/checkout*',
            'snippets/script-tags.checkout.liquid',
            'snippets/style-tags.checkout.liquid',
        ]),
        plugins.cssExtract('checkout'),
        plugins.scriptTags('checkout'),
        plugins.styleTags('checkout'),
        new CsvMappingPlugin({ outputFile: 'file-mapping.csv' }), // Add the CsvMappingPlugin
    ],
    resolve: {
        alias: {
            '@': join(__dirname, '..', 'src', 'scripts-1r'),
        },
    },
});