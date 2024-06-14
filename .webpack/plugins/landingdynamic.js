const { relative } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const LANDINGDYNAMIC_MODIFIERS = [
    'accessories',
];

// copy sections/landingdynamic.liquid to sections/landingdynamic-modifier.liquid (adding a
// human-readable description to the section's name) and templates/page.landingdynamic.liquid
// to templates/page.landingdynamic-modifier.liquid (replacing the {% section %} tag with
// the proper one for that template)
module.exports = () => new CopyWebpackPlugin({
    patterns: LANDINGDYNAMIC_MODIFIERS.map((modifier) => {
        return {
            from: 'src/*/*landingdynamic.liquid',
            globOptions: { ignore: [ 'src/snippets/*' ] },
            to ({ context, absoluteFilename }) {
                const relativeFilename = relative(context, absoluteFilename);
                return relativeFilename
                    .replace(/^src\//, '')
                    .replace(/\.liquid$/, `-${modifier}.liquid`);
            },
            transform: {
                cache: true,
                transformer (content) {
                    return content
                        .toString()
                        .replace(/section '([^']+?)'/, (match, group) => {
                            return match.replace(group, `landingdynamic-${modifier}`)
                        })
                        .replace(/"name": "([^"()]+?)"/, (match, group) => {
                            const capitalized = modifier.replace(/^[a-z]/, m => m.toUpperCase());
                            return match.replace(group, `${group} (${capitalized})`);
                        });
                },
            },
        };
    }),
});
