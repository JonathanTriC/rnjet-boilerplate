import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions } from "react-native";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { initialWindowMetrics } from "react-native-safe-area-context";
import { useTheme } from "@hooks";

type UseAppBottomSheetModalParams = {
	maxOffsetFromTop: number;
};

export const useAppBottomSheetModal = ({
	maxOffsetFromTop,
}: UseAppBottomSheetModalParams) => {
	const bottomSheetModalRef = useRef<BottomSheetModal>(null);
	const insets = initialWindowMetrics?.insets;
	const { theme } = useTheme();

	const [screenHeight, setScreenHeight] = useState(
		() => Dimensions.get("window").height,
	);

	const handleDimensionChange = useCallback(
		({ window }: { window: { height: number; width: number } }) => {
			setScreenHeight(window.height);
		},
		[],
	);

	useEffect(() => {
		const subscription = Dimensions.addEventListener(
			"change",
			handleDimensionChange,
		);
		return () => subscription.remove();
	}, [handleDimensionChange]);

	const maxDynamicContentSize = useMemo(
		() => screenHeight - ((insets?.top ?? 30) * 2 + maxOffsetFromTop),
		[screenHeight, insets?.top, maxOffsetFromTop],
	);

	const present = useCallback(() => {
		bottomSheetModalRef.current?.present();
	}, []);

	const dismiss = useCallback(() => {
		bottomSheetModalRef.current?.dismiss();
	}, []);

	return {
		bottomSheetModalRef,
		maxDynamicContentSize,
		insets,
		theme,
		present,
		dismiss,
	};
};
