// src/api/push.js
/**
 * Firebase Cloud Messaging integration.
 *
 * Flow:
 *   1. App asks the user for notification permission (required on Android 13+/iOS).
 *   2. Firebase gives us a device token, unique per app install.
 *   3. We send that token to the backend (POST /push/register-token) so the
 *      server can look it up later and push to this exact device.
 *   4. Backend sends notifications via Firebase Admin SDK whenever something
 *      the user cares about happens (aid request approved, new aid request
 *      needing review, new internal message, etc.) - see
 *      SocialFundBackend/app/services/push_service.py.
 *
 * Foreground messages (app open) are shown as an in-app toast instead of a
 * system notification, since the user is already looking at the screen.
 * Background/killed-state messages are handled entirely by the OS + Firebase
 * and show as a normal system notification using the manifest's default
 * channel/icon/color.
 */
import messaging from '@react-native-firebase/messaging';
import {Platform, PermissionsAndroid} from 'react-native';
import {api} from './client';

let unsubscribeForeground = null;
let unsubscribeTokenRefresh = null;

export async function requestNotificationPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) return false;
  }

  const authStatus = await messaging().requestPermission();
  return (
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL
  );
}

async function sendTokenToServer(token) {
  try {
    await api.post('/push/register-token', {token, platform: Platform.OS});
  } catch (e) {
    // Offline or not logged in yet - harmless to skip; the token refresh
    // listener and the next successful login will retry this.
  }
}

export async function initPush() {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return false;

  const token = await messaging().getToken();
  if (token) await sendTokenToServer(token);

  unsubscribeTokenRefresh?.();
  unsubscribeTokenRefresh = messaging().onTokenRefresh(sendTokenToServer);

  return true;
}

export function listenForegroundMessages(onForegroundMessage) {
  unsubscribeForeground?.();
  unsubscribeForeground = messaging().onMessage(async remoteMessage => {
    onForegroundMessage({
      title: remoteMessage.notification?.title || 'إشعار جديد',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data || {},
    });
  });
  return unsubscribeForeground;
}

export async function unregisterPush() {
  try {
    const token = await messaging().getToken();
    if (token) await api.post('/push/unregister-token', {token});
  } catch (e) {
    // best-effort
  }
  unsubscribeForeground?.();
  unsubscribeTokenRefresh?.();
}

export function resolveNotificationRoute(data) {
  switch (data?.type) {
    case 'aid_status_changed':
    case 'aid_new':
      return {screen: 'Aid'};
    case 'message_new':
      return {screen: 'Messages'};
    case 'subscription_new':
      return {screen: 'Subscriptions'};
    default:
      return {screen: 'Dashboard'};
  }
}
