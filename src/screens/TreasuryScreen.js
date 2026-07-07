// src/screens/TreasuryScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../icons/Icon';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import newId from '../api/newId';

const CATS_IN = ['اشتراكات', 'تبرعات', 'غرامات', 'أخرى'];
const CATS_EX = ['مساعدات', 'إدارة', 'صيانة', 'أخرى'];

export default function TreasuryScreen() {
  const {theme} = useTheme();
  const {treasury, setTreasury, toast} = useData();
  const [tab, setTab] = useState('all');
  const [addOpen, setAddOpen] = useState(false);
  const blank = {type: 'إيراد', cat: 'اشتراكات', desc: '', amt: '', date: new Date().toISOString().split('T')[0]};
  const [form, setForm] = useState(blank);

  const income = treasury.filter(t => t.type === 'إيراد').reduce((s, t) => s + t.amt, 0);
  const expense = treasury.filter(t => t.type === 'مصروف').reduce((s, t) => s + t.amt, 0);
  const balance = income - expense;
  const shown = tab === 'all' ? treasury : treasury.filter(t => t.type === (tab === 'income' ? 'إيراد' : 'مصروف'));

  const save = () => {
    if (!form.desc || !form.amt) { toast('يرجى ملء الحقول', 'error'); return; }
    setTreasury([{id: newId(), ...form, amt: +form.amt, ref: 'TR-' + String(treasury.length + 1).padStart(3, '0')}, ...treasury]);
    setAddOpen(false); setForm(blank); toast('تم تسجيل المعاملة', 'success');
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.hero}>
          <Text style={styles.heroLabel}>صافي الخزينة</Text>
          <Text style={[styles.heroValue, {color: balance >= 0 ? '#69F0AE' : '#FF8A80'}]}>{balance.toLocaleString()} <Text style={{fontSize: 18}}>﷼</Text></Text>
          <View style={styles.heroRow}>
            <View style={styles.heroBox}>
              <View style={styles.rowGap}>
                <Icon name="arrowUp" size={14} color="#69F0AE" />
                <Text style={{color: '#69F0AE', fontSize: 11, fontWeight: '700'}}>إجمالي الإيرادات</Text>
              </View>
              <Text style={styles.heroBoxValue}>{income.toLocaleString()} ﷼</Text>
            </View>
            <View style={styles.heroBox}>
              <View style={styles.rowGap}>
                <Icon name="arrowDn" size={14} color="#FF8A80" />
                <Text style={{color: '#FF8A80', fontSize: 11, fontWeight: '700'}}>إجمالي المصروفات</Text>
              </View>
              <Text style={styles.heroBoxValue}>{expense.toLocaleString()} ﷼</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.tabRow}>
          <View style={[styles.tabBar, {backgroundColor: theme.card}]}>
            {[['all', 'الكل'], ['income', 'إيرادات'], ['expense', 'مصروفات']].map(([id, l]) => (
              <TouchableOpacity key={id} onPress={() => setTab(id)} style={[styles.tabBtn, {backgroundColor: tab === id ? theme.primary : 'transparent'}]}>
                <Text style={{color: tab === id ? '#fff' : theme.mu, fontSize: 12, fontWeight: '700'}}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={() => setAddOpen(true)} style={[styles.addBtn, {backgroundColor: theme.primaryMid}]}>
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {shown.map(t => (
          <View key={t.id} style={[styles.trCard, {backgroundColor: theme.card, borderRightColor: t.type === 'إيراد' ? theme.ok : theme.err}]}>
            <View style={[styles.trIcon, {backgroundColor: (t.type === 'إيراد' ? theme.ok : theme.err) + '18'}]}>
              <Icon name={t.type === 'إيراد' ? 'arrowUp' : 'arrowDn'} size={22} color={t.type === 'إيراد' ? theme.ok : theme.err} />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: '700', fontSize: 14, color: theme.tx, textAlign: 'right'}}>{t.desc}</Text>
              <Text style={{fontSize: 11, color: theme.mu, marginTop: 1, textAlign: 'right'}}>{t.cat} · {t.date} · {t.ref}</Text>
            </View>
            <View style={{alignItems: 'flex-end'}}>
              <Text style={{fontWeight: '900', color: t.type === 'إيراد' ? theme.ok : theme.err, fontSize: 16}}>{t.type === 'إيراد' ? '+' : '-'}{t.amt.toLocaleString()} ﷼</Text>
              <View style={[styles.typeTag, {backgroundColor: (t.type === 'إيراد' ? theme.ok : theme.err) + '15'}]}>
                <Text style={{color: t.type === 'إيراد' ? theme.ok : theme.err, fontSize: 10, fontWeight: '700'}}>{t.type}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Sheet visible={addOpen} title="تسجيل معاملة مالية" onClose={() => { setAddOpen(false); setForm(blank); }} theme={theme}>
        <Field label="نوع المعاملة" value={form.type} onSelect={v => setForm({...form, type: v, cat: (v === 'إيراد' ? CATS_IN : CATS_EX)[0]})} opts={['إيراد', 'مصروف'].map(x => ({v: x, l: x}))} theme={theme} />
        <Field label="التصنيف" value={form.cat} onSelect={v => setForm({...form, cat: v})} opts={(form.type === 'إيراد' ? CATS_IN : CATS_EX).map(x => ({v: x, l: x}))} theme={theme} />
        <Field label="الوصف *" value={form.desc} onChangeText={v => setForm({...form, desc: v})} placeholder="وصف المعاملة" theme={theme} />
        <Field label="المبلغ (﷼) *" value={form.amt} onChangeText={v => setForm({...form, amt: v})} keyboardType="numeric" icon="money" theme={theme} />
        <Field label="التاريخ" value={form.date} onChangeText={v => setForm({...form, date: v})} theme={theme} />
        <Btn onPress={save} theme={theme}>تسجيل المعاملة</Btn>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  hero: {borderRadius: 22, padding: 20, marginBottom: 14},
  heroLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 4, textAlign: 'right'},
  heroValue: {fontSize: 34, fontWeight: '900', textAlign: 'right'},
  heroRow: {flexDirection: 'row-reverse', gap: 12, marginTop: 12},
  heroBox: {backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, flex: 1},
  heroBoxValue: {color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 2, textAlign: 'right'},
  rowGap: {flexDirection: 'row-reverse', alignItems: 'center', gap: 4},
  tabRow: {flexDirection: 'row-reverse', gap: 8, marginBottom: 14},
  tabBar: {flex: 1, borderRadius: 12, padding: 4, flexDirection: 'row-reverse'},
  tabBtn: {flex: 1, borderRadius: 8, paddingVertical: 8, alignItems: 'center'},
  addBtn: {borderRadius: 12, paddingHorizontal: 14, alignItems: 'center', justifyContent: 'center'},
  trCard: {borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, borderRightWidth: 3},
  trIcon: {width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  typeTag: {borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2, marginTop: 2},
});
