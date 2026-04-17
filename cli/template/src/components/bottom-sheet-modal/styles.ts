import { ThemeType } from "@theme";
import { StyleSheet } from "react-native";

export const createStyles = (theme: ThemeType) =>
	StyleSheet.create({
		handle: {
			backgroundColor: theme.background,
			borderRadius: 16,
		},
		handleIndicator: {
			width: 40,
			height: 4,
			borderRadius: 2,
			backgroundColor: theme.neutral.disabled,
		},
		header: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "space-between",
			paddingBottom: 20,
			backgroundColor: theme.background,
		},
		headerSide: {
			width: 32,
			alignItems: "flex-end",
		},
		title: {
			flex: 1,
			fontSize: 17,
			fontWeight: "600",
			color: theme.neutral.base,
			textAlign: "center",
		},
		content: {
			paddingHorizontal: 20,
			borderRadius: 16,
			backgroundColor: theme.background,
		},
		sheetBackground: {
			backgroundColor: theme.backdrop,
			borderTopLeftRadius: 16,
			borderTopRightRadius: 16,
		},
	});
