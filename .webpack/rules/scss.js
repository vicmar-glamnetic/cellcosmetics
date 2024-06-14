const { existsSync } = require('fs');
const { join, normalize, resolve } = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { createJoinForPredicate } = require('resolve-url-loader/lib/join-function');

const pathToOkta = resolve(
    __dirname,
    '..',
    '..',
    'node_modules',
    '@okta',
    'okta-signin-widget',
);

/**
 * @okta/okta-signin-widget/dist/sass/okta-signin.sass
 * imports partials that assume relative urls are resolved
 * relative to @okta/okta-signin-widget/dist/sass. with
 * resolve-url-loader, relative urls are resolved relative
 * to the partial. here, we override any urls that contain
 * @okta/okta-signin-widget to @okta/okta-signin-widget/dist/sass
 *
 * @param {unknown} _
 * @param {string} uri
 * @param {string} base
 * @param {number} i
 * @param {(absolute: string?) => string} next
 *
 * @returns {string}
 */
function joinPredicate (_, uri, base, i, next) {
    const absolute = normalize(join(
        base.includes(pathToOkta)
            ? join(pathToOkta, 'dist', 'sass')
            : base,
        uri,
    ));

    return existsSync(absolute)
        ? absolute
        : next((i === 0) ? absolute : null);
}

const loaders = [
    {
        loader: MiniCssExtractPlugin.loader,
        options: {
            publicPath: '../',
        },
    },
    {
        loader: 'css-loader',
        options: {
            sourceMap: true,
        },
    },
    {
        loader: 'resolve-url-loader',
        options: {
            join: createJoinForPredicate(
                joinPredicate,
                'customJoin',
            ),
            sourceMap: true,
        },
    },
    {
        loader: 'postcss-loader',
        options: {
            postcssOptions: {
                plugins: [
                    'autoprefixer',
                ],
            },
            sourceMap: true,
        },
    },
    {
        loader: 'sass-loader',
        options: {
            sourceMap: true,
        },
    },
];

/** @type {import('webpack').RuleSetRule} */
module.exports = {
    test: /\.((c)|(sa)|(s?c))ss$/,
    oneOf: [
        {
            resourceQuery: /inline/,
            use: [
                'raw-loader',
                ...loaders.slice(2),
            ],
        },
        {
            resourceQuery: {
                not: [/inline/],
            },
            use: loaders,
        },
    ],
}
