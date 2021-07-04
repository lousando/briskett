/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/en/configuration.html
 */

export default {
	testEnvironment: "jsdom",
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
		"^~/(.*)$": "<rootDir>/$1",
		"^vue$": "vue/dist/vue.common.js",
	},
	moduleFileExtensions: ["ts", "js", "vue", "json"],
	transform: {
		"^.+\\.ts$": "ts-jest",
		"^.+\\.js$": "babel-jest",
		".*\\.(vue)$": "vue-jest",
	},
	collectCoverage: true,
	collectCoverageFrom: [
		"<rootDir>/components/**/*.vue",
		"<rootDir>/pages/**/*.vue",
	],
};
