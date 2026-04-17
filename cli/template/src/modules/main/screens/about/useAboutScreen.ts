import { useTheme, useTypedTranslation } from "@hooks";
import { Linking } from "react-native";

const useAboutScreen = () => {
	const { translate } = useTypedTranslation();
	const { theme } = useTheme();

	const LINKS = {
		website: "https://jonathantri.com",
		email: "hello@jonathantri.com",
		linkedin: "https://www.linkedin.com/in/jonathan-tri-christianto/",
		github: "https://github.com/jonathantric/",
	};

	const openUrl = (url: string) => Linking.openURL(url);
	const openEmail = () => Linking.openURL(`mailto:${LINKS.email}`);

	return {
		theme,
		LINKS,
		translate,
		openUrl,
		openEmail,
	};
};

export default useAboutScreen;
