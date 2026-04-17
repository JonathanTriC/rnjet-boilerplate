import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import useHomeScreen from "./useHomeScreen";
import { AppBottomSheetModal, Button, Text } from "@components";
import { globalStyles } from "@constants";
import { createStyles } from "./styles";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

export const HomeScreen: React.FC = () => {
	const {
		i18n,
		theme,
		scheme,
		icon,
		bundleId,
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
	} = useHomeScreen();

	const styles = createStyles(theme);

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={styles.header}>
				<Image source={icon} style={styles.imagePlaceholder} />

				<Text trans="welcome:greeting" type="bold-2xl" />

				<Text
					trans="welcome:description"
					type="regular-lg"
					color="neutral.secondary"
					textAlign="center"
				/>
			</View>

			<View style={styles.controlSection}>
				<Button
					label={translate("welcome:changeThemeTitle")}
					action={handlePresentChangeModeModal}
				/>
				<Button
					label={translate("welcome:changeLanguageTitle")}
					action={handlePresentChangeLanguageModal}
				/>
			</View>

			<AppBottomSheetModal
				ref={changeModeModalRef}
				title={translate("welcome:selectTheme")}
			>
				<View style={globalStyles.gap10}>
					{listTheme?.map((item) => {
						return (
							<TouchableOpacity
								key={item?.index}
								style={styles.btnSelect}
								onPress={() => handleSelectDisplayMode(item?.type)}
							>
								<Text text={item?.text} />
								{scheme === item?.type ? (
									<MaterialDesignIcons
										name="check"
										size={20}
										color={theme.primary.base}
									/>
								) : null}
							</TouchableOpacity>
						);
					})}
				</View>
			</AppBottomSheetModal>

			<AppBottomSheetModal
				ref={changeLanguageModalRef}
				title={translate("welcome:selectLanguage")}
			>
				<View style={globalStyles.gap10}>
					{listLanguage?.map((item) => {
						return (
							<TouchableOpacity
								key={item?.index}
								style={styles.btnSelect}
								onPress={() => handleSelectLanguage(item?.type)}
							>
								<Text text={item?.text} />
								{i18n.language === item?.type ? (
									<MaterialDesignIcons
										name="check"
										size={20}
										color={theme.primary.base}
									/>
								) : null}
							</TouchableOpacity>
						);
					})}
				</View>
			</AppBottomSheetModal>

			<View style={styles.footer}>
				<Text text={ENV} type="light-sm" color="neutral.secondary" />
				<Text text={bundleId} type="light-sm" color="neutral.secondary" />
			</View>
		</View>
	);
};
