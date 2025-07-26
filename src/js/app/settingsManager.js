import browser from '../browser.js'
import { renderColorsTab, resetAllAccents, init as initColors } from './mainColors.js'
import { renderFontsTab, handleFontsListeners, init as initFonts } from './mainFonts.js'
import { renderWidthsTab, handleWidthsListeners, init as initWidths } from './mainWidths.js'
import { handleScrolldownListeners, init as initScrolldown } from './scrolldown.js'
import { renderButton } from './components/renderButtons.js'
import { FLOATING_BTN_VISIBLE_KEY } from './config.js'

// Elements cache
let $settings = null
let $resetAllAccentsBtn = null
let $tabButtons = null
let $tabPanes = null

// Constants
const SETTINGS_OPEN_CLASS = 'gpth-settings--open'
const ACTIVE_CLASS = 'active'
const HIDDEN_CLASS = 'hidden'

async function createSettings() {
	// Create settings element if it doesn't exist
	// if ($settings) return

	const gpthSettings = document.createElement('div')
	gpthSettings.className = 'gpth-settings fixed flex flex-col'

	// Render settings HTML
	gpthSettings.innerHTML = `
		<header class="mb-5">
			<h2 class="text-center font-medium gpth-settings__title">
				<span class="font-semibold">GPThemes</span> Customization
			</h2>
		</header>
                <main>
                        <div class="tabs">
                                <div class="tab-buttons p-1 font-semibold mb-5">
                                        <button class="tab-button py-2 px-4 focus:outline-none text-center active">Color</button>
                                        <button class="tab-button py-2 px-4 focus:outline-none text-center">Font</button>
                                        <button class="tab-button py-2 px-4 focus:outline-none text-center">Layout</button>
                                </div>
                                <div class="tab-content">
                                        <div class="tab-pane active" id="tab-colors">${renderColorsTab()}</div>
                                        <div class="tab-pane hidden" id="tab-fonts">${renderFontsTab()}</div>
                                        <div class="tab-pane hidden" id="tab-assets">${renderWidthsTab()}</div>
                                </div>
                        </div>
                </main>
                <footer class="mt-4 grid grid-cols-2 gap-2">
                        ${renderButton({ id: 'exportSettings', content: 'Export Settings', className: 'btn-primary' })}
                        ${renderButton({ id: 'importSettings', content: 'Import Settings', className: 'btn-primary' })}
                </footer>
        `

	// Add to DOM and set up listeners
	document.body.appendChild(gpthSettings)
	cacheElements(gpthSettings)

	// Initialize modules
	// await Promise.all([initColors(), initFonts(), initWidths(), initScrolldown()])

	// Add listeners after initialization
	addListeners()
}

function cacheElements(gpthSettings) {
	$settings = gpthSettings
	$resetAllAccentsBtn = $settings.querySelector('#resetAllAccents')
	$tabButtons = Array.from($settings.querySelectorAll('.tab-button'))
	$tabPanes = Array.from($settings.querySelectorAll('.tab-pane'))

	// Initially disable accent reset button
	if ($resetAllAccentsBtn) {
		$resetAllAccentsBtn.disabled = true
	}
}

function addListeners() {
        handleTabsSwitching()
        handleFontsListeners()
        handleWidthsListeners()
        handleScrolldownListeners()

        if ($resetAllAccentsBtn) {
                $resetAllAccentsBtn.addEventListener('click', resetAllAccents)
        }

        $settings.querySelector('#exportSettings')?.addEventListener('click', exportSettings)
        $settings.querySelector('#importSettings')?.addEventListener('click', importSettings)
}

function openSettings() {
	$settings.classList.add(SETTINGS_OPEN_CLASS)
	$settings.addEventListener('transitionend', handleSettingsOpened, { once: true })

	if ($resetAllAccentsBtn) {
		$resetAllAccentsBtn.disabled = false
	}
}

function handleSettingsOpened() {
	document.body.addEventListener('click', handleClickOutsideSettings)
}

function closeSettings() {
	if (!$settings) return

	$settings.classList.remove(SETTINGS_OPEN_CLASS)
	document.body.removeEventListener('click', handleClickOutsideSettings)

	if ($resetAllAccentsBtn) {
		$resetAllAccentsBtn.disabled = true
	}
}

function handleClickOutsideSettings(e) {
	if (!$settings.contains(e.target) && e.target.id !== 'gpth-open-settings') {
		closeSettings()
	}
}

function handleTabsSwitching() {
        if (!$tabButtons || !$tabButtons.length) return

	// Use cached elements instead of querying on each click
        $tabButtons.forEach((tab, index) => {
                tab.addEventListener('click', () => {
                        const activeTabIndex = $tabButtons.findIndex((t) => t.classList.contains(ACTIVE_CLASS))

			// Skip if the clicked tab is already active
			if (activeTabIndex === index) return

			// Update tab buttons
			$tabButtons[activeTabIndex].classList.remove(ACTIVE_CLASS)
			tab.classList.add(ACTIVE_CLASS)

			// Update tab panes
			$tabPanes[activeTabIndex].classList.add(HIDDEN_CLASS)
                        $tabPanes[index].classList.remove(HIDDEN_CLASS)
                })
        })
}

const SYNC_KEYS = [
                'accent_light',
                'accent_dark',
                'fontFamily',
                'fontSize',
                'lineHeight',
                'letterSpacing',
                'widthSettings',
                'syncEnabled',
                'fullWidthEnabled',
                'scrollButtonPosition',
                'chatBubblesState',
                FLOATING_BTN_VISIBLE_KEY,
        ]

async function exportSettings() {
        const localData = {}
        const storedTheme = localStorage.getItem('theme')
        if (storedTheme !== null) localData.theme = storedTheme
        const storedOLED = localStorage.getItem('isOLED')
        if (storedOLED !== null) localData.isOLED = storedOLED

        const syncData = await browser.storage.sync.get(SYNC_KEYS)

        const data = { local: localData, sync: syncData }

        try {
                await navigator.clipboard.writeText(JSON.stringify(data))
                alert('GPThemes settings copied to clipboard')
        } catch (err) {
                console.error('Export failed:', err)
                prompt('Copy settings manually:', JSON.stringify(data))
        }
}

async function importSettings() {
        const input = prompt('Paste GPThemes settings JSON:')
        if (!input) return

        try {
                const data = JSON.parse(input)

                if (data.local) {
                        if (data.local.theme !== undefined) {
                                localStorage.setItem('theme', data.local.theme)
                        }
                        if (data.local.isOLED !== undefined) {
                                localStorage.setItem('isOLED', data.local.isOLED)
                        }
                }

                if (data.sync && typeof data.sync === 'object') {
                        const sanitized = {}
                        for (const key of SYNC_KEYS) {
                                if (key in data.sync) sanitized[key] = data.sync[key]
                        }
                        await browser.storage.sync.set(sanitized)
                }
                location.reload()
        } catch (err) {
                console.error('Import failed:', err)
                alert('Invalid settings data')
        }
}

export { createSettings, openSettings, closeSettings, $settings, SETTINGS_OPEN_CLASS }
