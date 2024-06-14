const { basename } = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

/** @param {string} suffix */
module.exports = (suffix) => new HTMLWebpackPlugin({
    filename: `snippets/style-tags.${suffix}.liquid`,
    inject: false,
    minify: false,
    /**
     * @param {{
     *     chunks: {
     *         files: {
     *             css: string[];
     *             js: string[];
     *         };
     *         name: string;
     *     }[];
     * }} _
     */
    templateContent ({ chunks }) {
        /** @param {string} href */
        const link = (file) =>
            `<link
                rel="stylesheet"
                href="{{ "${basename(file)}" | asset_url }}"
                data-href="${file}"
            >`;

        return `${chunks.map(({ files, name }) => {
            if (!files.css.length) return '';

            const tags = `${files.css.map(file => link(file)).join('')}`;

            switch (name) {
                case 'checkout':
                case 'theme':
                case 'unsupported': {
                    return `${tags}`;
                }
                case 'collection': {
                    return `
                        {%- if
                            template.name == "${name}" or
                            template.name == "search"
                        -%}
                            ${tags}
                        {%- endif -%}
                    `;
                }
                case 'customers': {
                    return `
                        {%- if
                            template.directory == "${name}" or
                            template == "page.update-password" or
                            template == "page.wishlist"
                        -%}
                            ${tags}
                        {%- endif -%}
                    `;
                }
                case 'page.utility': {
                    return `
                        {%- if
                            template == "page.contact-us" or
                            template == "page.customer-service" or
                            template == "page.outlet-sale" or
                            template == "page.utility" or
                            template == "page.utility-corporate"
                        -%}
                            ${tags}
                        {%- endif -%}
                    `;
                }
                default: {
                    let [ template, suffix ] = name.split('.');
                    if (template === 'bopis') template = suffix, suffix = undefined;

                    return `
                        {%- if
                            template.name == "${template}"
                            ${suffix ? `
                                and
                                    template.suffix
                                    ${[
                                        'landingdynamic',
                                        'list-collections',
                                    ].includes(suffix) ? 'contains' : '=='}
                                    "${suffix}"
                            ` : ''}
                        -%}
                            ${files.css.map(file => link(file)).join('')}
                        {%- endif -%}
                    `;
                }
            }
        }).join('')}`.replace(/\s+/g, ' ');
    },
    /** @param {import('webpack').Compilation} compilation */
    templateParameters (compilation) {
        const chunks = [...compilation.chunks]
            .map(({ name, files }) => ({
                files: {
                    css: [...files].filter(v => /\.css$/.test(v)),
                    js: [...files].filter(v => /\.js$/.test(v)),
                },
                name,
            }))

        return { chunks };
    },
});
