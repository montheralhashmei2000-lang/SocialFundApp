/**
 * @format
 */
import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import {name as appName} from './app.json';

/**
 * Required by Firebase: this runs in a headless JS context when a push
 * notification arrives while the app is fully closed or backgrounded on
 * Android. We don't need to do anything extra here since Firebase already
 * displays the system notification automatically using the manifest's
 * default channel/icon/color (see AndroidManifest.xml) - this handler just
 * needs to exist and resolve so Android doesn't log a warning.
 */
messaging().setBackgroundMessageHandler(async remoteMessage => {
  // Intentionally empty - notification display is automatic.
});

AppRegistry.registerComponent(appName, () => App);
