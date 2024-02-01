import { createResource, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import * as i18n from "@solid-primitives/i18n";
import en from "../../locales/en.json";

export const availableLocales = [
	"en",
	"de",
	"es",
	"fr",
	"nl",
	"pt",
	"ru",
	"sk"
];

export const [currentLocale, setCurrentLocale] = createSignal("en");

const [dict] = isServer ? [en] : createResource(currentLocale, async function fetchDictionary(locale = "en") {
	if (availableLocales.includes(locale)) {
		const dict = await import(`../../locales/${locale}.json`);
		return i18n.flatten(dict);
	}

	// fallback to english
	const dict = await import(`../../locales/en.json`);
	return i18n.flatten(dict);
}, {
	initialValue: i18n.flatten(en)
});

export const t = isServer ? (key) => en[key] : i18n.translator(dict);

export const resolveTemplate = i18n.resolveTemplate;
