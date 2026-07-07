// src/api/sync.js
/**
 * Offline-first sync engine.
 *
 * Local writes (create/update/delete) go through queueChange() first,
 * which appends the change to a persisted "outbox" queue. runSync()
 * periodically/manually:
 *   1. Pushes everything in the outbox to /sync/push.
 *   2. Pulls everything changed on the server since the last successful
 *      sync via /sync/pull.
 *   3. Merges pulled data into local state (server wins on conflict, per
 *      the backend's last-write-wins rule already enforced server-side).
 *
 * If the device is offline, push/pull throw NetworkError and the outbox is
 * left untouched - it will be retried next time runSync() is called.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {api, NetworkError} from './client';
import {getDeviceId} from './deviceId';

const OUTBOX_KEY = '@social_fund_outbox_v1';
const LAST_SYNC_KEY = '@social_fund_last_sync_v1';

export async function getOutbox() {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  return raw ? JSON.parse(raw) : [];
}

async function setOutbox(items) {
  await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify(items));
}

export async function queueChange(table, data) {
  const outbox = await getOutbox();
  const clientUpdatedAt = new Date().toISOString();

  const filtered = outbox.filter(item => !(item.table === table && item.data.id === data.id));
  filtered.push({table, data, client_updated_at: clientUpdatedAt});

  await setOutbox(filtered);
  return filtered.length;
}

export async function getLastSyncTime() {
  return AsyncStorage.getItem(LAST_SYNC_KEY);
}

async function setLastSyncTime(iso) {
  await AsyncStorage.setItem(LAST_SYNC_KEY, iso);
}

export async function getPendingCount() {
  const outbox = await getOutbox();
  return outbox.length;
}

export async function runSync() {
  const deviceId = await getDeviceId();
  const outbox = await getOutbox();

  let pushResult = {accepted: 0, conflicts: []};
  if (outbox.length > 0) {
    try {
      pushResult = await api.post('/sync/push', {device_id: deviceId, items: outbox});
      await setOutbox([]);
    } catch (e) {
      if (e instanceof NetworkError) {
        return {offline: true, pushed: 0, pulled: null, conflicts: []};
      }
      throw e;
    }
  }

  const since = await getLastSyncTime();
  let pullResult;
  try {
    pullResult = await api.post('/sync/pull', since ? {since} : {});
  } catch (e) {
    if (e instanceof NetworkError) {
      return {offline: true, pushed: pushResult.accepted, pulled: null, conflicts: pushResult.conflicts};
    }
    throw e;
  }

  await setLastSyncTime(pullResult.server_time);

  return {
    offline: false,
    pushed: pushResult.accepted,
    conflicts: pushResult.conflicts,
    pulled: pullResult,
  };
}

export async function writeAndQueue(table, data, applyLocally) {
  applyLocally();
  await queueChange(table, data);
}
