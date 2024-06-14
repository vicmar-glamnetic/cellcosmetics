/** @type {import('webpack').RuleSetRule} */
module.exports = {
    test: /\.html$/,
    use: {
        loader: "underscore-template-loader"
    },
};
