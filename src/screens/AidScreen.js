// src/screens/AidScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from '../icons/Icon';
import Badge from '../components/Badge';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import {AID_TYPES} from '../data';
import newId from '../api/newId';

export default function AidScreen() {
  const {theme} = useTheme();
  const {members, aids, setAids, toast, user} = useData();
  const [filt, setFilt] = useState('الكل');
  const [addOpen, setAddOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const blank = {mid: '', type: 'مساعدة زواج', amt: '', date: new Date().toISOString().split('T')[0], note: ''};
  const [form, setForm] = useState(blank);

  const SC = {'قيد المراجعة': theme.warn, 'معتمدة': theme.ok, 'مصروفة': theme.info, 'مرفوضة': theme.err};
  const shown = [...aids].filter(a => filt === 'الكل' || a.status === filt).sort((a, b) => b.date.localeCompare(a.date));

  const save = () => {
    const m = members.find(x => x.id === +form.mid);
    if (!m || !form.amt) { toast('يرجى ملء البيانات المطلوبة', 'error'); return; }
    setAids([{id: newId(), mid: m.id, mn: m.name, type: form.type, amt: +form.amt, date: form.date, note: form.note, status: 'قيد المراجعة', reviewer: ''}, ...aids]);
    setAddOpen(false); setForm(blank); toast('تم إرسال طلب المساعدة', 'success');
  };

  const change = (id, st) => {
    setAids(aids.map(a => (a.id === id ? {...a, status: st, reviewer: user.name} : a)));
    setSel(null); toast(`تم تحديث الحالة: ${st}`, 'success');
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.summaryGrid}>
          {[{l: 'معلق', s: 'قيد المراجعة', c: theme.warn}, {l: 'معتمد', s: 'معتمدة', c: theme.ok}, {l: 'مصروف', s: 'مصروفة', c: theme.info}, {l: 'مرفوض', s: 'مرفوضة', c: theme.err}].map(x => (
            <TouchableOpacity key={x.l} onPress={() => setFilt(x.s)} style={[styles.summaryCard, {backgroundColor: x.c + '12', borderColor: filt === x.s ? x.c : 'transparent'}]}>
              <Text style={{fontSize: 22, fontWeight: '900', color: x.c}}>{aids.filter(a => a.status === x.s).length}</Text>
              <Text style={{fontSize: 10, color: theme.sub}}>{x.l}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
          <View style={{flexDirection: 'row-reverse', gap: 6, alignItems: 'center'}}>
            {['الكل', 'قيد المراجعة', 'معتمدة', 'مصروفة', 'مرفوضة'].map(s => (
              <TouchableOpacity key={s} onPress={() => setFilt(s)} style={[styles.filterChip, {backgroundColor: filt === s ? theme.primary : theme.card}]}>
                <Text style={{color: filt === s ? '#fff' : theme.sub, fontSize: 12, fontWeight: '700'}}>{s}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity onPress={() => setAddOpen(true)} style={[styles.addChip, {backgroundColor: theme.primaryMid}]}>
              <Icon name="add" size={17} color="#fff" />
              <Text style={{color: '#fff', fontSize: 12, fontWeight: '700'}}>طلب</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {shown.map(a => (
          <TouchableOpacity key={a.id} onPress={() => setSel(a)} style={[styles.aidCard, {backgroundColor: theme.card, borderRightColor: SC[a.status] || theme.border}]}>
            <View style={styles.aidHeader}>
              <View>
                <Text style={{fontWeight: '800', fontSize: 14, color: theme.tx, textAlign: 'right'}}>{a.mn}</Text>
                <Text style={{fontSize: 12, color: theme.sub, marginTop: 2, textAlign: 'right'}}>{a.type} · {a.date}</Text>
              </View>
              <Badge status={a.status} />
            </View>
            <View style={styles.aidFooter}>
              <Text style={{fontSize: 26, fontWeight: '900', color: theme.primary}}>{a.amt.toLocaleString()} ﷼</Text>
              <View style={{flexDirection: 'row-reverse', gap: 6}}>
                {a.status === 'قيد المراجعة' && (
                  <>
                    <TouchableOpacity onPress={() => change(a.id, 'معتمدة')} style={[styles.smallBtn, {backgroundColor: theme.ok + '18'}]}>
                      <Text style={{color: theme.ok, fontSize: 12, fontWeight: '700'}}>اعتماد</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => change(a.id, 'مرفوضة')} style={[styles.smallBtn, {backgroundColor: theme.err + '18'}]}>
                      <Text style={{color: theme.err, fontSize: 12, fontWeight: '700'}}>رفض</Text>
                    </TouchableOpacity>
                  </>
                )}
                {a.status === 'معتمدة' && (
                  <TouchableOpacity onPress={() => change(a.id, 'مصروفة')} style={[styles.smallBtn, {backgroundColor: theme.info + '18'}]}>
                    <Text style={{color: theme.info, fontSize: 12, fontWeight: '700'}}>صرف</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
            {a.note ? <Text style={[styles.note, {backgroundColor: theme.bg, color: theme.mu}]}>📝 {a.note}</Text> : null}
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Sheet visible={!!sel} title="تفاصيل الطلب" onClose={() => setSel(null)} theme={theme}>
        {sel && (
          <>
            <View style={[styles.detailBox, {backgroundColor: SC[sel.status] + '12', borderRightColor: SC[sel.status]}]}>
              <View style={styles.detailTop}>
                <View>
                  <Text style={{fontWeight: '900', fontSize: 20, color: theme.tx}}>{sel.amt.toLocaleString()} ﷼</Text>
                  <Text style={{fontSize: 13, color: theme.sub, marginTop: 2}}>{sel.type}</Text>
                </View>
                <Badge status={sel.status} />
              </View>
              {[['المستفيد', sel.mn], ['تاريخ الطلب', sel.date], ['المراجع', sel.reviewer || '—']].map(([k, v]) => (
                <View key={k} style={[styles.detailRow, {borderTopColor: theme.border}]}>
                  <Text style={{color: theme.sub, fontSize: 13}}>{k}</Text>
                  <Text style={{fontWeight: '700', color: theme.tx, fontSize: 13}}>{v}</Text>
                </View>
              ))}
            </View>
            {sel.note ? <Text style={[styles.noteBig, {backgroundColor: theme.gold + '18', color: theme.tx}]}>📝 {sel.note}</Text> : null}
            {sel.status === 'قيد المراجعة' && (
              <View style={{flexDirection: 'row-reverse', gap: 10}}>
                <Btn onPress={() => change(sel.id, 'معتمدة')} full={false} small theme={theme}>اعتماد</Btn>
                <Btn onPress={() => change(sel.id, 'مرفوضة')} variant="danger" full={false} small theme={theme}>رفض</Btn>
              </View>
            )}
            {sel.status === 'معتمدة' && <Btn onPress={() => change(sel.id, 'مصروفة')} theme={theme}>تأكيد الصرف</Btn>}
          </>
        )}
      </Sheet>

      <Sheet visible={addOpen} title="طلب مساعدة جديدة" onClose={() => { setAddOpen(false); setForm(blank); }} theme={theme}>
        <Field label="العضو *" value={form.mid} onSelect={v => setForm({...form, mid: v})} opts={[{v: '', l: 'اختر العضو…'}, ...members.map(m => ({v: m.id, l: m.name}))]} icon="person" theme={theme} />
        <Field label="نوع المساعدة" value={form.type} onSelect={v => setForm({...form, type: v})} opts={AID_TYPES.map(t => ({v: t, l: t}))} theme={theme} />
        <Field label="المبلغ (﷼) *" value={form.amt} onChangeText={v => setForm({...form, amt: v})} keyboardType="numeric" icon="money" theme={theme} />
        <Field label="تاريخ الطلب" value={form.date} onChangeText={v => setForm({...form, date: v})} theme={theme} />
        <Field label="ملاحظات" value={form.note} onChangeText={v => setForm({...form, note: v})} multiline numberOfLines={3} theme={theme} />
        <Btn onPress={save} theme={theme}>إرسال الطلب</Btn>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  summaryGrid: {flexDirection: 'row', gap: 8, marginBottom: 12},
  summaryCard: {flex: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 8, alignItems: 'center', borderWidth: 1.5},
  filterChip: {borderRadius: 20, paddingHorizontal: 13, paddingVertical: 6},
  addChip: {borderRadius: 12, paddingHorizontal: 14, paddingVertical: 6, flexDirection: 'row-reverse', alignItems: 'center', gap: 4},
  aidCard: {borderRadius: 16, padding: 16, marginBottom: 10, borderRightWidth: 3},
  aidHeader: {flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 8},
  aidFooter: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'},
  smallBtn: {borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6},
  note: {fontSize: 12, padding: 8, borderRadius: 8, marginTop: 8, textAlign: 'right'},
  detailBox: {borderRadius: 14, padding: 16, marginBottom: 16, borderRightWidth: 3},
  detailTop: {flexDirection: 'row-reverse', justifyContent: 'space-between', marginBottom: 12},
  detailRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 7, borderTopWidth: 1},
  noteBig: {borderRadius: 12, padding: 12, fontSize: 13, marginBottom: 16, textAlign: 'right'},
});
