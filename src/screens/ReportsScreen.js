// src/screens/ReportsScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Icon from '../icons/Icon';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';

const AID_TYPES = ['مساعدة زواج', 'مساعدة وفاة', 'مساعدة مرضية', 'مساعدة تعليمية', 'مساعدة ولادة', 'مساعدة طارئة'];

export default function ReportsScreen() {
  const {theme} = useTheme();
  const {members, aids, subs, treasury} = useData();
  const [tab, setTab] = useState('summary');

  const total = members.reduce((s, m) => s + m.paid, 0);
  const collected = subs.reduce((s, x) => s + x.amt, 0);
  const spent = aids.filter(a => a.status === 'مصروفة').reduce((s, a) => s + a.amt, 0);
  const income = treasury.filter(t => t.type === 'إيراد').reduce((s, t) => s + t.amt, 0);
  const expense = treasury.filter(t => t.type === 'مصروف').reduce((s, t) => s + t.amt, 0);

  const TABS = [['summary', 'ملخص'], ['members', 'الأعضاء'], ['aids', 'المساعدات'], ['financial', 'مالي']];

  return (
    <ScrollView style={{flex: 1, backgroundColor: theme.bg}} contentContainerStyle={styles.container}>
      <View style={[styles.tabBar, {backgroundColor: theme.card}]}>
        {TABS.map(([id, l]) => (
          <TouchableOpacity key={id} onPress={() => setTab(id)} style={[styles.tabBtn, {backgroundColor: tab === id ? theme.primary : 'transparent'}]}>
            <Text style={{color: tab === id ? '#fff' : theme.mu, fontSize: 12, fontWeight: '700'}}>{l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'summary' && (
        <>
          {[
            {l: 'أرصدة الصندوق', v: total, c: theme.primary, icon: 'shield'},
            {l: 'الاشتراكات', v: collected, c: theme.ok, icon: 'trendingUp'},
            {l: 'المساعدات المصروفة', v: spent, c: theme.err, icon: 'money'},
            {l: 'صافي الخزينة', v: income - expense, c: theme.info, icon: 'bank'},
          ].map(r => (
            <View key={r.l} style={[styles.reportCard, {backgroundColor: theme.card, borderRightColor: r.c}]}>
              <View>
                <Text style={{fontSize: 12, color: theme.sub, marginBottom: 5, textAlign: 'right'}}>{r.l}</Text>
                <Text style={{fontSize: 28, fontWeight: '900', color: r.c, textAlign: 'right'}}>{r.v.toLocaleString()} ﷼</Text>
              </View>
              <View style={[styles.reportIcon, {backgroundColor: r.c + '1A'}]}>
                <Icon name={r.icon} size={24} color={r.c} />
              </View>
            </View>
          ))}
        </>
      )}

      {tab === 'members' && (
        <>
          <View style={styles.statsRow}>
            {[{l: 'نشط', c: theme.ok, n: members.filter(m => m.status === 'نشط').length}, {l: 'معلق', c: theme.warn, n: members.filter(m => m.status === 'معلق').length}, {l: 'إجمالي', c: theme.primary, n: members.length}].map(s => (
              <View key={s.l} style={[styles.statBox, {backgroundColor: s.c + '12', borderTopColor: s.c}]}>
                <Text style={{fontSize: 28, fontWeight: '900', color: s.c}}>{s.n}</Text>
                <Text style={{fontSize: 11, color: theme.sub}}>{s.l}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.listCard, {backgroundColor: theme.card}]}>
            <Text style={[styles.listTitle, {color: theme.tx}]}>ترتيب الأعضاء بالمدفوعات</Text>
            {[...members].sort((a, b) => b.paid - a.paid).map((m, i) => (
              <View key={m.id} style={[styles.listRow, {borderBottomColor: theme.border}]}>
                <View style={styles.rowGap}>
                  <View style={[styles.rankBadge, {backgroundColor: i < 3 ? theme.gold + '22' : theme.bg}]}>
                    <Text style={{fontSize: 11, fontWeight: '800', color: i < 3 ? theme.goldDark : theme.mu}}>{i + 1}</Text>
                  </View>
                  <View style={[styles.miniAvatar, {backgroundColor: theme.primary}]}>
                    <Text style={{color: '#fff', fontWeight: '800', fontSize: 13}}>{m.name[0]}</Text>
                  </View>
                  <Text style={{fontSize: 13, color: theme.tx, fontWeight: '600'}}>{m.name}</Text>
                </View>
                <Text style={{fontWeight: '800', color: theme.primary, fontSize: 13}}>{m.paid.toLocaleString()} ﷼</Text>
              </View>
            ))}
          </View>
        </>
      )}

      {tab === 'aids' && (
        <>
          <View style={styles.statsGrid2}>
            {['قيد المراجعة', 'معتمدة', 'مصروفة', 'مرفوضة'].map((st, i) => {
              const cs = [theme.warn, theme.ok, theme.info, theme.err][i];
              const items = aids.filter(a => a.status === st);
              return (
                <View key={st} style={[styles.statBox2, {backgroundColor: cs + '12', borderTopColor: cs}]}>
                  <Text style={{fontSize: 26, fontWeight: '900', color: cs}}>{items.length}</Text>
                  <Text style={{fontSize: 11, color: theme.sub, marginTop: 2}}>{st}</Text>
                  <Text style={{fontSize: 12, color: cs, fontWeight: '700', marginTop: 3}}>{items.reduce((s, a) => s + a.amt, 0).toLocaleString()} ﷼</Text>
                </View>
              );
            })}
          </View>
          <View style={[styles.listCard, {backgroundColor: theme.card}]}>
            <Text style={[styles.listTitle, {color: theme.tx}]}>المساعدات حسب النوع</Text>
            {AID_TYPES.map((t, i) => {
              const cs = [theme.primary, theme.err, theme.warn, theme.info, theme.gold, '#9C27B0'][i];
              const items = aids.filter(a => a.type === t);
              if (!items.length) return null;
              return (
                <View key={t} style={[styles.listRow, {borderBottomColor: theme.border}]}>
                  <View style={styles.rowGap}>
                    <View style={[styles.colorDot, {backgroundColor: cs}]} />
                    <Text style={{fontSize: 13, color: theme.sub}}>{t}</Text>
                  </View>
                  <View style={styles.rowGap}>
                    <Text style={{fontWeight: '700', color: theme.primary, fontSize: 13}}>{items.reduce((s, a) => s + a.amt, 0).toLocaleString()} ﷼</Text>
                    <View style={[styles.countTag, {backgroundColor: cs + '15'}]}>
                      <Text style={{color: cs, fontSize: 11, fontWeight: '700'}}>{items.length}</Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        </>
      )}

      {tab === 'financial' && (
        <>
          <View style={[styles.listCard, {backgroundColor: theme.card}]}>
            <Text style={[styles.listTitle, {color: theme.tx}]}>ملخص مالي شامل</Text>
            {[{l: 'إجمالي الإيرادات', v: income, c: theme.ok}, {l: 'إجمالي المصروفات', v: expense, c: theme.err}, {l: 'صافي الخزينة', v: income - expense, c: theme.info}].map(r => (
              <View key={r.l} style={[styles.listRow, {borderBottomColor: theme.border}]}>
                <Text style={{color: theme.sub, fontSize: 13}}>{r.l}</Text>
                <Text style={{fontWeight: '800', color: r.c, fontSize: 14}}>{r.v.toLocaleString()} ﷼</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  tabBar: {borderRadius: 14, padding: 4, marginBottom: 14, flexDirection: 'row-reverse'},
  tabBtn: {flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center'},
  reportCard: {borderRadius: 16, padding: 18, marginBottom: 10, flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderRightWidth: 4},
  reportIcon: {borderRadius: 12, padding: 12},
  statsRow: {flexDirection: 'row', gap: 10, marginBottom: 14},
  statBox: {flex: 1, borderRadius: 14, padding: 14, alignItems: 'center', borderTopWidth: 3},
  listCard: {borderRadius: 16, padding: 16, marginBottom: 10},
  listTitle: {fontWeight: '800', fontSize: 14, marginBottom: 12, textAlign: 'right'},
  listRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1},
  rowGap: {flexDirection: 'row-reverse', alignItems: 'center', gap: 8},
  rankBadge: {width: 22, height: 22, borderRadius: 6, alignItems: 'center', justifyContent: 'center'},
  miniAvatar: {width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  statsGrid2: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14},
  statBox2: {width: '48%', borderRadius: 14, padding: 14, borderTopWidth: 3},
  colorDot: {width: 10, height: 10, borderRadius: 3},
  countTag: {borderRadius: 20, paddingHorizontal: 8, paddingVertical: 2},
});
