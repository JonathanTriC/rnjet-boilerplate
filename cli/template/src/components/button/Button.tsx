/* eslint-disable react-native/no-inline-styles */

import React from 'react';
import {
  Image,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from 'react-native';
import { useTheme } from '@hooks';
import { ThemeType } from '@theme';

export type ButtonProps = {
  label?: string;
  icon?: any;
  color?: string;
  background?: string;
  action?: () => void;
  top?: number;
  iconLeft?: any;
  bottom?: number;
  borderWidth?: number;
  borderColor?: string;
  isDisabled?: boolean;
  style?: TouchableOpacityProps['style'];
  outline?: boolean;
  danger?: boolean;
  success?: boolean;
  primaryLight?: boolean;
  fontSize?: number;
  customDisabled?: boolean;
  textStyle?: StyleProp<TextStyle>;
  testID?: string;
  padding?: ViewStyle['padding'];
  margin?: ViewStyle['margin'];
  children?: React.ReactNode;
};

const Button = ({
  label,
  icon,
  color,
  background,
  action,
  top = 0,
  bottom = 0,
  isDisabled = false,
  outline = false,
  style = {},
  danger = false,
  success = false,
  primaryLight = false,
  fontSize = 16,
  borderColor,
  borderWidth = 0,
  customDisabled = false,
  iconLeft,
  textStyle,
  testID,
  padding,
  children,
}: ButtonProps) => {
  const { theme } = useTheme();

  const resolvedColor = color ?? theme.white;
  const resolvedBackground = background ?? theme.primary.base;
  const resolvedBorderColor = borderColor ?? theme.neutral.base;

  return (
    <TouchableOpacity
      testID={testID}
      disabled={customDisabled || isDisabled}
      onPress={action}
      style={[
        styleProps(
          theme,
          isDisabled,
          top,
          bottom,
          resolvedBackground,
          resolvedColor,
          outline,
          danger,
          success,
          primaryLight,
          fontSize,
          resolvedBorderColor,
          borderWidth,
          padding,
        ).container,
        style,
      ]}
    >
      {iconLeft && <View style={{ marginRight: 10 }}>{iconLeft}</View>}
      {icon && <Image source={icon} style={styles.icon} />}

      {children ? (
        children
      ) : (
        <Text
          allowFontScaling={false}
          style={[
            styleProps(
              theme,
              isDisabled,
              top,
              bottom,
              resolvedBackground,
              resolvedColor,
              outline,
              danger,
              success,
              primaryLight,
              fontSize,
              resolvedBorderColor,
              borderWidth,
            ).text,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    height: 24,
    width: 24,
    marginRight: 8,
    resizeMode: 'contain',
  },
  rightIcon: {
    position: 'absolute',
    right: 0,
    paddingHorizontal: 20,
  },
});

const styleProps = (
  theme: ThemeType,
  isDisabled: boolean,
  top: number,
  bottom: number,
  background: string,
  color: string,
  outline: boolean,
  danger: boolean,
  success: boolean,
  primaryLight: boolean,
  fontSize: number,
  borderColor: string,
  borderWidth: number,
  padding?: ViewStyle['padding'],
) =>
  StyleSheet.create({
    container: {
      padding: padding,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      borderRadius: 12,
      backgroundColor: isDisabled
        ? theme.neutral.disabled
        : outline
        ? theme.transparent
        : danger
        ? theme.danger.base
        : success
        ? theme.success.base
        : primaryLight
        ? theme.primary.base
        : background,
      borderColor: isDisabled
        ? 'transparent'
        : outline
        ? theme.neutral.base
        : borderColor
        ? borderColor
        : '#C2185B',
      marginTop: top,
      marginBottom: bottom,
      borderWidth: outline ? 1 : borderWidth ? borderWidth : 0,
      paddingVertical: 12,
    },
    text: {
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: fontSize,
      fontWeight: '600',
      fontFamily: 'Montserrat-Bold',
      color: isDisabled
        ? theme.neutral.secondary
        : outline || primaryLight
        ? theme.neutral.base
        : danger
        ? theme.white
        : success
        ? theme.white
        : color,
    },
  });

export { Button };
