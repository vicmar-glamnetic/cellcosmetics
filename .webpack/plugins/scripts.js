const { promises: { readFile } } = require('fs');
const { dirname, join, relative } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// build scripts/*.js
module.exports = () => new CopyWebpackPlugin({
    patterns: [
        {
            from: 'src/scripts/*.js',
            to ({ context, absoluteFilename }) {
                const relativeFilename = relative(context, absoluteFilename);
                return relativeFilename.replace(/^src\/scripts\//, 'assets/');
            },
            transform: {
                cache: true,
                async transformer (content, absoluteFilename) {
                    const REG = /\/\/\s*=require (?<path>.+)/g;

                    let source = content.toString();
                    const dir = dirname(absoluteFilename);

                    const matches = source.match(REG).map((text) => {
                        const match = text.match(REG.source);
                        match.index = source.indexOf(text);
                        return match;
                    });

                    for (const match of matches.reverse()) {
                        const include = await readFile(join(dir, match.groups.path), 'utf-8');
                        source = source.substr(0, match.index)
                            + include
                            + source.substr(match.index + match[0].length);
                    }

                    return source;
                },
            },
        },
    ],
});
