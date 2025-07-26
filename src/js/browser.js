import webextension from 'webextension-polyfill'

// Use the polyfill if available. Otherwise fall back to global objects.
const browser = webextension ||
                (typeof globalThis !== 'undefined' && globalThis.browser) ||
                (typeof globalThis !== 'undefined' && globalThis.chrome)

export default browser
