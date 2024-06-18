import get from './get';

const { locale } = window.Shopify;
const { default: translations } = await import(
    `../../locales/${locale}${locale === 'en' ? '.default' : ''}.json`
);

/** @type {(key: string) => string} */
export const t = (key) => {
    return get(translations, key, '');
};
