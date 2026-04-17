/* eslint-disable react-native/no-inline-styles */
import React from "react";
import { Image, TouchableOpacity, View } from "react-native";
import { Button, Text } from "@components";
import useAboutScreen from "./useAboutScreen";
import { createStyles } from "./styles";

export const AboutScreen: React.FC = () => {
	const { theme, LINKS, translate, openUrl, openEmail } = useAboutScreen();
	const styles = createStyles(theme);

	return (
		<View style={[styles.container, { backgroundColor: theme.background }]}>
			<View style={styles.card}>
				{/* Avatar */}
				<View style={styles.avatarContainer}>
					<View style={styles.avatarRing}>
						<Image
							source={{
								uri: "https://res.cloudinary.com/dcs618t8w/image/upload/v1776242579/about-image_oohthe.jpg",
							}}
							style={styles.avatar}
							resizeMode="cover"
						/>
					</View>
				</View>

				{/* Name & Title */}
				<Text trans="welcome:aboutTitle" type="bold-xl" />
				<Text text="Jonathan Tri" type="bold-xl" style={styles.nameText} />
				<View style={styles.badge}>
					<Text
						text="Senior Mobile Developer"
						type="regular-base"
						style={styles.badgeText}
					/>
				</View>

				{/* Divider */}
				<View style={styles.divider} />

				{/* Info Links */}
				<View style={styles.infoSection}>
					<TouchableOpacity
						style={styles.infoRow}
						onPress={() => openUrl(LINKS.website)}
						activeOpacity={0.7}
					>
						<Text text="🌐" style={styles.infoIcon} />
						<Text
							text="jonathantri.com"
							type="regular-base"
							style={styles.linkText}
						/>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.infoRow}
						onPress={openEmail}
						activeOpacity={0.7}
					>
						<Text text="✉️" style={styles.infoIcon} />
						<Text
							text="hello@jonathantri.com"
							type="regular-base"
							style={styles.linkText}
						/>
					</TouchableOpacity>
				</View>

				{/* Social Links */}
				<View style={styles.socialRow}>
					<TouchableOpacity
						style={styles.socialButton}
						onPress={() => openUrl(LINKS.linkedin)}
						activeOpacity={0.7}
					>
						<Text text="LinkedIn" type="regular-base" style={styles.socialText} />
					</TouchableOpacity>

					<View style={styles.socialDivider} />

					<TouchableOpacity
						style={styles.socialButton}
						onPress={() => openUrl(LINKS.github)}
						activeOpacity={0.7}
					>
						<Text text="GitHub" type="regular-base" style={styles.socialText} />
					</TouchableOpacity>
				</View>

				{/* Contact Button */}
				<View style={{ width: "100%", marginTop: 8 }}>
					<Button label={translate("welcome:contact")} action={openEmail} />
				</View>
			</View>
		</View>
	);
};
