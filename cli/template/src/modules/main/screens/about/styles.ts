import { screenWidth } from "@constants";
import { ThemeType } from "@theme";
import { Platform, StyleSheet } from "react-native";

export const createStyles = (theme: ThemeType) =>
	StyleSheet.create({
		container: {
			flex: 1,
			justifyContent: "center",
			alignItems: "center",
		},
		card: {
			padding: 24,
			width: screenWidth - 48,
			alignItems: "center",
			gap: 12,
			borderRadius: 24,
			backgroundColor: theme.background,
			borderWidth: 1,
			borderColor: theme.neutral.disabled,
			// Shadow
			...Platform.select({
				ios: {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 8 },
					shadowOpacity: 0.12,
					shadowRadius: 24,
				},
				android: {
					elevation: 12,
				},
			}),
		},
		avatarContainer: {
			marginTop: -80,
			marginBottom: 4,
		},
		avatarRing: {
			padding: 4,
			borderRadius: 68,
			backgroundColor: theme.background,
			...Platform.select({
				ios: {
					shadowColor: theme.primary.base,
					shadowOffset: { width: 0, height: 4 },
					shadowOpacity: 0.25,
					shadowRadius: 12,
				},
				android: {
					elevation: 8,
				},
			}),
		},
		avatar: {
			width: 120,
			height: 120,
			borderRadius: 60,
			borderWidth: 3,
			borderColor: theme.primary.base,
		},
		nameText: {
			fontSize: 22,
			color: theme.neutral.base,
			marginTop: -4,
		},
		badge: {
			backgroundColor: theme.primary.base + "15",
			paddingHorizontal: 16,
			paddingVertical: 6,
			borderRadius: 20,
		},
		badgeText: {
			color: theme.primary.base,
			fontSize: 13,
		},
		divider: {
			width: "80%",
			height: 1,
			backgroundColor: theme.neutral.disabled,
			marginVertical: 4,
		},
		infoSection: {
			width: "100%",
			gap: 10,
		},
		infoRow: {
			flexDirection: "row",
			alignItems: "center",
			paddingVertical: 10,
			paddingHorizontal: 16,
			borderRadius: 14,
			backgroundColor: theme.neutral.disabled + "40",
		},
		infoIcon: {
			fontSize: 18,
			marginRight: 12,
		},
		linkText: {
			color: theme.primary.base,
			fontSize: 14,
		},
		socialRow: {
			flexDirection: "row",
			alignItems: "center",
			justifyContent: "center",
			gap: 12,
			width: "100%",
		},
		socialButton: {
			flex: 1,
			alignItems: "center",
			paddingVertical: 12,
			borderRadius: 14,
			borderWidth: 1,
			borderColor: theme.neutral.disabled,
			backgroundColor: theme.background,
			...Platform.select({
				ios: {
					shadowColor: "#000",
					shadowOffset: { width: 0, height: 2 },
					shadowOpacity: 0.06,
					shadowRadius: 6,
				},
				android: {
					elevation: 3,
				},
			}),
		},
		socialText: {
			color: theme.primary.base,
			fontWeight: "600",
			fontSize: 14,
		},
		socialDivider: {
			width: 1,
			height: 24,
			backgroundColor: theme.neutral.disabled,
		},
	});
