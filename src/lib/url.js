// Links that work under a base path (GitHub Pages serves the site from /<slug>/).
const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');

/** Internal link or asset path: href('about/') gives '/about/' or '/<slug>/about/'. */
export const href = (path = '') => base + path.replace(/^\//, '');

/** Path of a page without the base, for building the canonical URL. */
export const pathWithoutBase = (pathname) => '/' + pathname.slice(base.length);
