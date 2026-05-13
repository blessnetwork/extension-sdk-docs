# @blessnetwork/extension-sdk

LLM SDK for Chrome extensions to collect usage data & run proactive prompts across **ChatGPT, Claude, Gemini, Grok, Perplexity, Rufus (Amazon) and Meta AI**

## Step 1: Install

```bash
npm install @blessnetwork/extension-sdk
```

Add `public/vendor/` to your `.gitignore` (these files are generated on install).

## Step 2: Update manifest.json

On `npm install`, the SDK automatically copies its pre-built content scripts, DNR rules, offscreen files, and shared chunks into `public/vendor/bless-sdk/`. Add the following to your `manifest.json`:

```jsonc
{
	"manifest_version": 3,
	"name": "Your Extension",
	"version": "1.0.0",

	"background": {
		"service_worker": "dist/background.js",
		"type": "module"
	},

	"permissions": ["storage", "offscreen", "scripting", "tabs", "declarativeNetRequest", "cookies"],

	// wasm-unsafe-eval is required for the on-device tiny LLM
	"content_security_policy": {
		"extension_pages": "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';"
	},

	"host_permissions": [
		"https://chatgpt.com/*",
		"https://claude.ai/*",
		"https://gemini.google.com/*",
		"https://*.google.com/*",
		"https://www.perplexity.ai/*",
		"https://grok.com/*",
		"https://www.amazon.com/*",
		"https://www.meta.ai/*",
		"https://gateway.meta.ai/*"
	],

	"content_scripts": [
		// ChatGPT
		{
			"matches": ["https://chatgpt.com/*"],
			"js": ["vendor/bless-sdk/chatgpt-early-hook.js"],
			"run_at": "document_start",
			"world": "MAIN",
			"all_frames": true
		},
		{
			"matches": ["https://chatgpt.com/*"],
			"js": ["vendor/bless-sdk/chatgpt-content.js"],
			"run_at": "document_start",
			"all_frames": true
		},
		// Gemini
		{
			"matches": ["https://gemini.google.com/*"],
			"js": ["vendor/bless-sdk/gemini-early-hook.js"],
			"run_at": "document_start",
			"world": "MAIN",
			"all_frames": false
		},
		{
			"matches": ["https://gemini.google.com/*"],
			"js": ["vendor/bless-sdk/gemini-content.js"],
			"run_at": "document_start",
			"all_frames": false
		},
		// Grok
		{
			"matches": ["https://grok.com/*"],
			"js": ["vendor/bless-sdk/grok-early-hook.js"],
			"run_at": "document_start",
			"world": "MAIN",
			"all_frames": true
		},
		// Rufus (Amazon)
		{
			"matches": ["https://www.amazon.com/*"],
			"js": ["vendor/bless-sdk/rufus-early-hook.js"],
			"run_at": "document_start",
			"world": "MAIN",
			"all_frames": true
		},
		// Meta AI
		{
			"matches": ["https://www.meta.ai/*"],
			"js": ["vendor/bless-sdk/metaai-early-hook.js"],
			"run_at": "document_start",
			"world": "MAIN",
			"all_frames": true
		}
	],

	// DNR rules strip X-Frame-Options & CSP so provider sites load in offscreen iframes
	"declarative_net_request": {
		"rule_resources": [
			{
				"id": "chatgpt_iframe_rules",
				"enabled": false,
				"path": "vendor/bless-sdk/chatgpt-rules.json"
			},
			{
				"id": "google_iframe_rules",
				"enabled": true,
				"path": "vendor/bless-sdk/google-rules.json"
			},
			{ "id": "grok_iframe_rules", "enabled": false, "path": "vendor/bless-sdk/grok-rules.json" },
			{ "id": "rufus_iframe_rules", "enabled": false, "path": "vendor/bless-sdk/rufus-rules.json" },
			{
				"id": "perplexity_iframe_rules",
				"enabled": false,
				"path": "vendor/bless-sdk/perplexity-rules.json"
			}
		]
	}
}
```

Note: Claude and Perplexity don't require content scripts, the SDK handles them via offscreen iframes. DNR rules are toggled at runtime by the SDK.

## Step 3: Setup your offscreen

**If no existing offscreen:**
SDK handles its creation, skip this step.

**If extension has an existing offscreen:**
Add this to your existing offscreen HTML --

```html
<script src="/vendor/bless-sdk/offscreen/offscreen-init.js" type="module"></script>
```

## Step 4: Initialize the SDK

Add this to your background service worker (the file referenced as `service_worker` in your manifest). The SDK handles message routing between content scripts, background, and offscreen documents automatically.

```ts
import { initSdk } from '@blessnetwork/extension-sdk'

async function init() {
	const sdk = await initSdk({
		apiKey: 'YOUR_API_KEY', // required, get this from Bless
		disableProviders: [] // optional, can choose any of ['chatgpt', 'claude', 'gemini', 'grok', 'perplexity', 'rufus', 'metaai']
		customOffscreenPath: 'path/to/your-offscreen.html', // optional, only if you have an existing offscreen (see Step 3)
	})
}

init()
```

Note: In case you choose to disable any providers with `disableProviders`, you can remove the corresponding entries from Step 2

## Provider Reference Summary

| Provider   | ID           | Content Scripts                               | DNR Rules               | Host Permission                                         |
| ---------- | ------------ | --------------------------------------------- | ----------------------- | ------------------------------------------------------- |
| ChatGPT    | `chatgpt`    | `chatgpt-early-hook.js`, `chatgpt-content.js` | `chatgpt-rules.json`    | `https://chatgpt.com/*`                                 |
| Claude     | `claude`     | —                                             | —                       | `https://claude.ai/*`                                   |
| Gemini     | `gemini`     | `gemini-early-hook.js`, `gemini-content.js`   | `google-rules.json`     | `https://gemini.google.com/*`, `https://*.google.com/*` |
| Grok       | `grok`       | `grok-early-hook.js`                          | `grok-rules.json`       | `https://grok.com/*`                                    |
| Perplexity | `perplexity` | —                                             | `perplexity-rules.json` | `https://www.perplexity.ai/*`                           |
| Rufus      | `rufus`      | `rufus-early-hook.js`                         | `rufus-rules.json`      | `https://www.amazon.com/*`                              |
| Meta AI    | `metaai`     | `metaai-early-hook.js`                        | —                       | `https://www.meta.ai/*`, `https://gateway.meta.ai/*`    |
