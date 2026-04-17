/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { initI18n } from './src/hooks';

initI18n();

AppRegistry.registerComponent(appName, () => App);
