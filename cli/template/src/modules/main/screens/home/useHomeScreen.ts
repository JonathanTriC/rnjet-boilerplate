import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useTheme, useTypedTranslation } from "@hooks";
import { useCallback, useRef } from "react";
import Config from "react-native-config";

const AppIconDev = require("@assets/app-icon/development/app-icon.png");
const AppIconProd = require("@assets/app-icon/production/app-icon.png");

type ListOption<T> = {
	index: number;
	type: T;
	text: string;
};

const useHomeScreen = () => {
	const { translate, i18n } = useTypedTranslation();
	const { theme, scheme, selectTheme } = useTheme();

	const changeLanguageModalRef = useRef<BottomSheetModal>(null);
	const changeModeModalRef = useRef<BottomSheetModal>(null);

	const handlePresentChangeLanguageModal = useCallback(() => {
		changeLanguageModalRef.current?.present();
	}, []);
	const handlePresentChangeModeModal = useCallback(() => {
		changeModeModalRef.current?.present();
	}, []);

	const ENV = Config.ENV ?? "unknown";

	const listTheme: ListOption<"light" | "dark">[] = [
		{
			index: 1,
			type: "light",
			text: `☀️ ${translate("welcome:lightMode")}`,
		},
		{
			index: 2,
			type: "dark",
			text: `🌙 ${translate("welcome:darkMode")}`,
		},
	];

	const listLanguage: ListOption<"id" | "en">[] = [
		{
			index: 1,
			type: "id",
			text: `🇮🇩 ${translate("welcome:indonesian")}`,
		},
		{
			index: 2,
			type: "en",
			text: `🇬🇧 ${translate("welcome:english")}`,
		},
	];

	const getAppIcon = () => {
		switch (ENV) {
			case "development":
				return AppIconDev;
			case "production":
				return AppIconProd;
			default:
				return AppIconProd;
		}
	};

	const handleSelectDisplayMode = (mode: "light" | "dark") => {
		selectTheme(mode);
		changeModeModalRef.current?.dismiss();
	};

	const handleSelectLanguage = (lang: "en" | "id") => {
		i18n.changeLanguage(lang);
		changeLanguageModalRef.current?.dismiss();
	};

	return {
		i18n,
		theme,
		scheme,
		icon: getAppIcon(),
		bundleId: Config.BUNDLE_ID,
		ENV,
		listTheme,
		listLanguage,
		changeLanguageModalRef,
		changeModeModalRef,
		handlePresentChangeLanguageModal,
		handlePresentChangeModeModal,
		translate,
		handleSelectDisplayMode,
		handleSelectLanguage,
	};
};

export default useHomeScreen;
