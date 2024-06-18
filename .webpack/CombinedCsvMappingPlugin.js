// .webpack/plugins/CombinedCsvMappingPlugin.js
const fs = require('fs');
const path = require('path');

class CombinedCsvMappingPlugin {
  constructor(options) {
    this.options = options || {};
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('CombinedCsvMappingPlugin', (compilation, callback) => {
      const outputDir = this.options.outputDir || 'mappings';
      const combinedCsvFile = path.join(outputDir, 'combined_mappings.csv');

      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      const mappings = [];

      for (const asset in compilation.assets) {
        if (asset.includes('assets/')) {
          const sourcePath = `src/${asset.replace('assets/', '')}`;
          mappings.push(`${asset},${sourcePath}`);
        }
      }

      // Write combined mappings to a single CSV file
      fs.writeFileSync(combinedCsvFile, 'original_filepath,build_filepath\n' + mappings.join('\n'), 'utf-8');

      callback();
    });
  }
}

module.exports = CombinedCsvMappingPlugin;
