import { resolve } from 'node:path'
import { defineConfig } from 'vite'

export default defineConfig({
	build: {
		outDir: 'dist',
		emptyOutDir: true,
		rollupOptions: {
			input: {
				background: resolve(__dirname, 'src/background.ts'),
				popup: resolve(__dirname, 'src/popup.html'),
			},
			output: {
				entryFileNames: 'assets/[name].js',
			},
		},
	},
})
