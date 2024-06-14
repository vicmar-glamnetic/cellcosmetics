# Foundation for Email Shopify Boilerplate Process

patrick@onerockwell.com
This is a guide to setting up the boilerplate email generation environment. This runs on foundation for emails. More information here: https://foundation.zurb.com/emails/docs/sass-guide.html

## Installation
To use this template, your computer needs [Node.js](https://nodejs.org/en/) 0.12 or greater (Recommended node v10.13.0 and npm v6.4.1).

## Build Commands
Open the folder in your command line, and run the steps below:
```bash
cd emails
```

Install the Foundation CLI globally with this command. (Skip this step if the package is already installed.):
```bash
npm install foundation-cli --global
```

Install all the packages:
```bash
npm install
```

Use this command to kick off the build process. A new browser tab will open with a server pointing to your project files, watching for changed. It will also compile the production ready HTML email templates in a new /dist directory:
```bash
npm run build
```

## Notes
- your work will be done in /src and will be compiled into /dist
- the gulpfile is updated to work with liquid tags {{ like_this }}
- keep in mind the templates will not look perfect in the browser since they use liquid tags. preview the final result in shopify before saving.
- foundation for emails allows you to inline styles however we don't want to since shopify can inline from styles in the <head>. the gulpfile is already updated to not inline styles.