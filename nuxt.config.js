export default {
	// Target: https://go.nuxtjs.dev/config-target
	target: "static",

	// Global page headers: https://go.nuxtjs.dev/config-head
	head: {
		title: "Briskett",
		titleTemplate: "Briskett | %s",
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
				content: "/images/logo_mini.png",
			},
		],
		link: [
			{
				rel: "icon",
				type: "image/png",
				href: "/images/logo_mini.png",
			},
		],
	},

	// Global CSS: https://go.nuxtjs.dev/config-css
	css: ["tippy.js/dist/tippy.css"],

	// Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
	plugins: ["~/plugins/tUtils.js"],

	// Auto import components: https://go.nuxtjs.dev/config-components
	components: true,

	// Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
	buildModules: [
		// https://go.nuxtjs.dev/typescript
		"@nuxt/typescript-build",
		"@nuxt/image",
	],

	// Modules: https://go.nuxtjs.dev/config-modules
	modules: [
		[
			"nuxt-i18n",
			{
				seo: true,
				baseUrl: `https://${process.env.NUXT_ENV_APP_DOMAIN}`,
				locales: [
					{
						code: "en",
						iso: "en-US",
						file: "en-us.json",
						domain: `https://${process.env.NUXT_ENV_APP_DOMAIN}`,
						isCatchallLocale: true,
					},
					{
						code: "es",
						iso: "es-ES",
						file: "es.json",
						domain: `https://es.${process.env.NUXT_ENV_APP_DOMAIN}`,
					},
					{
						code: "de",
						iso: "de-DE",
						file: "de.json",
						domain: `https://de.${process.env.NUXT_ENV_APP_DOMAIN}`,
					},
					{
						code: "fr",
						iso: "fr-FR",
						file: "fr.json",
						domain: `https://fr.${process.env.NUXT_ENV_APP_DOMAIN}`,
					},
				],
				differentDomains: true,
				detectBrowserLanguage: {
					useCookie: false,
					onlyOnRoot: true,
					alwaysRedirect: true,
				},
				langDir: "~/locales/",
				defaultLocale: "en",
			},
		],
	],

	// Build Configuration: https://go.nuxtjs.dev/config-build
	build: {},
};
