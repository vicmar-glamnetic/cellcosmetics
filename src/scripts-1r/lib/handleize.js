export default function handleize (str) {
    return str.toLowerCase()
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-/, '')
        .replace(/-$/, '');
};
