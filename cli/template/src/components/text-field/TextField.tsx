/* eslint-disable react-native/no-inline-styles */
import { FC, useState } from "react";
import { Platform, Pressable, ReturnKeyTypeOptions, View } from "react-native";
import { TextInput, TextInputProps } from "react-native-paper";
import { screenWidth } from "@constants/functional";
import { useTheme } from "@hooks";
import { ThemeType } from "@theme";
import { Text } from "@components/text/Text";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

export type TextFieldProps = {
	required?: boolean;
	label?: string;
	labelColor?: ThemeType;
	error?: boolean;
	success?: boolean;
	placeholder?: string;
	icon?: any;
	leftIcon?: any;
	rightIcon?: any;
	iconColor?: ThemeType;
	onPressIcon?: () => void;
	errorMessage?: string;
	errorMessageStyle?: any;
	successMessage?: string;
	successMessageStyle?: any;
	value?: any;
	onChangeText: (text: string) => void;
	onBlur?: (text: any) => void;
	onFocus?: (text: any) => void;
	maxLength?: any;
	leftOnPressIcon?: any;
	leftIconColor?: ThemeType;
	disabled?: any;
	inputMode?: TextInputProps["inputMode"];
	top?: number;
	bottom?: number;
	isNotOutline?: boolean;
	secure?: boolean;
	borderColor?: ThemeType;
	backgroundColor?: ThemeType;
	ref?: any;
	keyboardType?: TextInputProps["keyboardType"];
	onSubmitEditing?: TextInputProps["onSubmitEditing"];
	returnKeyType?: ReturnKeyTypeOptions;
	inputTextStyle?: any;
	borderRadius?: any;
	multiline?: any;
	maskEntry?: any;
	placeholderTextColor?: ThemeType;
	onPress?: TextInputProps["onPressOut"];
	subLabel?: string;
	subLabelStyle?: any;
	editable?: boolean;
	onEndEditing?: TextInputProps["onEndEditing"];
	disabledRightIcon?: boolean;
	defaultValue?: string;
	testID?: string;
	customRightText?: React.JSX.Element;
	useBottomSheet?: boolean;
};

const TextField: FC<TextFieldProps> = ({
	required,
	label,
	labelColor,
	error,
	placeholder,
	leftIcon,
	rightIcon,
	iconColor,
	onPressIcon,
	errorMessage,
	errorMessageStyle,
	successMessage,
	successMessageStyle,
	value,
	maxLength,
	onChangeText,
	top = 0,
	bottom = 0,
	isNotOutline,
	secure,
	leftOnPressIcon,
	leftIconColor,
	disabled,
	inputMode,
	borderColor,
	backgroundColor,
	keyboardType,
	returnKeyType,
	onBlur,
	onFocus,
	onSubmitEditing,
	inputTextStyle,
	borderRadius,
	multiline,
	editable,
	maskEntry = false,
	placeholderTextColor,
	onEndEditing,
	subLabelStyle,
	disabledRightIcon,
	defaultValue,
	testID,
	customRightText,
	useBottomSheet = false,
	...props
}) => {
	const { theme } = useTheme();
	const [isMaskEntry, setMaskEntry] = useState(maskEntry);

	const resolvedPlaceholderTextColor =
		placeholderTextColor ?? theme.neutral.secondary;
	const resolvedIconColor = iconColor ?? theme.neutral.base;
	const resolvedLeftIconColor = leftIconColor ?? theme.neutral.base;

	const renderInput = useBottomSheet
		? (innerProps: any) => <BottomSheetTextInput {...innerProps} />
		: undefined;

	return (
		<View
			style={{
				marginTop: top,
				marginBottom: bottom,
				gap: 8,
				width: screenWidth - 40,
			}}
		>
			{label && (
				<Text
					style={{
						color: (labelColor ?? theme.neutral.base) as string,
						letterSpacing: 0.25,
						lineHeight: 22,
					}}
				>
					{label}
					{required && <Text style={{ color: theme.danger.base }}>*</Text>}
				</Text>
			)}
			<Pressable onPress={props.onPress}>
				<TextInput
					textColor={!disabled ? theme.neutral.base : theme.neutral.secondary}
					testID={testID}
					multiline={multiline ?? false}
					disabled={disabled}
					// onPressOut={props.onPress}
					onEndEditing={onEndEditing}
					mode="outlined"
					inputMode={inputMode}
					secureTextEntry={secure && !isMaskEntry}
					activeOutlineColor={isNotOutline ? theme.neutral.base : theme.primary.base}
					editable={editable}
					returnKeyType={returnKeyType}
					onSubmitEditing={onSubmitEditing}
					keyboardType={keyboardType ? keyboardType : "default"}
					submitBehavior="blurAndSubmit"
					onBlur={onBlur}
					onFocus={onFocus}
					style={{
						color: theme.white,
						fontWeight: Platform.OS === "android" ? "bold" : "600",
						fontSize: 14,
						textAlignVertical: "top",
						borderColor: borderColor ? borderColor : "transparent",
						backgroundColor: backgroundColor
							? backgroundColor
							: isNotOutline
								? theme.neutral.base
								: disabled
									? theme.neutral.disabled
									: theme.background,
						...inputTextStyle,
					}}
					outlineStyle={{
						borderRadius: borderRadius ?? 12,
						borderColor: errorMessage
							? theme.danger.base
							: successMessage
								? theme.success.base
								: isNotOutline
									? theme.neutral.secondary
									: theme.neutral.secondary,
						borderWidth: errorMessage || successMessage ? 1 : 1,
					}}
					error={error}
					placeholder={placeholder}
					placeholderTextColor={resolvedPlaceholderTextColor as string}
					right={
						rightIcon ? (
							<TextInput.Icon
								icon={rightIcon}
								onPress={onPressIcon}
								color={() => resolvedIconColor as string}
								disabled={disabledRightIcon ?? disabled}
								size={24}
							/>
						) : secure ? (
							<TextInput.Icon
								icon={isMaskEntry ? "visibility" : "visibility-off"}
								onPress={() => {
									setMaskEntry(!isMaskEntry);
								}}
								color={() => resolvedIconColor as string}
								size={20}
							/>
						) : (
							customRightText
						)
					}
					left={
						leftIcon ? (
							<TextInput.Icon
								icon={leftIcon}
								onPress={leftOnPressIcon}
								color={() => resolvedLeftIconColor as string}
								size={20}
							/>
						) : null
					}
					onChangeText={(text: string) => onChangeText?.(text)}
					value={value}
					maxLength={maxLength}
					{...props}
					autoCapitalize={"none"}
					defaultValue={defaultValue}
					render={renderInput}
				/>

				{props.subLabel && (
					<Text
						text={props.subLabel}
						type="regular-sm"
						style={[{ marginTop: 8 }, subLabelStyle && subLabelStyle]}
					/>
				)}

				{errorMessage ? (
					<Text
						text={errorMessage}
						type="regular-sm"
						color="danger.base"
						style={[{ marginTop: 4 }, errorMessageStyle && errorMessageStyle]}
					/>
				) : null}

				{successMessage ? (
					<Text
						text={successMessage}
						type="regular-sm"
						color="success.base"
						style={[{ marginTop: 4 }, successMessageStyle && successMessageStyle]}
					/>
				) : null}
			</Pressable>
		</View>
	);
};

export { TextField };
