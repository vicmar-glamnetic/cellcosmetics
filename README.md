# Project X 3 (2022.3) 

## Shopify CLI
You can try out using Shopify CLI for your development workflow with the following steps:
1. Run `npm install`. This will install all components
2. Set up `config.json` (`config.json.sample` has been provided as an example).
3. Run `npm run dev`. This will build, sync, and watch for changes.
4. Open the local development link ([http://127.0.0.1:9292](http://127.0.0.1:9292) by default). Changes will hot reload when viewing through this link!
### Note
- When setting up a project, you do **NOT** need to create a theme. Shopify CLI will automatically create a [development theme](https://shopify.dev/docs/themes/tools/cli#development-themes) for you.
### Reverting
To rever to Themekit for development, be sure to delete `config.json`. This will stop Shopify CLI from running during `webkit watch`.
## Installing Shopify CLI
Shopify CLI requires a [global installation](https://shopify.dev/docs/themes/tools/cli/install#macos) before using.
```
brew tap shopify/shopify
brew install shopify-cli
```
Make sure that the installed CLI version is 3.X
## Themekit
Clone the repo to your local (clean setup if you are setting up the first time):
- Make sure your node version is set to v16.17.0
- Make sure your npm version is set to v8.19.0
- Suggest you using nvm to manage your node and npm verions

1. Run `npm install`. This will install all components defineds in package.json.
2. Config your `config.yml` file used to connect to shopify theme.
3. Setup your theme on dev environment.
4. Create and configure your `config.yml`
5. Run `npm run build` to fully build the code.
6. Run `npm run deploy` to fully deploy the code to your target theme.
7. Run `npm run start` this will trigger the build, deploy and start warching.

If you already have the repo cloned on local please:
- Make sure your node version is set to v16.17.0
- Make sure your npm version is set to v8.19.0
- Suggest you using nvm to manage your node and npm verions

1. Remove `node_modules` and `dist` folders
2. Run `npm install`. This will install all components defineds in package.json.
3. Check your `config.yml` file.
4. Run `npm run build` to fully build the code.
5. Run `npm run deploy` to fully deploy the code to your target theme.
6. Run `npm run start` this will trigger the build, deploy and start warching.

**DO NOT COMMIT** `package-lock.json` unless you know what you are doing!
**DO NOT REMOVE** Try not to remove unused files and code from this codebase, if you need to do so, contact the technical owners of P-X for approval.
