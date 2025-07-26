import webextension from 'webextension-polyfill'

// Use polyfill when available, otherwise fall back to global objects.
const browserObj =
        webextension ||
        (typeof globalThis !== 'undefined' &&
                (globalThis.browser || globalThis.chrome))

// Ensure a `browser` global exists so bundled scripts can access it
if (typeof globalThis !== 'undefined' && browserObj && !globalThis.browser) {
        globalThis.browser = browserObj
}

export default browserObj
