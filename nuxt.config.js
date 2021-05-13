export default {
	// Target: https://go.nuxtjs.dev/config-target
	target: "static",

	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: "Briskett",
		htmlAttrs: {
			lang: "en",
		},
		meta: [
			{ charset: "utf-8" },
			{ name: "viewport", content: "width=device-width, initial-scale=1" },
			{
				hid: "description",
				name: "description",
				content: "A delicious Tezos wallet interface for Trezor.",
			},
			{
				property: "og:image",
				content: "/imgs/cut_of_meat.png",
			},
		],
		link: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20100%20100%22%3E%3Ctext%20y%3D%22.9em%22%20font-size%3D%2290%22%3E%F0%9F%A5%A9%3C%2Ftext%3E%3C%2Fsvg%3E",
			},
		],
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: [],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: [],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		"@nuxt/typescript-build",
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [],

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {},
};
