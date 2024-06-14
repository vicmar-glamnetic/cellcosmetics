const fs = require('fs');
const path = require('path');

class LogAssetsPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('LogAssetsPlugin', (compilation, callback) => {
      const outputDir = this.options.outputDir || 'dist';
      const logFile = path.join(outputDir, 'assets-log.txt');

      // Ensure the directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const assetMappings = [];

      for (const filename in compilation.assets) {
        const asset = compilation.assets[filename];
        const sourcePath = asset.existsAt ? asset.existsAt.replace(outputDir, 'src') : `src/${filename.replace('assets/', '')}`;
        assetMappings.push(`Asset: ${filename} => Source: ${sourcePath}`);
      }

      // Append to the log file
      fs.appendFileSync(logFile, assetMappings.join('\n') + '\n', 'utf-8');
      callback();
    });
  }
}

module.exports = LogAssetsPlugin;