import { initSdk } from '@blessnetwork/extension-sdk'

async function init() {
	const sdk = await initSdk({
		apiKey: 'API_KEY',
		customOffscreenPath: 'offscreen.html',
		disableProviders: ['metaai'],
	})

	chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
		return sdk.handleMessage(msg, sender, sendResponse)
	})
}

init()
