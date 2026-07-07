// src/context/DataContext.js
import React, {createContext, useContext, useState, useCallback, useEffect, useRef} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Toast from 'react-native-toast-message';
import {
  MEMBERS, AIDS, SUBSCRIPTIONS, TREASURY, RECEIPTS, PAYMENTS, MESSAGES, EVENTS,
} from '../data';
import * as authApi from '../api/auth';
import {queueChange, runSync, getPendingCount} from '../api/sync';
import {api, ApiError, NetworkError} from '../api/client';
import {
  memberToApi, memberFromApi,
  aidToApi, aidFromApi,
  subToApi, subFromApi,
  treasuryToApi, treasuryFromApi,
  voucherToApi, voucherFromApi,
  messageToApi, messageFromApi,
  eventToApi, eventFromApi,
  fundInfoToApi, fundInfoFromApi,
} from '../api/mappers';

const DataContext = createContext(null);
const STORAGE_KEY = '@social_fund_app_data_v1';
const FUND_KEY = '@social_fund_app_fundinfo_v1';

const DEFAULT_FUND_INFO = {
  name: 'الصندوق الاجتماعي التنموي',
  logo: null,
  phone: '777123456',
  email: 'info@socialfund.ye',
  address: 'صنعاء - الجمهورية اليمنية',
  regNo: '',
};

function diffArrays(prevArr, nextArr) {
  const prevById = new Map(prevArr.map(x => [x.id, x]));
  const nextById = new Map(nextArr.map(x => [x.id, x]));
  const changed = [];

  for (const [id, row] of nextById) {
    const before = prevById.get(id);
    if (!before || JSON.stringify(before) !== JSON.stringify(row)) {
      changed.push({...row, _deleted: false});
    }
  }
  for (const [id, row] of prevById) {
    if (!nextById.has(id)) {
      changed.push({...row, _deleted: true});
    }
  }
  return changed;
}

function useSyncedState(initial, table, toApi) {
  const [value, setValue] = useState(initial);

  const setSynced = useCallback(nextOrFn => {
    setValue(prev => {
      const next = typeof nextOrFn === 'function' ? nextOrFn(prev) : nextOrFn;
      const changedRows = diffArrays(prev, next);
      for (const row of changedRows) {
        const apiRow = toApi(row);
        if (row._deleted) apiRow.deleted = true;
        queueChange(table, apiRow).catch(() => {});
      }
      return next;
    });
  }, [table, toApi]);

  return [value, setSynced];
}

export function DataProvider({children}) {
  const [user, setUserState] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [members, setMembers] = useSyncedState(MEMBERS, 'members', memberToApi);
  const [aids, setAids] = useSyncedState(AIDS, 'aid_requests', aidToApi);
  const [subs, setSubs] = useSyncedState(SUBSCRIPTIONS, 'subscriptions', subToApi);
  const [treasury, setTreasury] = useSyncedState(TREASURY, 'treasury_entries', treasuryToApi);
  const [receipts, setReceipts] = useSyncedState(RECEIPTS, 'vouchers', voucherToApi);
  const [payments, setPayments] = useSyncedState(PAYMENTS, 'vouchers', voucherToApi);
  const [msgs, setMsgs] = useSyncedState(MESSAGES, 'messages', messageToApi);
  const [events, setEvents] = useSyncedState(EVENTS, 'events', eventToApi);

  const [fundInfo, setFundInfoState] = useState(DEFAULT_FUND_INFO);
  const [hydrated, setHydrated] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [isOffline, setIsOffline] = useState(false);
  const skipNextSave = useRef(true);

  const roleLabel = key => ({
    admin: 'مدير النظام', accountant: 'محاسب', reviewer: 'مراجع', viewer: 'مراقب',
  }[key] || key);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const d = JSON.parse(raw);
          if (d.members) setMembers(d.members);
          if (d.aids) setAids(d.aids);
          if (d.subs) setSubs(d.subs);
          if (d.treasury) setTreasury(d.treasury);
          if (d.receipts) setReceipts(d.receipts);
          if (d.payments) setPayments(d.payments);
          if (d.msgs) setMsgs(d.msgs);
          if (d.events) setEvents(d.events);
        }
        const fundRaw = await AsyncStorage.getItem(FUND_KEY);
        if (fundRaw) setFundInfoState({...DEFAULT_FUND_INFO, ...JSON.parse(fundRaw)});

        const hasSession = await authApi.hasStoredSession();
        if (hasSession) {
          try {
            const me = await authApi.getMe();
            setUserState({
              id: me.id, un: me.username, name: me.full_name,
              role: roleLabel(me.role), roleKey: me.role,
              av: me.avatar_initial, phone: me.phone, pw: '',
            });
          } catch (e) {
            // stored tokens invalid/expired and refresh also failed -
            // user simply sees the login screen, nothing more to do here.
          }
        }
      } catch (e) {
        // ignore corrupt local cache, fall back to bundled defaults
      } finally {
        skipNextSave.current = true;
        setHydrated(true);
        setAuthChecked(true);
      }
    })();
  }, []);

  useEffect(() => {
    if (hydrated && user) {
      syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, user]);

  useEffect(() => {
    getPendingCount().then(setPendingCount);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipNextSave.current) { skipNextSave.current = false; return; }
    const data = {members, aids, subs, treasury, receipts, payments, msgs, events};
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, [hydrated, members, aids, subs, treasury, receipts, payments, msgs, events]);

  const setUser = useCallback(u => {
    setUserState(u);
    if (!u) {
      authApi.logout().catch(() => {});
    }
  }, []);

  const setFundInfo = useCallback(updates => {
    setFundInfoState(prev => {
      const next = {...prev, ...updates};
      AsyncStorage.setItem(FUND_KEY, JSON.stringify(next)).catch(() => {});
      api.put('/fund-settings', fundInfoToApi(next)).catch(() => {
        // offline or forbidden - local value already applied, will retry
        // implicitly next time the user opens this screen and saves again.
      });
      return next;
    });
  }, []);

  const resetAllData = useCallback(async () => {
    setMembers(MEMBERS); setAids(AIDS); setSubs(SUBSCRIPTIONS);
    setTreasury(TREASURY); setReceipts(RECEIPTS); setPayments(PAYMENTS);
    setMsgs(MESSAGES); setEvents(EVENTS);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  const toast = useCallback((msg, type = 'info') => {
    Toast.show({
      type: type === 'error' ? 'error' : type === 'success' ? 'success' : 'info',
      text1: msg,
      position: 'bottom',
      visibilityTime: 3000,
    });
  }, []);

  function mergeIncoming(setter, apiRows, fromApi) {
    if (!apiRows || apiRows.length === 0) return;
    setter(prev => {
      const byId = new Map(prev.map(x => [x.id, x]));
      for (const r of apiRows) {
        if (r.deleted) {
          byId.delete(r.id);
        } else {
          byId.set(r.id, fromApi(r));
        }
      }
      return Array.from(byId.values());
    });
  }

  const syncNow = useCallback(async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await runSync();
      setIsOffline(!!result.offline);

      if (result.conflicts?.length) {
        toast(`تعذّر مزامنة ${result.conflicts.length} تغيير - تم تعديله على جهاز آخر`, 'error');
      }

      if (result.pulled) {
        const p = result.pulled;
        mergeIncoming(setMembers, p.members, memberFromApi);
        mergeIncoming(setAids, p.aid_requests, aidFromApi);
        mergeIncoming(setSubs, p.subscriptions, subFromApi);
        mergeIncoming(setTreasury, p.treasury_entries, treasuryFromApi);
        mergeIncoming(setReceipts, (p.vouchers || []).filter(v => v.kind === 'قبض'), voucherFromApi);
        mergeIncoming(setPayments, (p.vouchers || []).filter(v => v.kind === 'صرف'), voucherFromApi);
        mergeIncoming(setMsgs, p.messages, messageFromApi);
        mergeIncoming(setEvents, p.events, eventFromApi);
        if (p.fund_settings) setFundInfoState(prev => ({...prev, ...fundInfoFromApi(p.fund_settings)}));
      }
    } catch (e) {
      if (e instanceof NetworkError) {
        setIsOffline(true);
      } else if (e instanceof ApiError && e.status === 401) {
        setUser(null);
      } else {
        toast('حدث خطأ أثناء المزامنة', 'error');
      }
    } finally {
      setSyncing(false);
      getPendingCount().then(setPendingCount);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncing, toast, setUser]);

  const value = {
    user, setUser, authChecked,
    members, setMembers,
    aids, setAids,
    subs, setSubs,
    treasury, setTreasury,
    receipts, setReceipts,
    payments, setPayments,
    msgs, setMsgs,
    events, setEvents,
    fundInfo, setFundInfo,
    toast,
    hydrated,
    resetAllData,
    syncNow,
    syncing,
    pendingCount,
    isOffline,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
