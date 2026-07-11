// App.js
import React, {useEffect} from 'react';
import {StatusBar, View, ActivityIndicator, Text} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import messaging from '@react-native-firebase/messaging';

import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import {DataProvider, useData} from './src/context/DataContext';
import LoginScreen from './src/screens/LoginScreen';
import RootNavigator from './src/navigation/RootNavigator';
import {listenForegroundMessages, resolveNotificationRoute} from './src/api/push';
import {navigate} from './src/navigation/navigationRef';

function LoadingGate() {
  const {theme} = useTheme();
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryDark}}>
      <ActivityIndicator size="large" color={theme.gold} />
      <Text style={{color: '#fff', marginTop: 12, fontSize: 13}}>جارٍ تحميل البيانات…</Text>
    </View>
  );
}

/**
 * Handles all three states a push notification can arrive in:
 *   - Foreground (app open): shown as an in-app toast via Toast.show, since
 *     a system notification would be redundant while the user is looking
 *     at the screen already.
 *   - Background (app minimized, tapped from tray): onNotificationOpenedApp.
 *   - Quit (app fully closed, opened by tapping the notification):
 *     getInitialNotification, checked once on mount.
 * In both of the last two cases we navigate to the screen relevant to the
 * notification's `data.type` (see resolveNotificationRoute in api/push.js).
 */
function usePushNotificationRouting() {
  const {user} = useData();

  useEffect(() => {
    if (!user) return undefined;

    const unsubForeground = listenForegroundMessages(({title, body}) => {
      Toast.show({type: 'info', text1: title, text2: body, position: 'top', visibilityTime: 4000});
    });

    const unsubOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage) {
        const route = resolveNotificationRoute(remoteMessage.data);
        navigate(route.screen, route.params);
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          const route = resolveNotificationRoute(remoteMessage.data);
          navigate(route.screen, route.params);
        }
      });

    return () => {
      unsubForeground?.();
      unsubOpened?.();
    };
  }, [user]);
}

function Root() {
  const {user, hydrated} = useData();
  usePushNotificationRouting();

  if (!hydrated) return <LoadingGate />;

  return (
    <>
      <StatusBar barStyle="light-content" />
      {user ? <RootNavigator /> : <LoginScreen />}
      <Toast />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <ThemeProvider>
          <DataProvider>
            <Root />
          </DataProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
