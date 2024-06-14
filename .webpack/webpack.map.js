const fs = require('fs');
const path = require('path');

class CsvMappingPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('CsvMappingPlugin', (compilation, callback) => {
      const outputDir = this.options.outputDir || 'mappings';
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
      }

      const mappings = [];

      for (const asset in compilation.assets) {
        if (asset.includes('assets/')) {
          const sourcePath = `src/${asset.replace('assets/', '')}`;
          mappings.push(`${asset},${sourcePath}`);
        }
      }

      // Write mappings to individual files
      mappings.forEach((mapping, index) => {
        const [asset, source] = mapping.split(',');
        const filename = path.basename(asset, path.extname(asset));
        const mappingFile = path.join(outputDir, `${filename}.csv`);

        // Append to the file if it exists, or create a new one
        fs.appendFileSync(mappingFile, `${asset},${source}\n`);
      });

      callback();
    });
  }
}

module.exports = CsvMappingPlugin;