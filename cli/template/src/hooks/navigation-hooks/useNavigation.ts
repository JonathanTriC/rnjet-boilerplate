import { ParamList } from '@navigation/navigator/screen';
import {
  CommonActions,
  NavigationRouteContext,
  useNavigation,
} from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';

export function useNavigate<T = any>() {
  const route = React.useContext(NavigationRouteContext);
  const navigation = useNavigation() as unknown as StackNavigationProp<
    ParamList,
    any
  >;

  const getRootNavigation = React.useCallback(
    (
      nav: StackNavigationProp<ParamList, any>,
    ): StackNavigationProp<ParamList, any> => {
      const parent = nav.getParent();
      if (!parent) {
        return nav;
      }
      return getRootNavigation(parent as StackNavigationProp<ParamList, any>);
    },
    [],
  );

  const navigateScreen = <K extends keyof ParamList>(
    screen: K,
    params?: ParamList[K],
  ) => {
    if (!navigation) {
      return;
    }

    navigation.navigate(screen as any, params as any);
  };

  const popScreen: VoidCallBack = (count?: number) => {
    if (!navigation) {
      return;
    }

    if (!navigation?.canGoBack()) {
      return;
    }

    return navigation?.pop(count);
  };

  const resetNavigate = (screen: keyof ParamList, param?: object) => {
    if (!navigation) {
      return;
    }
    const rootNavigation = getRootNavigation(navigation);

    rootNavigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screen as string, params: param }],
      }),
    );
  };

  const getRouteParams: <U = T>() => U = <U>() => {
    if (!route) {
      return {} as U;
    }

    return (route?.params as U) || ({} as U);
  };

  const getRouteNames: CallBack<string> = () => {
    if (route) {
      return route?.name;
    }

    const routeIndex = navigation?.getState()?.index;

    if (routeIndex === undefined) {
      return '';
    }

    const navRoute = navigation?.getState()?.routes[routeIndex];
    return navRoute?.name;
  };

  return {
    navigation,
    navigateScreen,
    popScreen,
    resetNavigate,
    getRouteParams,
    getRouteNames,
  };
}
