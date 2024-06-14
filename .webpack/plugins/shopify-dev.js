const { spawn } = require('child_process');

module.exports = class ShopifyDevPlugin {

    constructor(options = {}) {
        this.store = options.store;
        this.password = options.password;
    }

    apply(compiler) {

        if (!this.store || !this.password) {
            throw new Error('Missing store/password');
        }

        let firstEmit = true;
        compiler.hooks.afterEmit.tap('AfterEmitPlugin', (compilation) => {
            if (firstEmit) {
                const shopify = spawn('shopify', ['theme', 'dev', `--store=${this.store}`, '--path=./dist', `--password=${this.password}`]);
                shopify.stdout.on('data', data => process.stdout.write(data));
                shopify.stderr.on('data', data => process.stderr.write(data));
                firstEmit = false;
            }
        });
    }
}