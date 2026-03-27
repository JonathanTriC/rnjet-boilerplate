"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateProject = generateProject;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const shelljs_1 = __importDefault(require("shelljs"));
const chalk_1 = __importDefault(require("chalk"));
const sharp_1 = __importDefault(require("sharp"));
async function generateProject(answers) {
    const { appDisplayName, projectName, folderName, bundleId, installDeps } = answers;
    const targetDir = path_1.default.resolve(process.cwd(), folderName);
    // 1. Create folder
    fs_extra_1.default.mkdirpSync(targetDir);
    // 2. Run React Native CLI inside it
    console.log(chalk_1.default.cyan("Generating base React Native project..."));
    shelljs_1.default.cd(targetDir);
    // Using the exact required command but adapted for RN 0.84.1 deprecations
    const initCmd = `npx --yes @react-native-community/cli@latest init ${projectName} --version 0.84.1 --skip-install`;
    if (shelljs_1.default.exec(initCmd).code !== 0) {
        console.error(chalk_1.default.red("Failed to initialize React Native project. See above logs for details."));
        process.exit(1);
    }
    console.log(chalk_1.default.green("React Native project initialized"));
    // Move nested generated project to root of targetDir
    const nestedDir = path_1.default.join(targetDir, projectName);
    if (fs_extra_1.default.existsSync(nestedDir)) {
        fs_extra_1.default.copySync(nestedDir, targetDir);
        fs_extra_1.default.removeSync(nestedDir);
    }
    // 3. Rename project
    console.log(chalk_1.default.cyan("Renaming bundle identifier..."));
    const renameCmd = `npx --yes react-native-rename "${projectName}" -b ${bundleId}`;
    if (shelljs_1.default.exec(renameCmd).code !== 0) {
        console.warn(chalk_1.default.yellow("react-native-rename could not be completed cleanly. Continuing..."));
    }
    else {
        console.log(chalk_1.default.green("Project renamed successfully"));
    }
    // 4. Install dependencies
    if (installDeps) {
        console.log(chalk_1.default.cyan("Installing boilerplate dependencies..."));
        const deps = [
            "react-native-screens@latest",
            "react-native-gesture-handler@latest",
            "react-native-mmkv@latest",
            "react-native-nitro-modules@latest",
            "react-native-splash-view@^0.0.21",
            "@react-native-vector-icons/material-design-icons@^12.4.1",
            "@react-navigation/native@^7.1.31",
            "@react-navigation/stack@^7.8.2",
            "react-native-safe-area-context@^5.2.0",
            "@tanstack/react-query@^5.90.21",
            "axios@^1.13.6",
            "react-i18next",
            "i18next",
            "react-native-config",
            "babel-plugin-module-resolver@^5.0.0",
        ].join(" ");
        if (shelljs_1.default.exec(`yarn add ${deps}`).code !== 0) {
            console.error(chalk_1.default.red("Failed to install dependencies"));
        }
        else {
            console.log(chalk_1.default.green("Dependencies installed"));
        }
    }
    // 5. Inject folder structure
    console.log(chalk_1.default.cyan("Injecting src folder structure..."));
    const folders = [
        "src/api",
        "src/assets/fonts",
        "src/assets/icons",
        "src/assets/app-icon/development",
        "src/assets/app-icon/production",
        "scripts",
        "src/assets/images",
        "src/components/base",
        "src/constants",
        "src/hooks",
        "src/navigation",
        "src/theme",
        "src/i18n",
        "src/types",
    ];
    for (const folder of folders) {
        fs_extra_1.default.mkdirpSync(path_1.default.join(targetDir, folder));
    }
    // Create all required boilerplate files
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/api/apiType.d.ts"), `import { AxiosRequestConfig, AxiosResponse } from 'axios';

export type ApiProps = {
  url: string;
  statusCode?: number;
  body?: any;
  fullResponse?: boolean;
  tags?: string;
  headers?: any;
  retry?: number;
  config?: AxiosRequestConfig;
  resHeaders?: boolean;
};

export type ApiLog = {
  nameFunction: string;
  body?: any;
  tags?: string;
  res?: AxiosResponse<any, any> | any;
  e?: any;
  isDownload?: boolean;
};

export interface GenerateCurlProps {
  res: AxiosResponse<any, any> | any;
  url: string;
  nameFunction: string;
  tags: string;
  isError?: string;
}

export type ApiError<T = unknown> = {
  success: boolean;
  message: string;
  errors?: T;
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/api/apiUtils.ts"), `import { ApiLog, GenerateCurlProps } from './apiType';

const logApi = (props: ApiLog) => {
  try {
    if (!props.tags) {
      return;
    }

    if (props.e && props.e.constructor.name.toLowerCase() !== 'axioserror') {
      console.log('************** API LOG **************');
      console.log(
        \`\${props.nameFunction} \`,
        props.tags,
        ' error : ',
        JSON.stringify(props.e),
      );
      console.log('************** API LOG **************');
      return;
    }

    let url = '';
    let statusCode: any = 0;
    let body = JSON.stringify(props.body || '');
    let data = '';
    let isError = props.e ? 'error' : '';

    if (isError) {
      url = props.e?.request?._url || '';
      statusCode = props.e?.response?.status;
      body = props.e?.config?.data || '';
      data = JSON.stringify(props.e?.response?.data) || '';
    } else {
      url = props.res?.request?._url;
      statusCode = props.res?.status;
      data =
        JSON.stringify(props.res?.data?.data) ||
        JSON.stringify(props.res?.data);
    }

    console.log('************** API LOG **************');
    generateCurl({
      res: props.res || props.e,
      nameFunction: props.nameFunction,
      tags: props.tags,
      url,
      isError,
    });

    console.log(
      \`\${props.nameFunction}\`,
      props.tags,
      isError,
      'statusCode :',
      statusCode,
      '\\n',
    );

    console.log(
      \`\${props.nameFunction}\`,
      props.tags,
      isError,
      'url :',
      url,
      '\\n',
    );
    console.log(
      \`\${props.nameFunction}\`,
      props.tags,
      isError,
      'body :',
      body,
      '\\n',
    );

    console.log(
      \`\${props.nameFunction}\`,
      props.tags,
      isError,
      'data :',
      data,
      '\\n',
    );
    console.log('************** API LOG **************');
  } catch (error) {
    if (!props.tags) {
      return;
    }
    console.log('ERROR LOG API : ', error);
  }
};

const generateCurl = (props: GenerateCurlProps) => {
  try {
    if (!props.tags) {
      return;
    }

    if (!props.res?.config) {
      console.log(
        'Cant generate curl because props \`res\` is not an AxiosResponse',
      );
      return;
    }

    const { params, headers, data, method } = props.res?.config;
    let curlCommand = \`curl --location "\${props.url}"\`;

    // Add request method
    curlCommand += \` --request \${method?.toUpperCase?.()}\`;

    // Add headers
    for (const [key, value] of Object.entries(headers)) {
      curlCommand += \` --header "\${key}: \${value}"\`;
    }

    // Add query parameters
    if (params) {
      const queryParams = new URLSearchParams(params).toString();
      curlCommand += \` --data-urlencode "\${queryParams}"\`;
    }

    // Add request body
    if (data) {
      const requestBody = data;
      curlCommand += \` --data '\${requestBody}'\`;
    }

    console.log(
      props.nameFunction,
      props.tags,
      props.isError,
      'curl :',
      curlCommand,
    );
  } catch (error) {
    if (!props.tags) {
      return;
    }
    console.log('ERROR GENERATE CURL : ', error);
  }
};

export { logApi };
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/api/client.ts"), `import { BASE_URL } from '@constants/url';
import axios, { CreateAxiosDefaults } from 'axios';

const baseConfig: CreateAxiosDefaults<any> = {
  baseURL: BASE_URL,
  headers: {
    accept: 'application/json',
  },
  /* other custom settings */
  timeout: 10000,
};

const client = axios.create(baseConfig);
client.interceptors.request.use(async function (config) {
  if (!config.headers.Authorization) {
    const token = '';

    if (token) {
      config.headers.Authorization = 'Bearer ' + token;
    }
  }

  return config;
});
client.interceptors.response.use(
  async function (response) {
    // dismissLoading();
    return Promise.resolve(response);
  },
  async function (error) {
    return Promise.reject(error);
  },
);

export { client };
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/api/clientWithoutToken.ts"), `import { BASE_URL } from '@constants/url';
import axios, { CreateAxiosDefaults } from 'axios';

const baseConfig: CreateAxiosDefaults<any> = {
  baseURL: BASE_URL,
  headers: {
    accept: 'application/json',
  },
  /* other custom settings */
  timeout: 10000,
};

const clientWithoutToken = axios.create(baseConfig);
clientWithoutToken.interceptors.response.use(
  async function (response) {
    // dismissLoading();
    return Promise.resolve(response);
  },
  async function (error) {
    return Promise.reject(error);
  },
);

export { clientWithoutToken };
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/api/apiWrapping.ts"), `import { client } from './client';
import { clientWithoutToken } from './clientWithoutToken';
import { logApi } from './apiUtils';
import { ApiProps } from './apiType';

const apiGetWithoutToken: <T = any>(props: ApiProps) => Promise<T> = async (
  props: ApiProps,
) => {
  try {
    const fullResponse = props?.fullResponse ?? false;
    const resHeaders = props?.resHeaders ?? false;
    const res = await clientWithoutToken.get(props.url, {
      ...props.config,
      headers: props?.headers,
    });

    logApi({
      nameFunction: 'apiGetWithoutToken',
      tags: props?.tags,
      body: props?.body,
      res: res,
    });

    return Promise.resolve(
      fullResponse ? res : resHeaders ? res?.headers : res?.data,
    );
  } catch (e: any) {
    if ((props.retry ?? 0) > 0) {
      return await apiGetWithoutToken({
        ...props,
        retry: props.retry ? props.retry - 1 : 0,
      });
    }

    if (e.response) {
      console.log('🚀 ~ apiGetWithoutToken ~ status:', e.response.status);
      console.log('🚀 ~ apiGetWithoutToken ~ data:', e.response.data);
    } else if (e.request) {
      console.log('🚀 ~ apiGetWithoutToken ~ request:', e.request);
    } else {
      console.log('🚀 ~ apiGetWithoutToken ~ message:', e.message);
    }
    const errData = e.response?.data ?? e.message;

    logApi({
      nameFunction: 'apiGetWithoutToken',
      tags: props?.tags,
      body: props?.body,
      e: errData,
    });

    const errorData = {
      status: e?.response?.status,
      message: errData || 'Terjadi Kesalahan',
      data: e?.response?.data,
    };

    return Promise.reject(errorData);
  }
};

const apiGet: <T = any>(props: ApiProps) => Promise<T> = async (
  props: ApiProps,
) => {
  try {
    const fullResponse = props?.fullResponse ?? false;
    const resHeaders = props?.resHeaders ?? false;
    const res = await client.get(props.url, {
      ...props.config,
      headers: props?.headers,
    });

    logApi({
      nameFunction: 'apiGet',
      tags: props?.tags,
      body: props?.body,
      res: res,
    });

    return Promise.resolve(
      fullResponse ? res : resHeaders ? res?.headers : res?.data,
    );
  } catch (e: any) {
    if ((props.retry ?? 0) > 0) {
      return await apiGet({
        ...props,
        retry: props.retry ? props.retry - 1 : 0,
      });
    }

    if (e.response) {
      console.log('🚀 ~ apiGet ~ status:', e.response.status);
      console.log('🚀 ~ apiGet ~ data:', e.response.data);
    } else if (e.request) {
      console.log('🚀 ~ apiGet ~ request:', e.request);
    } else {
      console.log('🚀 ~ apiGet ~ message:', e.message);
    }
    const errData = e.response?.data ?? e.message;

    logApi({
      nameFunction: 'apiGet',
      tags: props?.tags,
      body: props?.body,
      e: errData,
    });

    const errorData = {
      status: e?.response?.status,
      message: errData || 'Terjadi Kesalahan',
      data: e?.response?.data,
    };

    return Promise.reject(errorData);
  }
};

const apiPostWithoutToken: <T = any>(props: ApiProps) => Promise<T> = async (
  props: ApiProps,
) => {
  try {
    const fullResponse = props?.fullResponse ?? false;
    const res = await clientWithoutToken.post(props.url, props?.body, {
      ...props.config,
      headers: props?.headers,
    });
    console.log('🚀 ~ apiPostWithoutToken ~ res:', JSON.stringify(res));

    logApi({
      nameFunction: 'apiPostWithoutToken',
      tags: props?.tags,
      body: props?.body,
      res: res,
    });

    return Promise.resolve(fullResponse ? res : res.data);
  } catch (e: any) {
    if ((props.retry ?? 0) > 0) {
      return await apiPostWithoutToken({
        ...props,
        retry: props.retry ? props.retry - 1 : 0,
      });
    }

    if (e.response) {
      console.log('🚀 ~ apiPostWithoutToken ~ status:', e.response.status);
      console.log('🚀 ~ apiPostWithoutToken ~ data:', e.response.data);
    } else if (e.request) {
      console.log('🚀 ~ apiPostWithoutToken ~ request:', e.request);
    } else {
      console.log('🚀 ~ apiPostWithoutToken ~ message:', e.message);
    }
    const errData = e.response?.data ?? e.message;

    logApi({
      nameFunction: 'apiPostWithoutToken',
      tags: props?.tags,
      body: props?.body,
      e: errData,
    });

    const errorData = {
      status: e?.response?.status,
      message: errData || 'Terjadi Kesalahan',
      data: e?.response?.data,
    };

    return Promise.reject(errorData);
  }
};

const apiPost: <T = any>(props: ApiProps) => Promise<T> = async (
  props: ApiProps,
) => {
  try {
    const fullResponse = props?.fullResponse ?? false;
    const res = await client.post(props.url, props?.body, {
      ...props.config,
      headers: props?.headers,
    });

    logApi({
      nameFunction: 'apiPost',
      tags: props?.tags,
      body: props?.body,
      res: res,
    });

    return Promise.resolve(fullResponse ? res : res.data);
  } catch (e: any) {
    if ((props.retry ?? 0) > 0) {
      return await apiPost({
        ...props,
        retry: props.retry ? props.retry - 1 : 0,
      });
    }

    if (e.response) {
      console.log('🚀 ~ apiPost ~ status:', e.response.status);
      console.log('🚀 ~ apiPost ~ data:', e.response.data);
    } else if (e.request) {
      console.log('🚀 ~ apiPost ~ request:', e.request);
    } else {
      console.log('🚀 ~ apiPost ~ message:', e.message);
    }
    const errData = e.response?.data ?? e.message;

    logApi({
      nameFunction: 'apiPost',
      tags: props?.tags,
      body: props?.body,
      e: errData,
    });

    const errorData = {
      status: e?.response?.status,
      message: errData || 'Terjadi Kesalahan',
      data: e?.response?.data,
    };

    return Promise.reject(errorData);
  }
};

export { apiGet, apiGetWithoutToken, apiPost, apiPostWithoutToken };
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/api/index.ts"), `export * from './client';
export * from './clientWithoutToken';
export * from './apiWrapping';
export * from './apiType';
`);
    const navCommonStackDir = path_1.default.join(targetDir, "src/navigation/navigator/stack/common-stack");
    const navMainStackDir = path_1.default.join(targetDir, "src/navigation/navigator/stack/main-stack");
    const navStackDir = path_1.default.join(targetDir, "src/navigation/navigator/stack");
    const navNavigatorDir = path_1.default.join(targetDir, "src/navigation/navigator");
    const navRouteAppDir = path_1.default.join(targetDir, "src/navigation/route-app");
    fs_extra_1.default.mkdirSync(navCommonStackDir, { recursive: true });
    fs_extra_1.default.mkdirSync(navMainStackDir, { recursive: true });
    fs_extra_1.default.mkdirSync(navRouteAppDir, { recursive: true });
    // 1. common-stack
    fs_extra_1.default.writeFileSync(path_1.default.join(navCommonStackDir, "CommonStack.tsx"), `import { createStackNavigator } from '@react-navigation/stack';
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
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navCommonStackDir, "CommonStackParamList.d.ts"), `interface SplashScreenParams {}

type CommonStackParamList = {
  SplashScreen: SplashScreenParams;
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navCommonStackDir, "index.ts"), `export * from './CommonStack';\n`);
    // 2. main-stack
    fs_extra_1.default.writeFileSync(path_1.default.join(navMainStackDir, "MainStack.tsx"), `import { createStackNavigator } from '@react-navigation/stack';
import { useNavigator } from '@navigation/navigator';
import { HomeScreen } from '@modules';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

const Stack = createStackNavigator<MainStackParamList>();
type MainStackProps = {};

export const MainStack: React.FC<MainStackProps> = () => {
  const { screenListeners } = useNavigator();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenListeners={screenListeners}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name={'HomeScreen'} component={HomeScreen} />
      </Stack.Navigator>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navMainStackDir, "MainStackParamList.d.ts"), `type MainStackParamList = {
  HomeScreen: undefined;
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navMainStackDir, "index.ts"), `export * from './MainStack';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navStackDir, "index.ts"), `export * from './common-stack';\nexport * from './main-stack';\n`);
    // navigator outer files
    fs_extra_1.default.writeFileSync(path_1.default.join(navNavigatorDir, "index.ts"), `export * from './Navigator';
export * from './useNavigator';
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navNavigatorDir, "Navigator.tsx"), `import { createStackNavigator } from '@react-navigation/stack';
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
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navNavigatorDir, "screen.ts"), `import { NavigatorScreenParams } from '@react-navigation/native';

export type ParamList = {
  Common: NavigatorScreenParams<CommonStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navNavigatorDir, "type.d.ts"), `type IRouteRef = {
  screenName: string;
  screenStack: string[];
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navNavigatorDir, "useNavigator.ts"), `import { useNavigation } from '@react-navigation/native';
import { useRef } from 'react';

export const useNavigator = () => {
  const navigation: any = useNavigation();
  const routeRef = useRef<IRouteRef>({ screenStack: [], screenName: '' });

  const screenListeners = () => ({
    state: async () => {
      const currentRouteName = navigation?.getCurrentRoute()?.name;
      routeRef.current.screenName = currentRouteName;
      routeRef.current.screenStack.push(currentRouteName);
      console.log(
        '🚀 ~ file: useNavigator.ts ~ state: ~ currentRouteName:',
        currentRouteName,
      );
    },
  });

  return { screenListeners };
};
`);
    // route-app outer files
    fs_extra_1.default.writeFileSync(path_1.default.join(navRouteAppDir, "index.ts"), `export * from './RouteApp';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navRouteAppDir, "styles.ts"), `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  flex1: { flex: 1 },
});
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navRouteAppDir, "RouteApp.tsx"), `import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { styles } from './styles';
import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { Navigator } from '@navigation/navigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const RouteApp = () => {
  const MyTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: 'white',
    },
  };

  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <StatusBar barStyle={'dark-content'} />

        <GestureHandlerRootView style={styles.flex1}>
          <NavigationContainer theme={MyTheme}>
            <Navigator />
          </NavigationContainer>
        </GestureHandlerRootView>
      </SafeAreaProvider>
    </QueryClientProvider>
  );
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/navigation/index.ts"), `export * from './navigator';\nexport * from './route-app';\n`);
    const mainDir = path_1.default.join(targetDir, "src/modules/main");
    const homeDir = path_1.default.join(mainDir, "home");
    fs_extra_1.default.mkdirSync(homeDir, { recursive: true });
    fs_extra_1.default.writeFileSync(path_1.default.join(homeDir, "styles.ts"), `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 60,
  },
  header: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 40,
    position: 'relative',
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 30,
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 8,
    textAlign: 'center',
  },
  controlSection: {
    paddingHorizontal: 24,
    gap: 16,
  },
  btnOutline: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  btnOutlineText: {
    fontWeight: '600',
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    opacity: 0.5,
  },
  footerText: {
    fontSize: 12,
    color: 'gray',
    marginTop: 4,
  },
});
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(homeDir, "HomeScreen.tsx"), `import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { styles } from './styles';
import useHomeScreen from './useHomeScreen';

export const HomeScreen = () => {
  const {
    i18n,
    theme,
    scheme,
    icon,
    bundleId,
    ENV,
    translate,
    toggleTheme,
    toggleLanguage,
  } = useHomeScreen();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Image source={icon} style={styles.imagePlaceholder} />

        <Text style={[styles.title, { color: theme.text }]}>
          {translate('welcome:greeting')}
        </Text>

        <Text style={styles.subtitle}>{translate('welcome:description')}</Text>
      </View>

      <View style={styles.controlSection}>
        <TouchableOpacity
          style={[styles.btnOutline, { borderColor: theme.text }]}
          onPress={toggleTheme}
        >
          <Text style={[styles.btnOutlineText, { color: theme.text }]}>
            {scheme === 'dark'
              ? \`☀️ \${translate('welcome:switchLightMode')}\`
              : \`🌙 \${translate('welcome:switchDarkMode')}\`}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.btnOutline, { borderColor: theme.text }]}
          onPress={toggleLanguage}
        >
          <Text style={[styles.btnOutlineText, { color: theme.text }]}>
            🌐{' '}
            {i18n.language === 'id'
              ? translate('welcome:indonesian')
              : translate('welcome:english')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{ENV}</Text>
        <Text style={styles.footerText}>{bundleId}</Text>
      </View>
    </View>
  );
};

`);
    fs_extra_1.default.writeFileSync(path_1.default.join(homeDir, "useHomeScreen.ts"), `import { useTheme, useTypedTranslation } from '@hooks';
import Config from 'react-native-config';

const AppIconDev = require('@assets/app-icon/development/app-icon.png');
const AppIconProd = require('@assets/app-icon/production/app-icon.png');

const useHomeScreen = () => {
  const { translate, i18n } = useTypedTranslation();
  const { theme, scheme, toggleTheme } = useTheme();

  const ENV = Config.ENV ?? 'unknown';

  const getAppIcon = () => {
    switch (ENV) {
      case 'development':
        return AppIconDev;
      case 'production':
        return AppIconProd;
      default:
        return AppIconProd;
    }
  };

  const toggleLanguage = () => {
    const nextLang = i18n.language === 'en' ? 'id' : 'en';
    i18n.changeLanguage(nextLang);
  };

  return {
    i18n,
    theme,
    scheme,
    icon: getAppIcon(),
    bundleId: Config.BUNDLE_ID,
    ENV,
    translate,
    toggleTheme,
    toggleLanguage,
  };
};

export default useHomeScreen;
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(homeDir, "index.ts"), `export * from './HomeScreen';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(mainDir, "index.ts"), `export * from './home';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/modules/index.ts"), `export * from './main';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/theme/light.ts"), `export const lightTheme = {
  background: '#ffffff',
  text: '#000000'
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/theme/dark.ts"), `export const darkTheme = {
  background: '#000000',
  text: '#ffffff'
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/theme/index.ts"), `export * from './light';\nexport * from './dark';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/hooks/useTheme.ts"), `import { useEffect } from 'react';
import { useColorScheme, Appearance, ColorSchemeName } from 'react-native';
import { lightTheme, darkTheme } from '@theme';
import { handlerGetItem, handlerSetItem } from '@constants';

const USER_THEME = 'USER_THEME';

export const useTheme = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const savedTheme = handlerGetItem(USER_THEME) as ColorSchemeName;

    if (savedTheme && savedTheme !== scheme) {
      Appearance.setColorScheme(savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextScheme = scheme === 'dark' ? 'light' : 'dark';

    Appearance.setColorScheme(nextScheme);

    handlerSetItem(USER_THEME, nextScheme);
  };

  return { theme, scheme, toggleTheme };
};

`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/hooks/index.ts"), `export * from './useTheme';\nexport *from './i18n-hooks';\nexport * from './navigation-hooks';\n`);
    const i18nHooksDir = path_1.default.join(targetDir, "src/hooks/i18n-hooks");
    fs_extra_1.default.mkdirSync(i18nHooksDir, { recursive: true });
    fs_extra_1.default.writeFileSync(path_1.default.join(i18nHooksDir, "i18n.ts"), `import { initReactI18next } from 'react-i18next';
import { handlerGetItem, handlerSetItem } from '@constants';
import {
  defaultLanguage,
  defaultNameSpace,
  keySeparator,
  nameSpaceNames,
  resources,
} from '@i18n';
import i18n, { i18n as i18nApi, LanguageDetectorAsyncModule } from 'i18next';

const USER_LANGUAGE = 'USER_LANGUAGE';

const languageDetectorPlugin: LanguageDetectorAsyncModule = {
  type: 'languageDetector',
  async: true,
  init: () => {},
  detect: async () => {
    try {
      const language = handlerGetItem(USER_LANGUAGE);

      if (language) {
        return language;
      }

      return 'id';
    } catch (error) {
      console.log('Error reading language', error);
      return 'id';
    }
  },
  cacheUserLanguage: async (language: string) => {
    try {
      await handlerSetItem(USER_LANGUAGE, language);
    } catch (error) {
      console.log('Error saving language', error);
    }
  },
};

export function initI18n(locale?: string): i18nApi {
  i18n
    .use(initReactI18next)
    .use(languageDetectorPlugin)
    .init({
      ns: nameSpaceNames,
      defaultNS: defaultNameSpace,
      lng: locale,
      resources,
      fallbackLng: defaultLanguage,
      keySeparator,
      interpolation: { escapeValue: false },
      supportedLngs: Object.keys(resources),
    });
  return i18n;
}
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(i18nHooksDir, "useTypedTranslation.ts"), `import {
  useTranslation,
  UseTranslationOptions,
  UseTranslationResponse,
} from 'react-i18next';
import { NameSpace, TranslationKey } from '@i18n';
import { i18n, TOptions, TFunction, Namespace } from 'i18next';

type TypedNameSpaceOptions = TOptions & { ns?: NameSpace; count?: number };
export type TypedTranslationOptions =
  | string
  | TypedNameSpaceOptions
  | undefined;

type TFunctionParams<N extends Namespace> = Parameters<TFunction<N, undefined>>;

type UseTypedTranslationResponse<N extends Namespace> = {
  translate: (
    key: TranslationKey,
    options?: TypedTranslationOptions,
    defaultValue?: TFunctionParams<N>[1],
  ) => string;
  i18n: i18n;
  ready: boolean;
};

export function useTypedTranslation<N extends Namespace>(
  ns?: N,
  options?: UseTranslationOptions<undefined>,
): UseTypedTranslationResponse<N> {
  const response: UseTranslationResponse<NameSpace, undefined> = useTranslation(
    ns,
    options,
  );

  function privateT(
    key: TranslationKey,
    options?: TypedTranslationOptions,
    defaultValue?: TFunctionParams<N>[1],
  ) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return response.t(key, defaultValue, options);
  }

  return {
    ...response,
    translate: privateT,
  };
}
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(i18nHooksDir, "index.ts"), `export * from './i18n';
    export * from './useTypedTranslation';
`);
    const navHooksDir = path_1.default.join(targetDir, "src/hooks/navigation-hooks");
    fs_extra_1.default.mkdirSync(navHooksDir, { recursive: true });
    fs_extra_1.default.writeFileSync(path_1.default.join(navHooksDir, "global.d.ts"), `type VoidCallBack = () => void;
type CallBack<T> = () => T;
type CallBackWithParams<T, U> = (data: U) => T;
type CallBackWith2Params<T, U, V> = (data1: U, data2: V) => T;
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navHooksDir, "index.ts"), `export * from './useNavigation';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(navHooksDir, "useNavigation.ts"), `import { ParamList } from '@navigation/navigator/screen';
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
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/constants/functional.ts"), `import { Dimensions } from 'react-native';
import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({
  id: 'app-storage',
  encryptionKey: 'dummyKey123',
  encryptionType: 'AES-256',
  mode: 'multi-process',
  readOnly: false,
});

const handlerGetItem = (params: string) => {
  try {
    return storage.getString(params);
  } catch (error) {}
};

const handlerGetAndParseJSON = <T>(key: string): T | null => {
  try {
    const item = storage.getString(key);

    if (item) {
      return JSON.parse(item) as T;
    }
    return null;
  } catch (error) {
    console.error(\`Failed to parse JSON from storage for key "\${key}":\`, error);
    return null;
  }
};

const handlerSetItem = async (key: string, value: string) => {
  try {
    await storage.set(key, value);
  } catch (error) {}
};

const handlerRemoveItem = async (key: string) => {
  try {
    await storage.remove(key);
  } catch (error) {}
};

const handlerClearItem = async () => {
  try {
    await storage.clearAll();
  } catch (error) {}
};

const screenWidth = Dimensions.get('screen').width;
const screenHeight = Dimensions.get('screen').height;
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

export {
  screenWidth,
  screenHeight,
  windowWidth,
  windowHeight,
  handlerGetItem,
  handlerGetAndParseJSON,
  handlerSetItem,
  handlerRemoveItem,
  handlerClearItem,
};
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/constants/globalStyles.ts"), `import { StyleSheet } from 'react-native';

export const globalStyles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  gap10: {
    gap: 10,
  },
  gap20: {
    gap: 20,
  },
});
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/constants/index.ts"), `export * from './functional';
export * from './keys';
export * from './url';
export * from './globalStyles';
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/constants/keys.ts"), `export const Keys = {};\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/constants/url.ts"), `import Config from 'react-native-config';

export const BASE_URL = Config.API_URL;
export const API_PREFIX = 'api';
export const AUTH_PREFIX = 'auth';

export const URL_PATH = {
  // MARK: AUTH
  auth: {
    register: \`\${API_PREFIX}/\${AUTH_PREFIX}/register\`,
  },
};
`);
    const welcomeDir = path_1.default.join(targetDir, "src/i18n/welcome");
    fs_extra_1.default.mkdirSync(welcomeDir, { recursive: true });
    fs_extra_1.default.writeFileSync(path_1.default.join(welcomeDir, "id.json"), `{\n  "welcome:greeting": "Selamat Datang",
  "welcome:description": "Alat CLI profesional siap produksi dan sistem boilerplate canggih untuk React Native",
  "welcome:switchLightMode": "Beralih ke Mode Terang",
  "welcome:switchDarkMode": "Beralih ke Mode Gelap",
  "welcome:indonesian": "Bahasa Indonesia",
  "welcome:english": "Bahasa Inggris"\n}\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(welcomeDir, "en.json"), `{\n  "welcome:greeting": "Welcome",
  "welcome:description": "Production-grade CLI tool and boilerplate system for React Native",
  "welcome:switchLightMode": "Switch to Light Mode",
  "welcome:switchDarkMode": "Switch to Dark Mode",
  "welcome:indonesian": "Indonesian",
  "welcome:english": "English"\n}\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(welcomeDir, "index.ts"), `import en from './en.json';
import id from './id.json';

export { en, id };
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/i18n/index.ts"), `import * as welcome from './welcome';

const loadedNameSpaces = {
  welcome,
};

export const defaultNameSpace: NameSpace = 'welcome';
export type SupportedLocale = 'en' | 'id';

export const defaultLanguage: SupportedLocale = 'en';
export const keySeparator = '.';

export type NameSpace = keyof typeof loadedNameSpaces;
type LoadedResources = { [locale in SupportedLocale]: Translation };

type Translation = { [key: string]: string | Translation };

type Translations = {
  [nameSpace in NameSpace]: Translation;
};

type I18nResource = {
  [locale in SupportedLocale]: Translations;
};

function adaptLoadedResources(
  inputResources: Record<string, Record<SupportedLocale, Translation>>,
): I18nResource {
  const flatResources = Object.entries(inputResources) as unknown as [
    NameSpace,
    LoadedResources,
  ][];
  return flatResources.reduce<I18nResource>(
    (accumulator, [nameSpace, locales]) => {
      const transformedLocales = Object.entries(locales) as [
        SupportedLocale,
        Translation,
      ][];
      transformedLocales.forEach(([locale, translation]) => {
        if (!accumulator[locale]) {
          accumulator[locale] = {} as typeof loadedNameSpaces;
        }

        accumulator[locale][nameSpace] = transformTranslation(translation);
      });

      return accumulator;
    },
    {} as I18nResource,
  );
}

function transformTranslation(translation: Translation): Translation {
  return Object.keys(translation).reduce<Translation>((acc, key) => {
    const formattedKey = key.split(':')[1]; // Remove namespace from key
    acc[formattedKey] =
      typeof translation[key] === 'object'
        ? transformTranslation(translation[key] as Translation)
        : translation[key];
    return acc;
  }, {});
}

type AllLoadedNameSpaceType = (typeof loadedNameSpaces)[NameSpace];
type AllLoadedNameSpaceTypeByLanguage =
  AllLoadedNameSpaceType[typeof defaultLanguage];
type UnionToIntersection<U> = (
  U extends unknown ? (k: U) => void : never
) extends (k: infer I) => void
  ? I
  : never;

export type RecursiveKeyOf<TObj extends Record<string, unknown>> = {
  [TKey in keyof TObj & (string | number)]: TObj[TKey] extends unknown[]
    ? \`\${TKey}\`
    : TObj[TKey] extends Record<string, unknown>
    ? \`\${TKey}\${typeof keySeparator}\${RecursiveKeyOf<TObj[TKey]>}\`
    : \`\${TKey}\`;
}[keyof TObj & (string | number)];

type FlattenTypedKey = UnionToIntersection<AllLoadedNameSpaceTypeByLanguage>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const resources: I18nResource = adaptLoadedResources(loadedNameSpaces);
export const nameSpaceNames = Object.keys(loadedNameSpaces) as NameSpace[];

// to type translation keys
export type TranslationKey = RecursiveKeyOf<FlattenTypedKey>;

export const nameSpaces: Record<NameSpace, NameSpace> = nameSpaceNames.reduce(
  (record, ns) => Object.assign(record, { [ns]: ns }),
  {} as Record<NameSpace, NameSpace>,
);
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/components/base/index.ts"), `// Base components\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/components/index.ts"), `export * from './base';\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "src/types/index.ts"), `// App Types\n`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "App.tsx"), `/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import 'react-native-gesture-handler';
import { RouteApp } from '@navigation/route-app';
import { useEffect } from 'react';
import { hideSplash } from 'react-native-splash-view';

function App() {
  useEffect(() => {
    hideSplash();
  }, []);

  return <RouteApp />;
}

export default App;
`);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "index.js"), `/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initI18n } from './src/hooks';

initI18n();

AppRegistry.registerComponent(appName, () => App);
`);
    // Update configurations
    const babelPath = path_1.default.join(targetDir, "babel.config.js");
    if (fs_extra_1.default.existsSync(babelPath)) {
        let babelStr = fs_extra_1.default.readFileSync(babelPath, "utf8");
        babelStr = babelStr.replace("module.exports = {", `module.exports = {
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@api': './src/api',
          '@assets': './src/assets',
          '@constants': './src/constants',
          '@components': './src/components',
          '@hooks': './src/hooks',
          '@modules': './src/modules',
          '@navigation': './src/navigation',
          '@i18n': './src/i18n',
          '@theme': './src/theme',
        },
      },
    ],
  ],`);
        fs_extra_1.default.writeFileSync(babelPath, babelStr);
    }
    const pkgPath = path_1.default.join(targetDir, "package.json");
    if (fs_extra_1.default.existsSync(pkgPath)) {
        const pkg = JSON.parse(fs_extra_1.default.readFileSync(pkgPath, "utf8"));
        pkg.name = folderName;
        pkg.scripts = pkg.scripts || {};
        pkg.scripts["env:dev"] = "node scripts/apply-env.js development";
        pkg.scripts["env:prod"] = "node scripts/apply-env.js production";
        fs_extra_1.default.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
    }
    const appJsonPath = path_1.default.join(targetDir, "app.json");
    if (fs_extra_1.default.existsSync(appJsonPath)) {
        const appJson = JSON.parse(fs_extra_1.default.readFileSync(appJsonPath, "utf8"));
        appJson.name = projectName;
        appJson.displayName = appDisplayName;
        fs_extra_1.default.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));
    }
    // 6. ENV FILES
    const devEnv = `APP_NAME=${appDisplayName}
APP_NAME_PREFIX=[DEV]
BUNDLE_ID=${bundleId}.dev
BUNDLE_ID_SUFFIX=.dev
API_URL=https://dev.api.example.com
ENV=development
APP_ICON=AppIconDev
`;
    const prodEnv = `APP_NAME=${appDisplayName}
APP_NAME_PREFIX=
BUNDLE_ID=${bundleId}
BUNDLE_ID_SUFFIX=
API_URL=https://api.example.com
ENV=production
APP_ICON=AppIcon
`;
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, ".env.development"), devEnv);
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, ".env.production"), prodEnv);
    const gitIgnorePath = path_1.default.join(targetDir, ".gitignore");
    if (fs_extra_1.default.existsSync(gitIgnorePath)) {
        fs_extra_1.default.appendFileSync(gitIgnorePath, "\n# dotEnv files\n.env*\n");
    }
    // Phase 3 Native Config Applied inline
    // --- PHASE 3: NATIVE ENVIRONMENTS (FLAVORS & SCHEMES) ---
    console.log(chalk_1.default.cyan("\nConfiguring Native Environments..."));
    const devSource = path_1.default.join(__dirname, "../src/assets/app-icon/ios/development/AppIcon~ios-marketing.png");
    const prodSource = path_1.default.join(__dirname, "../src/assets/app-icon/ios/production/AppIcon~ios-marketing.png");
    const targetIconsFolderDev = path_1.default.join(targetDir, "src/assets/app-icon/development");
    const targetIconsFolderProd = path_1.default.join(targetDir, "src/assets/app-icon/production");
    if (fs_extra_1.default.existsSync(devSource)) {
        fs_extra_1.default.mkdirSync(targetIconsFolderDev, { recursive: true });
        fs_extra_1.default.copyFileSync(devSource, path_1.default.join(targetIconsFolderDev, "app-icon.png"));
    }
    if (fs_extra_1.default.existsSync(prodSource)) {
        fs_extra_1.default.mkdirSync(targetIconsFolderProd, { recursive: true });
        fs_extra_1.default.copyFileSync(prodSource, path_1.default.join(targetIconsFolderProd, "app-icon.png"));
    }
    // 1. Android productFlavors
    const rootAndroidBuildGradlePath = path_1.default.join(targetDir, "android/build.gradle");
    if (fs_extra_1.default.existsSync(rootAndroidBuildGradlePath)) {
        let rootGradle = fs_extra_1.default.readFileSync(rootAndroidBuildGradlePath, "utf8");
        rootGradle = rootGradle.replace(/compileSdkVersion\s*=\s*\d+/g, "compileSdkVersion = 36");
        rootGradle = rootGradle.replace(/compileSdk\s*=\s*\d+/g, "compileSdk = 36");
        fs_extra_1.default.writeFileSync(rootAndroidBuildGradlePath, rootGradle);
    }
    const androidBuildGradlePath = path_1.default.join(targetDir, "android/app/build.gradle");
    if (fs_extra_1.default.existsSync(androidBuildGradlePath)) {
        let gradle = fs_extra_1.default.readFileSync(androidBuildGradlePath, "utf8");
        // Inject react-native-config map
        const extBlock = `
    project.ext.envConfigFiles = [
      devAppDebug: ".env.development",
      devAppRelease: ".env.development",
      appDebug: ".env.production",
      appRelease: ".env.production",
    ]
    project.ext.defaultEnvFile = ".env.development" 

    apply from: project(":react-native-config").projectDir.getPath() + "/dotenv.gradle"
    `;
        gradle = gradle.replace('apply plugin: "com.android.application"', 'apply plugin: "com.android.application"\n' + extBlock);
        // Inject flavorDimensions
        if (!gradle.includes("flavorDimensions")) {
            gradle = gradle.replace(/defaultConfig\s*\{([\s\S]*?)\}/, (match, content) => {
                if (content.includes("build_config_package"))
                    return match;
                return `defaultConfig {${content.trim()}
            resValue "string", "build_config_package", "${bundleId}"
          }`;
            });
            gradle = gradle.replace(/defaultConfig\s*\{[\s\S]*?\}/, (match) => {
                return `${match}
        flavorDimensions "env"
        productFlavors {
            app {
                dimension "env"
                applicationIdSuffix ""
                resValue "string", "app_name", "${appDisplayName}"
                resValue "string", "build_config_package", "${bundleId}"
            }
            devApp {
                dimension "env"
                applicationIdSuffix ".dev"
                resValue "string", "app_name", "[DEV] ${appDisplayName}"
                resValue "string", "build_config_package", "${bundleId}"
            }
        }`;
            });
        }
        if (!gradle.includes("debuggableVariants")) {
            gradle = gradle.replace("autolinkLibrariesWithApp()", 'debuggableVariants = ["devAppDebug", "appDebug"]\n\n    autolinkLibrariesWithApp()');
        }
        fs_extra_1.default.writeFileSync(androidBuildGradlePath, gradle);
    }
    // 2. Android Folder Copies
    const cliIconsAndroidDev = path_1.default.join(__dirname, "../src/assets/app-icon/android/development/res");
    const cliIconsAndroidProd = path_1.default.join(__dirname, "../src/assets/app-icon/android/production/res");
    const targetAndroidDev = path_1.default.join(targetDir, "android/app/src/devApp/res");
    const targetAndroidProd = path_1.default.join(targetDir, "android/app/src/app/res");
    if (fs_extra_1.default.existsSync(cliIconsAndroidDev)) {
        fs_extra_1.default.cpSync(cliIconsAndroidDev, targetAndroidDev, { recursive: true });
    }
    if (fs_extra_1.default.existsSync(cliIconsAndroidProd)) {
        fs_extra_1.default.cpSync(cliIconsAndroidProd, targetAndroidProd, { recursive: true });
    }
    // 3. iOS Schemes
    const iosProjectName = projectName;
    const xcschemesPath = path_1.default.join(targetDir, "ios", iosProjectName + ".xcodeproj", "xcshareddata", "xcschemes");
    const defaultSchemePath = path_1.default.join(xcschemesPath, iosProjectName + ".xcscheme");
    if (fs_extra_1.default.existsSync(defaultSchemePath)) {
        const originalScheme = fs_extra_1.default.readFileSync(defaultSchemePath, "utf8");
        // Kita buat bash script yang rapi dulu (menggunakan dirname $WORKSPACE_PATH untuk dapat path absolut 'ios/')
        const devScriptText = `PROJECT_ROOT=$(dirname &quot;$WORKSPACE_PATH&quot;)&#10;echo &quot;.env.development&quot; &gt; /tmp/envfile&#10;cp &quot;$PROJECT_ROOT/${iosProjectName}/Info-Dev.plist&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Info.plist&quot;&#10;rm -rf &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;&#10;cp -R &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIconDev.appiconset&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;`;
        const prodScriptText = `PROJECT_ROOT=$(dirname &quot;$WORKSPACE_PATH&quot;)&#10;echo &quot;.env.production&quot; &gt; /tmp/envfile&#10;cp &quot;$PROJECT_ROOT/${iosProjectName}/Info-Prod.plist&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Info.plist&quot;&#10;rm -rf &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;&#10;cp -R &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIconProd.appiconset&quot; &quot;$PROJECT_ROOT/${iosProjectName}/Images.xcassets/AppIcon.appiconset&quot;`;
        // Pre-action Dev
        const preActionDev = `
      <PreActions>
         <ExecutionAction
            ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">
            <ActionContent
               title = "Run Script"
               scriptText = "${devScriptText}">
            </ActionContent>
         </ExecutionAction>
      </PreActions>`;
        // Pre-action Prod
        const preActionProd = `
      <PreActions>
         <ExecutionAction
            ActionType = "Xcode.IDEStandardExecutionActionsCore.ExecutionActionType.ShellScriptAction">
            <ActionContent
               title = "Run Script"
               scriptText = "${prodScriptText}">
            </ActionContent>
         </ExecutionAction>
      </PreActions>`;
        const devScheme = originalScheme.replace(/<BuildAction[^>]*>/, (match) => match + preActionDev);
        const prodScheme = originalScheme.replace(/<BuildAction[^>]*>/, (match) => match + preActionProd);
        fs_extra_1.default.writeFileSync(path_1.default.join(xcschemesPath, "Dev App.xcscheme"), devScheme);
        fs_extra_1.default.writeFileSync(path_1.default.join(xcschemesPath, "App.xcscheme"), prodScheme);
        fs_extra_1.default.unlinkSync(defaultSchemePath);
    }
    // 4. iOS project.pbxproj patching
    const pbxprojPath = path_1.default.join(targetDir, "ios", iosProjectName + ".xcodeproj", "project.pbxproj");
    if (fs_extra_1.default.existsSync(pbxprojPath)) {
        let pbx = fs_extra_1.default.readFileSync(pbxprojPath, "utf8");
        // Set default bundle ID on level pbxproj using literal string
        pbx = pbx.replace(/PRODUCT_BUNDLE_IDENTIFIER\s*=\s*.*?;/g, `PRODUCT_BUNDLE_IDENTIFIER = "${bundleId}";`);
        fs_extra_1.default.writeFileSync(pbxprojPath, pbx);
    }
    // 5. Update iOS Info.plist for App Name & Bundle ID (Generate Dev & Prod)
    console.log(chalk_1.default.cyan("\nGenerating Info.plist for Dev and Prod..."));
    const infoPlistPath = path_1.default.join(targetDir, "ios", iosProjectName, "Info.plist");
    const infoDevPlistPath = path_1.default.join(targetDir, "ios", iosProjectName, "Info-Dev.plist");
    const infoProdPlistPath = path_1.default.join(targetDir, "ios", iosProjectName, "Info-Prod.plist");
    if (fs_extra_1.default.existsSync(infoPlistPath)) {
        console.log(chalk_1.default.green("Base Info.plist found! Injecting environment setups..."));
        let basePlist = fs_extra_1.default.readFileSync(infoPlistPath, "utf8");
        // Helper: Function to replace values, or create new ones if tags don't exist
        const setPlistValue = (plistStr, key, value) => {
            const regex = new RegExp(`<key>${key}</key>\\s*<string>.*?</string>`);
            if (regex.test(plistStr)) {
                return plistStr.replace(regex, `<key>${key}</key>\n\t<string>${value}</string>`);
            }
            else {
                // If not found, inject right below the first <dict>
                return plistStr.replace("<dict>", `<dict>\n\t<key>${key}</key>\n\t<string>${value}</string>`);
            }
        };
        // --- CREATE INFO-PROD.PLIST ---
        let prodPlist = setPlistValue(basePlist, "CFBundleDisplayName", appDisplayName);
        prodPlist = setPlistValue(prodPlist, "CFBundleIdentifier", bundleId);
        fs_extra_1.default.writeFileSync(infoProdPlistPath, prodPlist);
        console.log(chalk_1.default.green(" -> Info-Prod.plist successfully created"));
        // --- CREATE INFO-DEV.PLIST ---
        let devPlist = setPlistValue(basePlist, "CFBundleDisplayName", `[DEV] ${appDisplayName}`);
        devPlist = setPlistValue(devPlist, "CFBundleIdentifier", `${bundleId}.dev`);
        fs_extra_1.default.writeFileSync(infoDevPlistPath, devPlist);
        console.log(chalk_1.default.green(" -> Info-Dev.plist successfully created"));
        // Set the main Info.plist to the default Production version.
        fs_extra_1.default.writeFileSync(infoPlistPath, prodPlist);
    }
    else {
        // If the path is wrong, the script will shout in the terminal!
        console.error(chalk_1.default.red(`\nWARNING: Info.plist NOT FOUND at path: ${infoPlistPath}`));
        console.error(chalk_1.default.yellow("Make sure the iOS folder name matches the projectName."));
    }
    // (ENV organically generated natively mapping AppIcon and BundleId above)
    // 6. iOS Folder Copies
    console.log(chalk_1.default.cyan("Setting up iOS App Icons (Dev & Prod Masters)..."));
    const cliIconsIosDev = path_1.default.join(__dirname, "../src/assets/app-icon/ios/development");
    const cliIconsIosProd = path_1.default.join(__dirname, "../src/assets/app-icon/ios/production");
    // Target folder in iOS project
    const targetIosDev = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "AppIconDev.appiconset");
    const targetIosProdMaster = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "AppIconProd.appiconset");
    const targetIosDefault = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "AppIcon.appiconset");
    if (fs_extra_1.default.existsSync(cliIconsIosDev)) {
        fs_extra_1.default.cpSync(cliIconsIosDev, targetIosDev, { recursive: true });
    }
    if (fs_extra_1.default.existsSync(cliIconsIosProd)) {
        // Create Prod Storage
        fs_extra_1.default.cpSync(cliIconsIosProd, targetIosProdMaster, { recursive: true });
        // Set the initial AppIcon using the Prod version
        fs_extra_1.default.cpSync(cliIconsIosProd, targetIosDefault, { recursive: true });
    }
    // 7. Adjust package.json scripts
    const pkgJsonPath = path_1.default.join(targetDir, "package.json");
    if (fs_extra_1.default.existsSync(pkgJsonPath)) {
        const pkg = JSON.parse(fs_extra_1.default.readFileSync(pkgJsonPath, "utf8"));
        delete pkg.scripts["env:dev"];
        delete pkg.scripts["env:prod"];
        pkg.scripts["android:dev"] =
            `react-native run-android --mode=devAppDebug --appId=${bundleId}.dev`;
        pkg.scripts["android:prod"] =
            `react-native run-android --mode=appDebug --appId=${bundleId}`;
        pkg.scripts["ios:dev"] = 'react-native run-ios --scheme "Dev App"';
        pkg.scripts["ios:prod"] = 'react-native run-ios --scheme "App"';
        fs_extra_1.default.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2));
    }
    const tsConfigPath = path_1.default.join(targetDir, "tsconfig.json");
    if (fs_extra_1.default.existsSync(tsConfigPath)) {
        const tsConfigObj = {
            extends: "@react-native/typescript-config",
            compilerOptions: {
                jsx: "react-native",
                baseUrl: ".",
                esModuleInterop: true,
                strict: true,
                strictFunctionTypes: true,
                types: ["jest"],
                paths: {
                    "@api": ["src/api"],
                    "@api/*": ["src/api/*"],
                    "@assets": ["src/assets"],
                    "@assets/*": ["src/assets/*"],
                    "@constants": ["src/constants"],
                    "@constants/*": ["src/constants/*"],
                    "@components": ["src/components"],
                    "@components/*": ["src/components/*"],
                    "@hooks": ["src/hooks"],
                    "@hooks/*": ["src/hooks/*"],
                    "@modules": ["src/modules"],
                    "@modules/*": ["src/modules/*"],
                    "@navigation": ["src/navigation"],
                    "@navigation/*": ["src/navigation/*"],
                    "@i18n": ["src/i18n"],
                    "@i18n/*": ["src/i18n/*"],
                    "@theme": ["src/theme"],
                    "@theme/*": ["src/theme/*"],
                },
            },
            include: ["**/*.ts", "**/*.tsx"],
            exclude: ["**/node_modules", "**/Pods"],
        };
        fs_extra_1.default.writeFileSync(tsConfigPath, JSON.stringify(tsConfigObj, null, 2));
    }
    // --- PHASE 4: SPLASH SCREEN ---
    console.log(chalk_1.default.cyan("\nConfiguring Splash Screen..."));
    const splashSource = path_1.default.join(__dirname, "../src/assets/app-icon/ios/production/AppIcon~ios-marketing.png");
    const targetAppIconPath = path_1.default.join(targetDir, "src/assets/icons/production/app_icon.png");
    const targetSplashPath = path_1.default.join(targetDir, "src/assets/images/splash.png");
    if (fs_extra_1.default.existsSync(splashSource)) {
        // Ensure production app icon exists as a 512x512 fallback
        fs_extra_1.default.mkdirSync(path_1.default.dirname(targetAppIconPath), { recursive: true });
        await (0, sharp_1.default)(splashSource)
            .resize(512, 512, { fit: "inside" })
            .toFile(targetAppIconPath);
        // Copy to splash.png base
        fs_extra_1.default.mkdirSync(path_1.default.dirname(targetSplashPath), { recursive: true });
        fs_extra_1.default.copyFileSync(splashSource, targetSplashPath);
        // Generate Android densities using sharp
        const densities = [
            { name: "drawable-mdpi", size: 320 },
            { name: "drawable-hdpi", size: 480 },
            { name: "drawable-xhdpi", size: 720 },
            { name: "drawable-xxhdpi", size: 960 },
            { name: "drawable-xxxhdpi", size: 1280 },
        ];
        for (const d of densities) {
            const dirPath = path_1.default.join(targetDir, "android/app/src/main/res", d.name);
            fs_extra_1.default.mkdirSync(dirPath, { recursive: true });
            await (0, sharp_1.default)(targetSplashPath)
                .resize(d.size, d.size, { fit: "inside" })
                .toFile(path_1.default.join(dirPath, "splash.png"));
        }
    }
    else {
        console.warn("Source splash icon not found at " + splashSource);
    }
    // Android launch_screen.xml
    const launchScreenXml = `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:background="@android:color/white">

    <ImageView
        android:layout_width="120dp"
        android:layout_height="120dp"
        android:layout_centerInParent="true"
        android:src="@drawable/splash"
        android:scaleType="centerInside" />
</RelativeLayout>`;
    const layoutDir = path_1.default.join(targetDir, "android/app/src/main/res/layout");
    fs_extra_1.default.mkdirSync(layoutDir, { recursive: true });
    fs_extra_1.default.writeFileSync(path_1.default.join(layoutDir, "launch_screen.xml"), launchScreenXml);
    // iOS Splash.imageset
    if (fs_extra_1.default.existsSync(splashSource)) {
        const splashImagesetDir = path_1.default.join(targetDir, "ios", iosProjectName, "Images.xcassets", "Splash.imageset");
        fs_extra_1.default.mkdirSync(splashImagesetDir, { recursive: true });
        const contentsJson = {
            images: [
                { idiom: "universal", filename: "splash.png", scale: "1x" },
                { idiom: "universal", filename: "splash@2x.png", scale: "2x" },
                { idiom: "universal", filename: "splash@3x.png", scale: "3x" },
            ],
            info: { author: "xcode", version: 1 },
        };
        fs_extra_1.default.writeFileSync(path_1.default.join(splashImagesetDir, "Contents.json"), JSON.stringify(contentsJson, null, 2));
        await (0, sharp_1.default)(splashSource)
            .resize(120, 120, { fit: "inside" })
            .toFile(path_1.default.join(splashImagesetDir, "splash.png"));
        await (0, sharp_1.default)(splashSource)
            .resize(240, 240, { fit: "inside" })
            .toFile(path_1.default.join(splashImagesetDir, "splash@2x.png"));
        await (0, sharp_1.default)(splashSource)
            .resize(360, 360, { fit: "inside" })
            .toFile(path_1.default.join(splashImagesetDir, "splash@3x.png"));
    }
    // iOS LaunchScreen.storyboard
    const launchScreenFiles = require("glob").sync(targetDir + "/ios/**/LaunchScreen.storyboard");
    if (launchScreenFiles.length > 0) {
        const storyboardContent = `<?xml version="1.0" encoding="UTF-8"?>
<document type="com.apple.InterfaceBuilder3.CocoaTouch.Storyboard.XIB" version="3.0" toolsVersion="21507" targetRuntime="iOS.CocoaTouch" propertyAccessControl="none" useAutolayout="YES" launchScreen="YES" useTraitCollections="YES" useSafeAreas="YES" colorMatched="YES" initialViewController="01J-lp-oVM">
    <device id="retina4_7" orientation="portrait" appearance="light"/>
    <dependencies>
        <deployment identifier="iOS"/>
        <plugIn identifier="com.apple.InterfaceBuilder.IBCocoaTouchPlugin" version="21505"/>
        <capability name="Safe area layout guides" minToolsVersion="9.0"/>
        <capability name="System colors in document resources" minToolsVersion="11.0"/>
        <capability name="documents saved in the Xcode 8 format" minToolsVersion="8.0"/>
    </dependencies>
    <scenes>
        <!--View Controller-->
        <scene sceneID="EHf-IW-A2E">
            <objects>
                <viewController id="01J-lp-oVM" sceneMemberID="viewController">
                    <view key="view" contentMode="scaleToFill" id="Ze5-6b-2t3">
                        <rect key="frame" x="0.0" y="0.0" width="375" height="667"/>
                        <autoresizingMask key="autoresizingMask" widthSizable="YES" heightSizable="YES"/>
                        <subviews>
                            <imageView clipsSubviews="YES" userInteractionEnabled="NO" contentMode="scaleAspectFit" horizontalHuggingPriority="251" verticalHuggingPriority="251" image="Splash" translatesAutoresizingMaskIntoConstraints="NO" id="abc-12-xyz">
                                <rect key="frame" x="127.5" y="273.5" width="120" height="120"/>
                                <constraints>
                                    <constraint firstAttribute="width" constant="120" id="123-ab-cde"/>
                                    <constraint firstAttribute="height" constant="120" id="456-df-ghi"/>
                                </constraints>
                            </imageView>
                        </subviews>
                        <viewLayoutGuide key="safeArea" id="Bcu-3y-fUS"/>
                        <color key="backgroundColor" systemColor="systemBackgroundColor"/>
                        <constraints>
                            <constraint firstItem="abc-12-xyz" firstAttribute="centerX" secondItem="Ze5-6b-2t3" secondAttribute="centerX" id="789-jk-lmn"/>
                            <constraint firstItem="abc-12-xyz" firstAttribute="centerY" secondItem="Ze5-6b-2t3" secondAttribute="centerY" id="012-op-qrs"/>
                        </constraints>
                    </view>
                </viewController>
                <placeholder placeholderIdentifier="IBFirstResponder" id="iYj-Kq-Ea1" userLabel="First Responder" sceneMemberID="firstResponder"/>
            </objects>
            <point key="canvasLocation" x="52.173913043478265" y="375"/>
        </scene>
    </scenes>
    <resources>
        <image name="Splash" width="120" height="120"/>
        <systemColor name="systemBackgroundColor">
            <color white="1" alpha="1" colorSpace="custom" customColorSpace="genericGamma22GrayColorSpace"/>
        </systemColor>
    </resources>
</document>`;
        fs_extra_1.default.writeFileSync(launchScreenFiles[0], storyboardContent);
    }
    // Android MainActivity.kt
    const glob = require("glob");
    const mainActivityPaths = glob.sync(targetDir + "/android/app/src/main/java/**/MainActivity.kt");
    if (mainActivityPaths.length > 0) {
        let ma = fs_extra_1.default.readFileSync(mainActivityPaths[0], "utf8");
        if (!ma.includes("SplashView")) {
            ma = ma.replace("import com.facebook.react.ReactActivity", "import com.facebook.react.ReactActivity\nimport android.os.Bundle\nimport com.splashview.SplashView");
            ma = ma.replace("class MainActivity : ReactActivity() {", "class MainActivity : ReactActivity() {\n\n  override fun onCreate(savedInstanceState: Bundle?) {\n    SplashView.showSplashView(this)\n    super.onCreate(null)\n  }");
            fs_extra_1.default.writeFileSync(mainActivityPaths[0], ma);
        }
    }
    // iOS AppDelegate.mm
    const appDelegatePath = path_1.default.join(targetDir, "ios", iosProjectName, "AppDelegate.mm");
    if (fs_extra_1.default.existsSync(appDelegatePath)) {
        let ad = fs_extra_1.default.readFileSync(appDelegatePath, "utf8");
        const objcSplashFunc = `
- (void)showSplashScreen {
  Class splashClass = NSClassFromString(@"SplashView");
  if (splashClass) {
    id splashInstance = [splashClass performSelector:NSSelectorFromString(@"sharedInstance")];
    if (splashInstance) {
      [splashInstance performSelector:NSSelectorFromString(@"showSplash")];
    }
  }
}
`;
        if (!ad.includes("showSplashScreen")) {
            ad = ad.replace("@implementation AppDelegate", "@implementation AppDelegate\n" + objcSplashFunc);
            ad = ad.replace("return [super application:application didFinishLaunchingWithOptions:launchOptions];", "  [self showSplashScreen];\n  return [super application:application didFinishLaunchingWithOptions:launchOptions];");
            fs_extra_1.default.writeFileSync(appDelegatePath, ad);
        }
    }
    // React SplashScreen
    const splashDir = path_1.default.join(targetDir, "src/modules/common/splash");
    fs_extra_1.default.mkdirSync(splashDir, { recursive: true });
    const useSplashScreenTsx = `import { useNavigate } from '@hooks/navigation-hooks';
import { useCallback, useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const useSplashScreen = () => {
  const { resetNavigate } = useNavigate();
  const { top } = useSafeAreaInsets();

  const checkIsUserLoggedIn = useCallback(() => {
    setTimeout(() => {
      resetNavigate('Main', { screen: 'HomeScreen' });
    }, 1000);
  }, [resetNavigate]);

  useEffect(() => {
    checkIsUserLoggedIn();
  }, [checkIsUserLoggedIn]);

  return { top };
};

export { useSplashScreen };
`;
    const splashStylesTs = `import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  image: {
    width: 120,
    height: 120,
  }
});
`;
    const splashScreenTsxCode = `import React from 'react';
import { View, Image } from 'react-native';
import { useSplashScreen } from './useSplashScreen';
import { styles } from './styles';

export const SplashScreen: React.FC = () => {
  const { top } = useSplashScreen();

  return (
    <View style={[styles.container, { paddingTop: top }]}>
      <Image 
        source={require('@assets/images/splash.png')} 
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
};
`;
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "useSplashScreen.ts"), useSplashScreenTsx);
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "styles.ts"), splashStylesTs);
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "SplashScreen.tsx"), splashScreenTsxCode);
    fs_extra_1.default.writeFileSync(path_1.default.join(splashDir, "index.ts"), "export * from './SplashScreen';\n");
    const commonDir = path_1.default.join(targetDir, "src/modules/common");
    fs_extra_1.default.mkdirSync(commonDir, { recursive: true });
    fs_extra_1.default.writeFileSync(path_1.default.join(commonDir, "index.ts"), "export * from './splash';\n");
    fs_extra_1.default.appendFileSync(path_1.default.join(targetDir, "src/modules/index.ts"), "export * from './common';\n");
    const makefileContent = `.PHONY: menu
menu:
	@echo "Choose an option:"
	@echo "1. Start Metro with cache reset"
	@echo "2. Run pod install (iOS)"
	@echo "3. Run Android Development Debug"
	@echo "4. Run Android Production Debug"
	@echo "5. Build Android Development APK"
	@echo "6. Build Android Production APK"
	@read -p "Enter number: " choice; \\
	case $$choice in \\
		1) make start ;; \\
		2) make pod ;; \\
		3) make run-android-dev-debug ;; \\
		4) make run-android-prod-debug ;; \\
		5) make build-apk-dev ;; \\
		6) make build-apk-prod ;; \\
		*) echo "Invalid option" ;; \\
	esac

.PHONY: start
start:
	yarn start --reset-cache

.PHONY: pod
pod:
	cd ios && rm -rf Podfile.lock Pods && pod install && cd ..

.PHONY: run-android-dev-debug
run-android-dev-debug:
	yarn android:dev

.PHONY: run-android-prod-debug
run-android-prod-debug:
	yarn android:prod

.PHONY: build-apk-dev
build-apk-dev:
	echo "Start build apk development"; \\
	cd android && ./gradlew clean && ./gradlew assembleDevAppRelease && open ./app/build/outputs/apk/devApp/release/ && cd ..

.PHONY: build-apk-prod
build-apk-prod:
	echo "Start build apk production"; \\
	cd android && ./gradlew clean && ./gradlew assembleAppRelease && open ./app/build/outputs/apk/app/release/ && cd ..
`;
    fs_extra_1.default.writeFileSync(path_1.default.join(targetDir, "Makefile"), makefileContent);
    console.log(chalk_1.default.cyan("\\nInstalling Pods..."));
    try {
        shelljs_1.default.cd(targetDir);
        shelljs_1.default.exec("yarn install && cd ios && rm -rf Podfile.lock Pods && pod install && cd ..");
    }
    catch (error) {
        console.warn(chalk_1.default.yellow("\\nWarning: Failed to install iOS pods. You may need to run pod install manually."));
    }
    console.log(chalk_1.default.green("Project setup complete!"));
    console.log(chalk_1.default.green(`\nSuccess! RNJet project created at ${targetDir}`));
    console.log(chalk_1.default.cyan("\nTo get started:"));
    console.log(chalk_1.default.white(`  cd ${folderName}`));
    console.log(chalk_1.default.white("  make menu (to choose option)\n"));
}
