/**
 * @param {string} alt
 * @param {string} url
 * @param {{
 *     large?: string;
 *     medium?: string;
 *     small?: string;
 * }} sizes
 * @returns {SizedImage}
 */
export default function getImageSizes (alt, url, sizes) {
    const image = {
        alt,
        master: url.replace(/_[0-9x]+(\.\w{3,4}(?:\?.+)?$)/, '$1'),
    };

    const getSizedImageUrl = window.Shopify.Image.getSizedImageUrl.bind(
        window.Shopify.Image,
        image.master,
    );

    const getResponsiveImageConfig = (size) => ({
        '1x': getSizedImageUrl(size),
        '2x': getSizedImageUrl(size + '@2x'),
    });

    Object.assign(image, {
        large: getResponsiveImageConfig(sizes.large || '800x'),
        medium: getResponsiveImageConfig(sizes.medium || '500x'),
        small: getResponsiveImageConfig(sizes.small || '300x'),
        lazy: getResponsiveImageConfig(sizes.lazy || '1x'),
    });

    return image;
}
