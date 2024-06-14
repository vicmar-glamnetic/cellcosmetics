const { CleanWebpackPlugin } = require('clean-webpack-plugin');

/** @param {string[]} [cleanOnceBeforeBuildPatterns] */
module.exports = (cleanOnceBeforeBuildPatterns) => new CleanWebpackPlugin({
    cleanOnceBeforeBuildPatterns,
});
