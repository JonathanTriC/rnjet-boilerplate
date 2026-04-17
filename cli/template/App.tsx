/**
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
