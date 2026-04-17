import { initReactI18next } from "react-i18next";
import { handlerGetItem, handlerSetItem } from "@constants";
import {
	defaultLanguage,
	defaultNameSpace,
	keySeparator,
	nameSpaceNames,
	resources,
} from "@i18n";
import i18n, { i18n as i18nApi, LanguageDetectorModule } from "i18next";

const USER_LANGUAGE = "USER_LANGUAGE";

const languageDetectorPlugin: LanguageDetectorModule = {
	type: "languageDetector",
	init: () => {},
	detect: () => {
		try {
			const language = handlerGetItem(USER_LANGUAGE);

			if (language) {
				return language;
			}

			return "en";
		} catch (error) {
			console.log("Error reading language", error);
			return "en";
		}
	},
	cacheUserLanguage: async (language: string) => {
		try {
			await handlerSetItem(USER_LANGUAGE, language);
		} catch (error) {
			console.log("Error saving language", error);
		}
	},
};

export function initI18n(locale?: string): i18nApi {
	i18n
		.use(initReactI18next)
		.use(languageDetectorPlugin)
		.init({
			ns: nameSpaceNames,
			defaultNS: defaultNameSpace,
			lng: locale,
			resources,
			fallbackLng: defaultLanguage,
			keySeparator,
			interpolation: { escapeValue: false },
			supportedLngs: Object.keys(resources),
		});
	return i18n;
}
