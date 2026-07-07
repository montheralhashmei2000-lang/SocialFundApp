// App.js
import React, {useEffect} from 'react';
import {StatusBar, View, ActivityIndicator, Text} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';

import {ThemeProvider, useTheme} from './src/context/ThemeContext';
import {DataProvider, useData} from './src/context/DataContext';
import LoginScreen from './src/screens/LoginScreen';
import RootNavigator from './src/navigation/RootNavigator';
import messaging from '@react-native-firebase/messaging';

function LoadingGate() {
  const {theme} = useTheme();
  return (
    <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.primaryDark}}>
      <ActivityIndicator size="large" color={theme.gold} />
      <Text style={{color: '#fff', marginTop: 12, fontSize: 13}}>جارٍ تحميل البيانات…</Text>
    </View>
  );
}

function Root() {
  const {theme} = useTheme();
  const {user, hydrated} = useData();

  if (!hydrated) return <LoadingGate />;

  return (
    <>
      <StatusBar barStyle="light-content" />
      {user ? <RootNavigator /> : <LoginScreen />}
      <Toast />
    </>
  );
}

async function requestNotificationPermission() {
  const authStatus = await messaging().requestPermission();

  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    const token = await messaging().getToken();
    console.log("FCM TOKEN:", token);
  }
}
export default function App() {
useEffect(() => {
  requestNotificationPermission();
}, []); 
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
