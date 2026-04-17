import { createStackNavigator } from '@react-navigation/stack';
import { SplashScreen } from '@modules/common';
import { useNavigator } from '@navigation/navigator';

const Stack = createStackNavigator<CommonStackParamList>();
type CommonStackProps = {};

export const CommonStack: React.FC<CommonStackProps> = () => {
  const { screenListeners } = useNavigator();

  return (
    <Stack.Navigator
      initialRouteName="SplashScreen"
      screenListeners={screenListeners}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={'SplashScreen'} component={SplashScreen} />
    </Stack.Navigator>
  );
};
