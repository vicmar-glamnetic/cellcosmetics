const { relative } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const MULTISECTION_MODIFIERS = [
    'landing',
];

// copy sections/multisection.json to sections/multisection-modifier.json (adding a
// human-readable description to the section's name) and templates/page.multisection.json
// to templates/page.multisection-modifier.json (replacing the {% section %} tag with
// the proper one for that template)
module.exports = () => new CopyWebpackPlugin({
    patterns: MULTISECTION_MODIFIERS.map((modifier) => {
        return {
            from: 'src/templates/*multisection.json',
            globOptions: { ignore: [ 'src/snippets/*', 'src/sections/*' ] },
            to ({ context, absoluteFilename }) {
                const relativeFilename = relative(context, absoluteFilename);
                return relativeFilename
                    .replace(/^src\//, '')
                    .replace(/\.json$/, `-${modifier}.json`);
            },
            transform: {
                cache: true,
                transformer (content) {
                    return content
                        .toString()
                        .replace(/"name": "([^"()]+?)"/, (match, group) => {
                            const capitalized = modifier.replace(/^[a-z]/, m => m.toUpperCase());
                            return match.replace(group, `${group} (${capitalized})`);
                        });
                },
            },
        };
    }),
});
