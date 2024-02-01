import { createResource, createSignal } from "solid-js";
import { isServer } from "solid-js/web";
import * as i18n from "@solid-primitives/i18n";
import rawEnDict from "../../locales/en.json";

type RawDictionary = typeof rawEnDict
type Dictionary = i18n.Flatten<RawDictionary>;

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

export let t: Function;

if (!isServer) {
	const [dict] = createResource(currentLocale, async function fetchDictionary(locale = "en"): Promise<Dictionary> {
		if (locale === "en") {
			return i18n.flatten(rawEnDict);
		}

		if (availableLocales.includes(locale)) {
			const rawDict: RawDictionary = await import(`../../locales/${locale}.json`);
			// use english to fill in translation gaps
			return i18n.flatten(Object.assign({}, rawEnDict, rawDict));
		}

		// fallback to english
		return i18n.flatten(rawEnDict);
	}, {
		initialValue: i18n.flatten(rawEnDict)
	});

	t = i18n.translator(dict);
} else {
	t = (key: keyof RawDictionary) => rawEnDict[key];
}


export const resolveTemplate = i18n.resolveTemplate;
