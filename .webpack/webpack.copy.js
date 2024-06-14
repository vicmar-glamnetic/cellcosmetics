const { merge } = require('webpack-merge');
const CsvMappingPlugin = require('./webpack.map'); // Include the CsvMappingPlugin
const base = require('./webpack.base');
const plugins = require('./plugins');

module.exports = merge(base(), {
    entry: {},
    plugins: [
        plugins.clean([
            '**/*',
            '!assets',
            '!assets/theme*',
            '!snippets',
            '!snippets/script-tags.*.liquid',
            '!snippets/style-tags.*.liquid',
        ]),
        plugins.copy(),
        plugins.multisection(),
        plugins.scripts(),
        new CsvMappingPlugin({ outputFile: 'file-mapping.csv' }), // Add the CsvMappingPlugin
    ],
});