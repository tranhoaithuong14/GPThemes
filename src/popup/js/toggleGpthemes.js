import browser from '../../js/browser.js'
import { renderToggle } from '../../js/app/components/renderToggles'
import { FLOATING_BTN_VISIBLE_KEY } from '../../js/app/config'

const CONFIG = {
	toggleId: 'toggle-floating-btn-visibility',
	containerId: 'floating-btn-toggle-container',
	label: 'Hide GPThemes',
}

function renderFloatingBtnToggle(checked) {
	return renderToggle({
		id: CONFIG.toggleId,
		checked,
		label: CONFIG.label,
		card: true,
		className: '',
	})
}

async function setupFloatingBtnToggle() {
	const container = document.getElementById(CONFIG.containerId)
	if (!container) return

	// Get current state
	const { [FLOATING_BTN_VISIBLE_KEY]: isVisible = true } = await browser.storage.sync.get(FLOATING_BTN_VISIBLE_KEY)

	container.innerHTML = renderFloatingBtnToggle(!isVisible)

	// Just update storage - sync will handle the rest
	document.getElementById(CONFIG.toggleId)?.addEventListener('change', async (e) => {
		await browser.storage.sync.set({
			[FLOATING_BTN_VISIBLE_KEY]: !e.target.checked,
		})
	})
}

export { setupFloatingBtnToggle }
