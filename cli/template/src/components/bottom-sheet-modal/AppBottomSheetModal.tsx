import React, { forwardRef, useCallback, useImperativeHandle } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
	BottomSheetModal,
	BottomSheetModalProps,
	BottomSheetScrollView,
	BottomSheetView,
	BottomSheetBackdrop,
	BottomSheetBackdropProps,
} from "@gorhom/bottom-sheet";
import { createStyles } from "./styles";
import { useAppBottomSheetModal } from "./useAppBottomSheetModal";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

export type AppBottomSheetModalHandle = {
	present: () => void;
	dismiss: () => void;
};

export type AppBottomSheetModalProps = {
	title?: string;
	children: React.ReactNode;
	maxOffsetFromTop?: number;
	enableScroll?: boolean;
	onDismiss?: () => void;
} & Partial<Omit<BottomSheetModalProps, "children">>;

const AppBottomSheetModalInner = (
	{
		title,
		children,
		maxOffsetFromTop = 10,
		enableScroll = true,
		onDismiss,
		snapPoints,
		...rest
	}: AppBottomSheetModalProps,
	ref: React.ForwardedRef<AppBottomSheetModalHandle>,
) => {
	const { bottomSheetModalRef, insets, theme, present, dismiss } =
		useAppBottomSheetModal({ maxOffsetFromTop });

	useImperativeHandle(ref, () => ({ present, dismiss }), [present, dismiss]);

	const hasDynamicSizing = snapPoints == null;
	const styles = createStyles(theme);

	const renderBackdrop = useCallback(
		(props: BottomSheetBackdropProps) => (
			<BottomSheetBackdrop {...props} disappearsOnIndex={-1} appearsOnIndex={0} />
		),
		[],
	);

	const renderHeader = useCallback(() => {
		return (
			<View style={styles.header}>
				<View style={styles.headerSide} />
				{title != null ? (
					<Text style={styles.title} numberOfLines={1}>
						{title}
					</Text>
				) : (
					<View />
				)}
				<TouchableOpacity
					style={styles.headerSide}
					onPress={dismiss}
					hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
				>
					<MaterialDesignIcons name="close" size={20} color={theme.neutral.base} />
				</TouchableOpacity>
			</View>
		);
	}, [styles, theme, title, dismiss]);

	return (
		<BottomSheetModal
			ref={bottomSheetModalRef}
			enableDynamicSizing={hasDynamicSizing}
			snapPoints={snapPoints}
			enablePanDownToClose
			onDismiss={onDismiss}
			handleIndicatorStyle={styles.handleIndicator}
			handleStyle={styles.handle}
			backdropComponent={renderBackdrop}
			backgroundStyle={{ backgroundColor: theme.background }}
			keyboardBehavior="interactive"
			keyboardBlurBehavior="restore"
			android_keyboardInputMode="adjustResize"
			topInset={(insets?.top ?? 30) + maxOffsetFromTop}
			{...rest}
		>
			{enableScroll ? (
				<BottomSheetScrollView
					showsVerticalScrollIndicator={false}
					contentContainerStyle={[styles.content, { paddingBottom: insets?.bottom }]}
					stickyHeaderIndices={[0]}
				>
					<View>{renderHeader()}</View>

					{children}
				</BottomSheetScrollView>
			) : (
				<BottomSheetView
					style={[
						styles.content,
						{
							paddingBottom: insets?.bottom,
						},
					]}
				>
					{renderHeader()}
					{children}
				</BottomSheetView>
			)}
		</BottomSheetModal>
	);
};

export const AppBottomSheetModal = forwardRef(AppBottomSheetModalInner);
