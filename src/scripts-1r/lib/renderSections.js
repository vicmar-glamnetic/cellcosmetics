/**
 * Request one or more sections from the Shopify section rendering API
 * See: https://shopify.dev/docs/api/section-rendering
 * 
 * @param {Array} sections - An array of section names to request
 * @param {String} [path] - Optional path to request sections from. Defaults to the current path if not provided
 * @returns {Object} - An object containing the section names and their rendered HTML
 */
export async function renderSections(sections, path) {
    const slug = path ? window.Shopify.routes.root + path : window.location.pathname
    const url = new URL(slug, window.location.origin);
    const params = new URLSearchParams({
        sections: sections.join(',')
    });
    url.search = params.toString();

    const response = await fetch(url);
    const data = await response.json();

    return data;
}

export function getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
}