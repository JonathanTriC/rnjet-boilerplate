import { NavigatorScreenParams } from '@react-navigation/native';

export type ParamList = {
  Common: NavigatorScreenParams<CommonStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};
