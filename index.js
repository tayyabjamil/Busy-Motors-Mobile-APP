/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';
import { HotUpdater } from '@hot-updater/react-native';
import Config from 'react-native-config';

messaging().setBackgroundMessageHandler(async (remoteMessage) => {
  console.log('Message handled in the background!', remoteMessage);
});

AppRegistry.registerComponent(appName, () =>
  HotUpdater.wrap({
    baseURL: Config.HOT_UPDATER_URL ?? '',
    updateStrategy: 'appVersion',
  })(App),
);

