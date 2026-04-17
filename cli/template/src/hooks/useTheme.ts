import { useEffect } from "react";
import { useColorScheme, Appearance, ColorSchemeName } from "react-native";
import { lightTheme, darkTheme } from "@theme";
import { handlerGetItem, handlerSetItem } from "@constants";

const USER_THEME = "USER_THEME";

export type DotPaths<T, Prefix extends string = ""> = {
	[K in keyof T & string]: T[K] extends string
		? `${Prefix}${K}`
		: T[K] extends object
			? DotPaths<T[K], `${Prefix}${K}.`>
			: never;
}[keyof T & string];

export type DotValue<
	T,
	P extends string,
> = P extends `${infer Key}.${infer Rest}`
	? Key extends keyof T
		? DotValue<T[Key], Rest>
		: never
	: P extends keyof T
		? T[P]
		: never;

export type ThemeType = typeof lightTheme;
export type ColorProp = DotPaths<ThemeType>;

export const resolveThemeColor = <T extends object>(
	themeObj: T,
	path: string & DotPaths<T>,
): string =>
	path
		.split(".")
		.reduce<unknown>(
			(obj: unknown, key: string) => (obj as Record<string, unknown>)[key],
			themeObj,
		) as string;

export const useTheme = () => {
	const scheme = useColorScheme();
	const theme = scheme === "dark" ? darkTheme : lightTheme;

	useEffect(() => {
		const savedTheme = handlerGetItem(USER_THEME) as ColorSchemeName;

		if (savedTheme && savedTheme !== scheme) {
			Appearance.setColorScheme(savedTheme);
		}
	}, [scheme]);

	const toggleTheme = () => {
		const nextScheme = scheme === "dark" ? "light" : "dark";

		Appearance.setColorScheme(nextScheme);

		handlerSetItem(USER_THEME, nextScheme);
	};

	const selectTheme = (mode: "light" | "dark") => {
		Appearance.setColorScheme(mode);

		handlerSetItem(USER_THEME, mode);
	};

	return { theme, scheme, toggleTheme, selectTheme };
};
