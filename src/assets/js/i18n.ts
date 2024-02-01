import { createResource, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import * as i18n from "@solid-primitives/i18n";
import rawEnDict from "../../locales/en.json";

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

const [dict] = isServer ? [rawEnDict] : createResource(currentLocale, async function fetchDictionary(locale = "en") {
	if (availableLocales.includes(locale)) {
		const rawDict = await import(`../../locales/${locale}.json`);
		// use english to fill in translation gaps
		return i18n.flatten(Object.assign({}, rawEnDict, rawDict));
	}

	// fallback to english
	const rawDict = await import(`../../locales/en.json`);
	return i18n.flatten(rawDict);
}, {
	initialValue: i18n.flatten(rawEnDict)
});

export const t = isServer ? (key) => rawEnDict[key] : i18n.translator(dict);/**/

export const resolveTemplate = i18n.resolveTemplate;
