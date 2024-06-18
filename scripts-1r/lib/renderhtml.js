/**
 * @param {string} html
 * @param {HTMLElement} wrapper
 * @param {boolean} prepend
 */
export default function renderHTML (html, wrapper, prepend = false) {
    const nodes = new DOMParser()
        .parseFromString(html, 'text/html')
        .body
        .childNodes;

    prepend
        ? wrapper.prepend(...nodes)
        : wrapper.append(...nodes);
}
