import { defineConfig } from "astro/config";
import solid from "@astrojs/solid-js";

// https://astro.build/config
export default defineConfig({
	integrations: [
		solid()
	],
	vite: {
		resolve: {
			alias: {
				util: "util",
				buffer: "buffer",
				stream: "stream-browserify",
				os: "os-browserify/browser",
				process: "process/browser"
			}
		},
		build: {
			commonjsOptions: {
				transformMixedEsModules: true,
			},
		}
	}
});
