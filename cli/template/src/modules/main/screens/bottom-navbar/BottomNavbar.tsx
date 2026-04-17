import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import MaterialDesignIcons, {
  MaterialDesignIconsIconName,
} from '@react-native-vector-icons/material-design-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Text } from '@components';
import { useTheme } from '@hooks';
import { createStyles } from './styles';

export type BottomNavbarRoute = {
  key: string;
  title: string;
  icon: MaterialDesignIconsIconName;
  iconFocused: MaterialDesignIconsIconName;
};

export type { BottomTabBarProps as BottomNavbarProps };

const ROUTES: BottomNavbarRoute[] = [
  {
    key: 'HomeScreen',
    title: 'Home',
    icon: 'home-outline',
    iconFocused: 'home',
  },
  {
    key: 'AboutScreen',
    title: 'About',
    icon: 'account-outline',
    iconFocused: 'account',
  },
];

const BottomNavbar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const routeMeta = ROUTES.find(r => r.key === route.name) ?? {
          title: route.name,
          icon: 'circle-outline' as MaterialDesignIconsIconName,
          iconFocused: 'circle' as MaterialDesignIconsIconName,
        };

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : routeMeta.title;

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <View style={styles.iconWrapper}>
              <MaterialDesignIcons
                name={isFocused ? routeMeta.iconFocused : routeMeta.icon}
                size={24}
                color={isFocused ? theme.primary.base : theme.neutral.secondary}
              />
            </View>
            <Text
              allowFontScaling={false}
              type="bold-sm"
              color={isFocused ? 'primary.base' : 'neutral.secondary'}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export { BottomNavbar };
