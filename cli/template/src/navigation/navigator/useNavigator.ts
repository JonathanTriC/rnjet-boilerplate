import { useNavigation } from "@react-navigation/native";
import { useRef } from "react";

export const useNavigator = () => {
	const navigation: any = useNavigation();
	const routeRef = useRef<IRouteRef>({ screenStack: [], screenName: "" });

	const screenListeners = () => ({
		state: async () => {
			const state = navigation?.getState();
			const currentRoute = state?.routes?.[state?.index];
			const currentRouteName = currentRoute?.name;

			if (currentRouteName) {
				routeRef.current.screenName = currentRouteName;
				routeRef.current.screenStack.push(currentRouteName);
				console.log(
					"🚀 ~ file: useNavigator.ts ~ state: ~ currentRouteName:",
					currentRouteName,
				);
			}
		},
	});

	return { screenListeners };
};
