import { createStackNavigator } from '@react-navigation/stack';
import { useNavigator } from './useNavigator';
import { CommonStack, MainStack } from './stack';
import { ParamList } from './screen';

const Stack = createStackNavigator<ParamList>();
type NavigatorProps = {};

export const Navigator: React.FC<NavigatorProps> = () => {
  const { screenListeners } = useNavigator();

  return (
    <Stack.Navigator
      initialRouteName="Common"
      screenListeners={screenListeners}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name={'Common'} component={CommonStack} />
      <Stack.Screen name={'Main'} component={MainStack} />
    </Stack.Navigator>
  );
};
