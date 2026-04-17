import React, { ReactNode } from 'react';
import {
  StyleSheet,
  Text as TextRN,
  TextProps as TextRNProps,
  TextStyle,
} from 'react-native';
import { TranslationKey } from '@i18n';
import type { Text as TextType } from '@types';
import {
  ColorProp,
  resolveThemeColor,
  useTheme,
  useTypedTranslation,
} from '@hooks';
import { fontFamily, fontSize, fontWeight, lineHeight } from '@theme';

export interface TextProps extends TextRNProps {
  type?: TextType;
  color?: ColorProp;
  children?: ReactNode;
  textAlign?: TextStyle['textAlign'];
  trans?: TranslationKey;
  text?: string;
}

export const Text = ({
  type = 'regular-base',
  color = 'neutral.base',
  textAlign,
  trans,
  text,
  children,
  style,
  ...props
}: TextProps) => {
  const { theme } = useTheme();
  const { translate } = useTypedTranslation();
  const content = trans ? translate(trans as TranslationKey) : text || children;

  return (
    <TextRN
      {...props}
      allowFontScaling={false}
      style={StyleSheet.flatten([
        {
          fontFamily: fontFamily[type],
          fontSize: fontSize[type],
          fontWeight: fontWeight[type],
          lineHeight: !style ? lineHeight[type] : undefined,
          color: resolveThemeColor(theme, color),
          textAlign,
        },
        style,
      ])}
    >
      {content}
    </TextRN>
  );
};
