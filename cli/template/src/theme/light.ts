export type ThemeType = typeof lightTheme;
export type ColorProp = keyof ThemeType;

export const lightTheme = {
	background: "#ffffff",
	white: "#ffffff",
	transparent: "transparent",
	backdrop: "#FFFFFF",
	primary: {
		base: "#3F51B5",
	},
	neutral: {
		base: "#000000",
		secondary: "#8E8E93",
		disabled: "#CACDD2",
	},
	danger: {
		base: "#F75555",
	},
	success: {
		base: "#4ADE80",
	},
};
