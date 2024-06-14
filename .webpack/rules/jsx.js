/** @type {import('webpack').RuleSetRule} */
module.exports = {
    test: /\.jsx$/,
    exclude: /node_modules\/(?!@vb\/bopis)/,
    use: {
        loader: 'babel-loader',
        options: {
            presets: [['@babel/preset-env', {
                shippedProposals: true,
            }], '@babel/preset-react'],
        },
    },
};
