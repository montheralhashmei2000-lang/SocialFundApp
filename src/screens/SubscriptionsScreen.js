// src/screens/SubscriptionsScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../icons/Icon';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import {PAY_METHODS} from '../data';
import newId from '../api/newId';

export default function SubscriptionsScreen() {
  const {theme} = useTheme();
  const {members, subs, setSubs, toast} = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [flt, setFlt] = useState('الكل');
  const blank = {mid: '', amt: '', date: new Date().toISOString().split('T')[0], method: 'نقداً'};
  const [form, setForm] = useState(blank);

  const total = subs.reduce((s, x) => s + x.amt, 0);
  const methods = [...new Set(subs.map(s => s.method))];
  const shown = flt === 'الكل' ? subs : subs.filter(s => s.method === flt);
  const byM = subs.reduce((a, s) => { a[s.method] = (a[s.method] || 0) + s.amt; return a; }, {});

  const save = () => {
    const m = members.find(x => x.id === +form.mid);
    if (!m || !form.amt) { toast('يرجى اختيار العضو وإدخال المبلغ', 'error'); return; }
    setSubs([{id: newId(), mid: m.id, mn: m.name, amt: +form.amt, date: form.date, method: form.method, ref: 'RCP-' + String(subs.length + 1).padStart(3, '0')}, ...subs]);
    setAddOpen(false); setForm(blank); toast('تم تسجيل الاشتراك', 'success');
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={[theme.goldDark, theme.gold]} style={styles.hero}>
          <View>
            <Text style={styles.heroLabel}>إجمالي المحصّل</Text>
            <Text style={styles.heroValue}>{total.toLocaleString()} ﷼</Text>
            <Text style={styles.heroSub}>{subs.length} معاملة</Text>
          </View>
          <TouchableOpacity onPress={() => setAddOpen(true)} style={styles.heroBtn}>
            <Icon name="add" size={18} color={theme.goldDark} />
            <Text style={{color: theme.goldDark, fontWeight: '800', fontSize: 14}}>تسجيل</Text>
          </TouchableOpacity>
        </LinearGradient>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 12}}>
          <View style={{flexDirection: 'row-reverse', gap: 6}}>
            {['الكل', ...methods].map(m => (
              <TouchableOpacity key={m} onPress={() => setFlt(m)} style={[styles.filterChip, {backgroundColor: flt === m ? theme.goldDark : theme.card}]}>
                <Text style={{color: flt === m ? '#fff' : theme.sub, fontSize: 12, fontWeight: '700'}}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginBottom: 14}}>
          <View style={{flexDirection: 'row-reverse', gap: 8}}>
            {Object.entries(byM).map(([m, v]) => (
              <View key={m} style={[styles.methodCard, {backgroundColor: theme.card}]}>
                <Text style={{fontSize: 11, color: theme.mu}}>{m}</Text>
                <Text style={{fontWeight: '800', color: theme.primary, fontSize: 14}}>{v.toLocaleString()} ﷼</Text>
              </View>
            ))}
          </View>
        </ScrollView>

        {shown.map(s => (
          <View key={s.id} style={[styles.subCard, {backgroundColor: theme.card}]}>
            <View style={[styles.iconWrap, {backgroundColor: theme.gold + '22'}]}>
              <Icon name="receipt" size={22} color={theme.goldDark} />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: '700', fontSize: 14, color: theme.tx, textAlign: 'right'}}>{s.mn}</Text>
              <Text style={{fontSize: 11, color: theme.mu, marginTop: 1, textAlign: 'right'}}>{s.date} · {s.method} · {s.ref}</Text>
            </View>
            <Text style={{fontWeight: '900', color: theme.ok, fontSize: 16}}>+{s.amt.toLocaleString()} ﷼</Text>
          </View>
        ))}
      </ScrollView>

      <Sheet visible={addOpen} title="تسجيل اشتراك" onClose={() => { setAddOpen(false); setForm(blank); }} theme={theme} accent={theme.goldDark}>
        <Field label="العضو *" value={form.mid} onSelect={v => setForm({...form, mid: v})} opts={[{v: '', l: 'اختر العضو…'}, ...members.map(m => ({v: m.id, l: m.name}))]} icon="person" theme={theme} />
        <Field label="المبلغ (﷼) *" value={form.amt} onChangeText={v => setForm({...form, amt: v})} keyboardType="numeric" icon="money" theme={theme} />
        <Field label="تاريخ الدفع" value={form.date} onChangeText={v => setForm({...form, date: v})} theme={theme} />
        <Field label="طريقة الدفع" value={form.method} onSelect={v => setForm({...form, method: v})} opts={PAY_METHODS.map(m => ({v: m, l: m}))} theme={theme} />
        <Btn onPress={save} variant="gold" theme={theme}>تسجيل الاشتراك</Btn>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  hero: {borderRadius: 22, padding: 18, marginBottom: 14, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'},
  heroLabel: {color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'right'},
  heroValue: {color: '#fff', fontSize: 30, fontWeight: '900', textAlign: 'right'},
  heroSub: {color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 3, textAlign: 'right'},
  heroBtn: {backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 11, flexDirection: 'row-reverse', alignItems: 'center', gap: 6},
  filterChip: {borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6},
  methodCard: {borderRadius: 12, paddingHorizontal: 14, paddingVertical: 9},
  subCard: {borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 12},
  iconWrap: {width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
});
