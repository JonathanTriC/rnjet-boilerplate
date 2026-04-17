import { ThemeType } from "@theme";
import { StyleSheet } from "react-native";

export const createStyles = (theme: ThemeType) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "space-between",
			paddingVertical: 60,
		},
		header: {
			alignItems: "center",
			paddingHorizontal: 20,
			marginTop: 40,
			gap: 12,
		},
		imagePlaceholder: {
			width: 120,
			height: 120,
			borderRadius: 30,
			marginBottom: 24,
		},
		controlSection: {
			paddingHorizontal: 24,
			gap: 16,
		},
		btnSelect: {
			flexDirection: "row",
			justifyContent: "space-between",
			alignItems: "center",
			padding: 12,
			borderRadius: 12,
			borderWidth: 1,
			borderColor: theme.neutral.disabled,
		},
		footer: {
			alignItems: "center",
			gap: 4,
		},
	});
