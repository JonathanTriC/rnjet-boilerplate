import React from 'react';
import { DimensionValue, StyleProp, View, ViewStyle } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

interface SkeletonLoadingProps {
  width?: DimensionValue;
  height?: DimensionValue;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
}
const SkeletonLoading: React.FC<SkeletonLoadingProps> = ({
  width = '100%',
  height = 220,
  borderRadius = 4,
  style,
}: SkeletonLoadingProps) => {
  return (
    <View style={style}>
      <SkeletonPlaceholder>
        <SkeletonPlaceholder.Item
          width={width}
          height={height}
          borderRadius={borderRadius}
        />
      </SkeletonPlaceholder>
    </View>
  );
};

export { SkeletonLoading };
