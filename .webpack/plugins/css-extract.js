const MiniCssExtractPlugin = require('mini-css-extract-plugin');

/** @param {string} [entryName] */
module.exports = (entryName) => new MiniCssExtractPlugin({
    filename: 'assets/[name].css',
    chunkFilename: `assets/${entryName}.[contenthash].css`,
    insert: function () {},
});
