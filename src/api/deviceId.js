// src/api/deviceId.js
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVICE_ID_KEY = '@social_fund_device_id_v1';

function generateId() {
  return 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}

let cached = null;

export async function getDeviceId() {
  if (cached) return cached;
  let id = await AsyncStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateId();
    await AsyncStorage.setItem(DEVICE_ID_KEY, id);
  }
  cached = id;
  return id;
}
