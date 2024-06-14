const { relative } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// copy src/ to dist/
module.exports = () => new CopyWebpackPlugin({
    patterns: [
        {
            from: 'src/@(assets|config|layout|locales|sections|snippets|templates)/**/*',
            to ({ context, absoluteFilename }) {
                const relativeFilename = relative(context, absoluteFilename);
                return relativeFilename.replace(/^src\//, '');
            },
        },
    ],
});
