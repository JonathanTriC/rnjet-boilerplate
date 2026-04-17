import {
	BottomTabBarProps,
	createBottomTabNavigator,
} from "@react-navigation/bottom-tabs";
import { useNavigator } from "@navigation/navigator/useNavigator";
import { BottomNavbar } from "@modules/main/screens/bottom-navbar";
import { SafeAreaView } from "react-native-safe-area-context";
import { StyleSheet } from "react-native";
import { AboutScreen, HomeScreen } from "@modules";

const Tab = createBottomTabNavigator<MainStackParamList>();
type MainStackProps = {};

const TabBar = (props: BottomTabBarProps) => <BottomNavbar {...props} />;

export const MainStack: React.FC<MainStackProps> = () => {
	const { screenListeners } = useNavigator();

	return (
		<SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
			<Tab.Navigator
				initialRouteName="HomeScreen"
				screenListeners={screenListeners}
				screenOptions={{
					headerShown: false,
				}}
				tabBar={TabBar}
			>
				<Tab.Screen name={"HomeScreen"} component={HomeScreen} />
				<Tab.Screen name={"AboutScreen"} component={AboutScreen} />
			</Tab.Navigator>
		</SafeAreaView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "white",
	},
});
