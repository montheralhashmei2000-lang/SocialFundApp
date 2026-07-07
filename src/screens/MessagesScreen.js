// src/screens/MessagesScreen.js
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from '../icons/Icon';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import {listColleagues} from '../api/users';

function newId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default function MessagesScreen() {
  const {theme} = useTheme();
  const {msgs, setMsgs, user, toast} = useData();
  const [compose, setCompose] = useState(false);
  const [selMsg, setSelMsg] = useState(null);
  const [colleagues, setColleagues] = useState([]);
  const blank = {toId: '', body: ''};
  const [form, setForm] = useState(blank);

  useEffect(() => {
    listColleagues()
      .then(setColleagues)
      .catch(() => {
        // offline or request failed - recipient picker will just show
        // "لا يوجد زملاء" until the next successful fetch/sync.
      });
  }, []);

  const unread = msgs.filter(m => !m.read && (m.toId === user.id || m.to === user.name)).length;

  const send = () => {
    if (!form.toId || !form.body) { toast('يرجى اختيار المستلم وكتابة الرسالة', 'error'); return; }
    const recipient = colleagues.find(c => c.id === form.toId);
    if (!recipient) { toast('المستلم غير موجود', 'error'); return; }

    const now = new Date();
    setMsgs([
      {
        id: newId(),
        fromId: user.id, from: user.name, fromAv: user.av,
        toId: recipient.id, to: recipient.full_name,
        body: form.body,
        time: now.toLocaleTimeString('ar', {hour: '2-digit', minute: '2-digit'}),
        date: 'الآن',
        read: false,
      },
      ...msgs,
    ]);
    setCompose(false); setForm(blank); toast('تم إرسال الرسالة', 'success');
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={{fontWeight: '800', fontSize: 16, color: theme.tx}}>الرسائل الداخلية</Text>
            {unread > 0 && <Text style={{fontSize: 12, color: theme.warn, marginTop: 2}}>{unread} رسالة غير مقروءة</Text>}
          </View>
          <TouchableOpacity onPress={() => setCompose(true)} style={[styles.newBtn, {backgroundColor: theme.primaryMid}]}>
            <Icon name="edit" size={16} color="#fff" />
            <Text style={styles.newBtnText}>رسالة جديدة</Text>
          </TouchableOpacity>
        </View>

        {msgs.length === 0 && (
          <View style={{alignItems: 'center', paddingVertical: 32}}>
            <Icon name="msg" size={40} color={theme.border} />
            <Text style={{color: theme.mu, marginTop: 8}}>لا توجد رسائل</Text>
          </View>
        )}

        {msgs.map(m => (
          <TouchableOpacity
            key={m.id}
            onPress={() => { setSelMsg(m); setMsgs(msgs.map(x => (x.id === m.id ? {...x, read: true} : x))); }}
            style={[styles.msgCard, {backgroundColor: theme.card, borderRightColor: !m.read && (m.toId === user.id || m.to === user.name) ? theme.warn : theme.border}]}>
            <View style={[styles.msgAvatar, {backgroundColor: theme.primary + '1A'}]}>
              <Text style={{fontWeight: '800', color: theme.primary, fontSize: 17}}>{m.fromAv}</Text>
            </View>
            <View style={{flex: 1}}>
              <View style={styles.msgTop}>
                <Text style={{fontSize: 11, color: theme.mu}}>{m.time}</Text>
                <Text style={{fontWeight: '700', fontSize: 14, color: theme.tx}}>{m.from}</Text>
              </View>
              <Text style={{fontSize: 12, color: theme.sub, marginTop: 2, textAlign: 'right'}}>إلى: {m.to}</Text>
              <Text numberOfLines={1} style={{fontSize: 12, color: theme.mu, marginTop: 2, textAlign: 'right'}}>{m.body}</Text>
            </View>
            {!m.read && (m.toId === user.id || m.to === user.name) && <View style={[styles.dot, {backgroundColor: theme.warn}]} />}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Sheet visible={compose} title="رسالة جديدة" onClose={() => { setCompose(false); setForm(blank); }} theme={theme}>
        <Field
          label="المستلم" value={form.toId} onSelect={v => setForm({...form, toId: v})}
          opts={[{v: '', l: colleagues.length ? 'اختر المستلم…' : 'لا يوجد زملاء متاحون'}, ...colleagues.map(c => ({v: c.id, l: `${c.full_name} (${c.role})`}))]}
          icon="person" theme={theme}
        />
        <Field label="الرسالة" value={form.body} onChangeText={v => setForm({...form, body: v})} multiline numberOfLines={4} theme={theme} />
        <Btn onPress={send} theme={theme}>إرسال</Btn>
      </Sheet>

      <Sheet visible={!!selMsg} title="الرسالة" onClose={() => setSelMsg(null)} theme={theme}>
        {selMsg && (
          <View>
            <View style={[styles.detailHeader, {backgroundColor: theme.bg}]}>
              <View style={[styles.msgAvatar, {backgroundColor: theme.primary + '1A', width: 48, height: 48}]}>
                <Text style={{fontWeight: '800', color: theme.primary, fontSize: 20}}>{selMsg.fromAv}</Text>
              </View>
              <View>
                <Text style={{fontWeight: '800', fontSize: 15, color: theme.tx}}>{selMsg.from}</Text>
                <Text style={{fontSize: 12, color: theme.mu}}>إلى: {selMsg.to} · {selMsg.time} · {selMsg.date}</Text>
              </View>
            </View>
            <Text style={[styles.detailBody, {backgroundColor: theme.surf, color: theme.tx}]}>{selMsg.body}</Text>
            <Btn
              onPress={() => {
                const sender = colleagues.find(c => c.full_name === selMsg.from);
                setSelMsg(null);
                setForm({toId: sender ? sender.id : '', body: ''});
                setCompose(true);
              }}
              variant="outline" theme={theme}>
              رد على الرسالة
            </Btn>
          </View>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  header: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14},
  newBtn: {borderRadius: 12, paddingHorizontal: 16, paddingVertical: 9, flexDirection: 'row-reverse', alignItems: 'center', gap: 6},
  newBtnText: {color: '#fff', fontWeight: '700', fontSize: 13},
  msgCard: {borderRadius: 16, padding: 14, marginBottom: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderRightWidth: 3},
  msgAvatar: {width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  msgTop: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'},
  dot: {width: 9, height: 9, borderRadius: 5},
  detailHeader: {flexDirection: 'row-reverse', alignItems: 'center', gap: 12, marginBottom: 16, borderRadius: 14, padding: 12},
  detailBody: {borderRadius: 14, padding: 16, fontSize: 14, lineHeight: 22, marginBottom: 16, textAlign: 'right'},
});
