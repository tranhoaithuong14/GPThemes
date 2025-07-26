import webextension from 'webextension-polyfill'

// Minimal fallback implementation when running outside a WebExtension
const fallbackBrowser = {
        storage: {
                sync: {
                        async get() {
                                return {}
                        },
                        async set() {},
                        async remove() {},
                },
        },
        runtime: {
                getManifest() {
                        return { version: '0.0.0' }
                },
        },
        action: {
                async setBadgeBackgroundColor() {},
                async setBadgeText() {},
        },
}

// Use polyfill when available, otherwise fall back to global objects
const browserObj =
        webextension ||
        (typeof globalThis !== 'undefined' &&
                (globalThis.browser || globalThis.chrome)) ||
        fallbackBrowser

// Ensure a `browser` global exists so bundled scripts can access it
if (typeof globalThis !== 'undefined' && browserObj && !globalThis.browser) {
        globalThis.browser = browserObj
}

export default browserObj
