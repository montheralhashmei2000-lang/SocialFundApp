// src/screens/SchedulerScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from '../icons/Icon';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import newId from '../api/newId';

const TYPES = ['اجتماع', 'توزيع', 'مالي', 'عضوية', 'تدريب', 'أخرى'];
const COLORS = ['#1B5E20', '#0D47A1', '#BF6000', '#6A1B9A', '#B71C1C', '#00695C'];
const TYPE_ICON = {اجتماع: 'members', توزيع: 'money', مالي: 'bank', عضوية: 'person', تدريب: 'star', أخرى: 'event'};

export default function SchedulerScreen() {
  const {theme} = useTheme();
  const {events, setEvents, toast} = useData();
  const [addOpen, setAddOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const blank = {title: '', date: '', time: '', place: '', type: 'اجتماع', color: COLORS[0]};
  const [form, setForm] = useState(blank);

  const upcoming = [...events].sort((a, b) => a.date.localeCompare(b.date));

  const save = () => {
    if (!form.title || !form.date) { toast('يرجى إدخال العنوان والتاريخ', 'error'); return; }
    setEvents([...events, {id: newId(), ...form}]);
    setAddOpen(false); setForm(blank); toast('تم إضافة الحدث', 'success');
  };

  const del = id => {
    setEvents(events.filter(e => e.id !== id));
    setSel(null); toast('تم حذف الحدث', 'success');
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={{fontWeight: '800', fontSize: 16, color: theme.tx}}>المواعيد والجدول</Text>
          <TouchableOpacity onPress={() => setAddOpen(true)} style={[styles.newBtn, {backgroundColor: theme.primaryMid}]}>
            <Icon name="add" size={16} color="#fff" />
            <Text style={styles.newBtnText}>حدث جديد</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.calCard, {backgroundColor: theme.card}]}>
          <Text style={{fontWeight: '800', fontSize: 14, color: theme.tx, marginBottom: 12, textAlign: 'right'}}>ديسمبر 2024</Text>
          <View style={styles.calGrid}>
            {['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'].map(d => (
              <Text key={d} style={[styles.calDayLabel, {color: theme.mu}]}>{d}</Text>
            ))}
            {Array.from({length: 31}, (_, i) => i + 1).map(day => {
              const dateStr = `2024-12-${String(day).padStart(2, '0')}`;
              const hasEvent = events.some(e => e.date === dateStr);
              const today = day === 30;
              return (
                <TouchableOpacity
                  key={day}
                  disabled={!hasEvent}
                  onPress={() => { const e = events.find(ev => ev.date === dateStr); if (e) setSel(e); }}
                  style={[styles.calDay, {backgroundColor: today ? theme.primary : hasEvent ? theme.primary + '15' : 'transparent'}]}>
                  <Text style={{fontSize: 12, fontWeight: today ? '900' : '400', color: today ? '#fff' : hasEvent ? theme.primary : theme.tx}}>{day}</Text>
                  {hasEvent && !today && <View style={[styles.calDot, {backgroundColor: theme.primary}]} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {upcoming.map(ev => (
          <TouchableOpacity key={ev.id} onPress={() => setSel(ev)} style={[styles.evCard, {backgroundColor: theme.card, borderRightColor: ev.color}]}>
            <View style={[styles.evIcon, {backgroundColor: ev.color + '18'}]}>
              <Icon name={TYPE_ICON[ev.type] || 'event'} size={22} color={ev.color} />
            </View>
            <View style={{flex: 1}}>
              <Text style={{fontWeight: '800', fontSize: 14, color: theme.tx, textAlign: 'right'}}>{ev.title}</Text>
              <Text style={{fontSize: 12, color: theme.sub, marginTop: 2, textAlign: 'right'}}>{ev.date} {ev.time ? `· ${ev.time}` : ''}</Text>
              {ev.place ? <Text style={{fontSize: 11, color: theme.mu, marginTop: 1, textAlign: 'right'}}>📍 {ev.place}</Text> : null}
            </View>
            <View style={[styles.evTag, {backgroundColor: ev.color + '18'}]}>
              <Text style={{color: ev.color, fontSize: 11, fontWeight: '700'}}>{ev.type}</Text>
            </View>
          </TouchableOpacity>
        ))}

        {events.length === 0 && (
          <View style={{alignItems: 'center', paddingVertical: 32}}>
            <Icon name="event" size={40} color={theme.border} />
            <Text style={{color: theme.mu, marginTop: 8}}>لا توجد أحداث</Text>
          </View>
        )}
      </ScrollView>

      <Sheet visible={addOpen} title="إضافة حدث" onClose={() => { setAddOpen(false); setForm(blank); }} theme={theme}>
        <Field label="عنوان الحدث *" value={form.title} onChangeText={v => setForm({...form, title: v})} placeholder="عنوان الحدث" theme={theme} />
        <Field label="التاريخ * (YYYY-MM-DD)" value={form.date} onChangeText={v => setForm({...form, date: v})} placeholder="2024-12-30" theme={theme} />
        <Field label="الوقت" value={form.time} onChangeText={v => setForm({...form, time: v})} placeholder="10:00" theme={theme} />
        <Field label="المكان" value={form.place} onChangeText={v => setForm({...form, place: v})} placeholder="مقر الصندوق" theme={theme} />
        <Field label="النوع" value={form.type} onSelect={v => setForm({...form, type: v})} opts={TYPES.map(t => ({v: t, l: t}))} theme={theme} />
        <View style={{marginBottom: 14}}>
          <Text style={{fontSize: 12, color: theme.sub, marginBottom: 8, fontWeight: '700', textAlign: 'right'}}>اللون</Text>
          <View style={{flexDirection: 'row-reverse', gap: 8}}>
            {COLORS.map(c => (
              <TouchableOpacity key={c} onPress={() => setForm({...form, color: c})} style={[styles.colorDot, {backgroundColor: c, borderColor: form.color === c ? theme.tx : 'transparent'}]} />
            ))}
          </View>
        </View>
        <Btn onPress={save} theme={theme}>إضافة الحدث</Btn>
      </Sheet>

      <Sheet visible={!!sel} title="تفاصيل الحدث" onClose={() => setSel(null)} theme={theme}>
        {sel && (
          <View>
            <View style={[styles.detailBox, {backgroundColor: sel.color + '18', borderRightColor: sel.color}]}>
              <Text style={{fontWeight: '900', fontSize: 18, color: theme.tx, marginBottom: 8, textAlign: 'right'}}>{sel.title}</Text>
              {[['التاريخ', sel.date], ['الوقت', sel.time || '—'], ['المكان', sel.place || '—'], ['النوع', sel.type]].map(([k, v]) => (
                <View key={k} style={[styles.detailRow, {borderTopColor: theme.border}]}>
                  <Text style={{color: theme.sub, fontSize: 13}}>{k}</Text>
                  <Text style={{fontWeight: '700', color: theme.tx, fontSize: 13}}>{v}</Text>
                </View>
              ))}
            </View>
            <Btn onPress={() => del(sel.id)} variant="danger" theme={theme}>حذف الحدث</Btn>
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
  calCard: {borderRadius: 16, padding: 16, marginBottom: 14},
  calGrid: {flexDirection: 'row', flexWrap: 'wrap'},
  calDayLabel: {width: `${100 / 7}%`, fontSize: 10, fontWeight: '700', textAlign: 'center', paddingVertical: 4},
  calDay: {width: `${100 / 7}%`, alignItems: 'center', paddingVertical: 6, borderRadius: 8, position: 'relative'},
  calDot: {position: 'absolute', bottom: 2, width: 4, height: 4, borderRadius: 2},
  evCard: {borderRadius: 14, padding: 14, marginBottom: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 12, borderRightWidth: 3},
  evIcon: {width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  evTag: {borderRadius: 20, paddingHorizontal: 10, paddingVertical: 3},
  colorDot: {width: 28, height: 28, borderRadius: 8, borderWidth: 3},
  detailBox: {borderRadius: 14, padding: 16, marginBottom: 16, borderRightWidth: 3},
  detailRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 7, borderTopWidth: 1},
});
