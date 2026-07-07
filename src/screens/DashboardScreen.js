// src/screens/DashboardScreen.js
import React, {useMemo, useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../icons/Icon';
import Card from '../components/Card';
import Donut from '../components/charts/Donut';
import BarChart from '../components/charts/BarChart';
import LineChart from '../components/charts/LineChart';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import {AID_TYPES} from '../data';

const AID_COLORS = ['#1B5E20', '#B71C1C', '#E65100', '#0D47A1', '#F9A825', '#6A1B9A'];
const MONTHS_AR = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

function lastNMonthsKeys(n) {
  const now = new Date();
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`, label: MONTHS_AR[d.getMonth()].slice(0, 3)});
  }
  return out;
}

export default function DashboardScreen({navigation}) {
  const {theme} = useTheme();
  const {members, aids, subs, treasury} = useData();
  const [period, setPeriod] = useState('6m');

  const total = members.reduce((s, m) => s + m.paid, 0);
  const monthS = subs.reduce((s, x) => s + x.amt, 0);
  const spent = aids.filter(a => a.status === 'مصروفة').reduce((s, a) => s + a.amt, 0);
  const pending = aids.filter(a => a.status === 'قيد المراجعة').length;
  const overdue = members.filter(m => m.balance > 0).length;
  const income = treasury.filter(t => t.type === 'إيراد').reduce((s, t) => s + t.amt, 0);
  const expense = treasury.filter(t => t.type === 'مصروف').reduce((s, t) => s + t.amt, 0);
  const activeMembers = members.filter(m => m.status === 'نشط').length;
  const collectionRate = members.length ? Math.round((activeMembers / members.length) * 100) : 0;
  const avgSub = subs.length ? Math.round(monthS / subs.length) : 0;

  const monthsCount = period === '3m' ? 3 : period === '12m' ? 12 : 6;
  const monthKeys = useMemo(() => lastNMonthsKeys(monthsCount), [monthsCount]);
  const trend = useMemo(() => {
    return monthKeys.map(mk => {
      const inSum = treasury.filter(t => t.type === 'إيراد' && t.date.startsWith(mk.key)).reduce((s, t) => s + t.amt, 0);
      const exSum = treasury.filter(t => t.type === 'مصروف' && t.date.startsWith(mk.key)).reduce((s, t) => s + t.amt, 0);
      return {label: mk.label, income: inSum, expense: exSum, net: inSum - exSum};
    });
  }, [monthKeys, treasury]);

  const hasTrendData = trend.some(t => t.income > 0 || t.expense > 0);

  const aidSegs = AID_TYPES.map((t, i) => ({
    label: t,
    value: aids.filter(a => a.type === t).length,
    color: AID_COLORS[i % AID_COLORS.length],
  })).filter(s => s.value > 0);

  const memberStatusSegs = [
    {label: 'نشط', value: members.filter(m => m.status === 'نشط').length, color: theme.ok},
    {label: 'معلق', value: members.filter(m => m.status === 'معلق').length, color: theme.warn},
  ];

  const aidStatusBars = [
    {label: 'معلق', value: aids.filter(a => a.status === 'قيد المراجعة').length, color: theme.warn},
    {label: 'معتمد', value: aids.filter(a => a.status === 'معتمدة').length, color: theme.ok},
    {label: 'مصروف', value: aids.filter(a => a.status === 'مصروفة').length, color: theme.info},
    {label: 'مرفوض', value: aids.filter(a => a.status === 'مرفوضة').length, color: theme.err},
  ];

  const topPayers = [...members].sort((a, b) => b.paid - a.paid).slice(0, 5);

  const KPI = [
    {l: 'الأعضاء النشطون', v: activeMembers, sub: `من ${members.length}`, icon: 'members', c: theme.primary, trend: `${collectionRate}%`},
    {l: 'طلبات معلقة', v: pending, sub: 'تحتاج مراجعة', icon: 'bell', c: theme.warn, nav: 'Aid'},
    {l: 'متوسط الاشتراك', v: `${avgSub.toLocaleString()}`, sub: '﷼ / معاملة', icon: 'money', c: theme.gold},
    {l: 'متأخرون عن الدفع', v: overdue, sub: 'عضو', icon: 'warning', c: theme.err},
  ];

  const QUICK = [
    {l: 'عضو جديد', icon: 'person', c: theme.primary, nav: 'Members'},
    {l: 'اشتراك', icon: 'money', c: theme.gold, nav: 'Subscriptions'},
    {l: 'مساعدة', icon: 'aid', c: theme.info, nav: 'Aid'},
    {l: 'سندات', icon: 'stamp', c: theme.goldDark, nav: 'Vouchers'},
    {l: 'الخزينة', icon: 'bank', c: theme.ok, nav: 'Treasury'},
  ];

  return (
    <ScrollView style={{flex: 1, backgroundColor: theme.bg}} contentContainerStyle={styles.container}>
      <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.hero}>
        <Text style={styles.heroLabel}>الرصيد الإجمالي للصندوق</Text>
        <Text style={styles.heroValue}>{total.toLocaleString()} <Text style={styles.heroCurrency}>﷼</Text></Text>
        <View style={styles.heroChips}>
          <View style={styles.chip}>
            <Text style={[styles.chipLabel, {color: theme.gold}]}>اشتراكات الشهر</Text>
            <Text style={styles.chipValue}>+{monthS.toLocaleString()} ﷼</Text>
          </View>
          <View style={styles.chip}>
            <Text style={[styles.chipLabel, {color: '#FF8A80'}]}>مصروفات العام</Text>
            <Text style={styles.chipValue}>-{spent.toLocaleString()} ﷼</Text>
          </View>
          <View style={styles.chip}>
            <Text style={[styles.chipLabel, {color: income - expense >= 0 ? '#69F0AE' : '#FF8A80'}]}>صافي الخزينة</Text>
            <Text style={styles.chipValue}>{(income - expense).toLocaleString()} ﷼</Text>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.kpiGrid}>
        {KPI.map(k => (
          <TouchableOpacity
            key={k.l}
            activeOpacity={k.nav ? 0.7 : 1}
            onPress={() => k.nav && navigation.navigate(k.nav)}
            style={[styles.kpiCard, {backgroundColor: theme.card, borderTopColor: k.c}]}>
            <View style={styles.kpiTop}>
              <View style={{flex: 1}}>
                <Text style={[styles.kpiLabel, {color: theme.mu}]}>{k.l}</Text>
                <Text style={[styles.kpiValue, {color: theme.tx}]}>{k.v}</Text>
                <View style={styles.kpiSubRow}>
                  <Text style={[styles.kpiSub, {color: theme.mu}]}>{k.sub}</Text>
                  {k.trend ? (
                    <View style={[styles.trendBadge, {backgroundColor: theme.ok + '18'}]}>
                      <Icon name="trendingUp" size={9} color={theme.ok} />
                      <Text style={{fontSize: 9, color: theme.ok, fontWeight: '700'}}>{k.trend}</Text>
                    </View>
                  ) : null}
                </View>
              </View>
              <View style={[styles.kpiIconWrap, {backgroundColor: k.c + '1A'}]}>
                <Icon name={k.icon} size={20} color={k.c} />
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <Card theme={theme} style={{marginBottom: 14}}>
        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, {color: theme.tx, marginBottom: 0}]}>اتجاه الإيرادات والمصروفات</Text>
          <View style={styles.periodSwitch}>
            {[['3m', '3 أشهر'], ['6m', '6 أشهر'], ['12m', 'سنة']].map(([id, l]) => (
              <TouchableOpacity
                key={id}
                onPress={() => setPeriod(id)}
                style={[styles.periodBtn, {backgroundColor: period === id ? theme.primary : 'transparent'}]}>
                <Text style={{fontSize: 10, fontWeight: '700', color: period === id ? '#fff' : theme.mu}}>{l}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {hasTrendData ? (
          <>
            <LineChart points={trend.map(t => ({label: t.label, value: t.income}))} theme={theme} color={theme.ok} height={130} />
            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: theme.ok}]} />
                <Text style={{fontSize: 10, color: theme.mu}}>الإيرادات</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.emptyChart}>
            <Icon name="reports" size={32} color={theme.border} />
            <Text style={{color: theme.mu, fontSize: 12, marginTop: 8}}>لا توجد بيانات خزينة كافية لعرض الاتجاه بعد</Text>
          </View>
        )}
      </Card>

      <View style={styles.chartsRow}>
        <Card theme={theme} style={{flex: 1}}>
          <Text style={[styles.sectionTitle, {color: theme.tx, fontSize: 12}]}>توزيع المساعدات</Text>
          {aidSegs.length > 0 ? (
            <>
              <View style={{alignItems: 'center', marginVertical: 6}}>
                <Donut segments={aidSegs.map(s => ({value: s.value, color: s.color}))} size={104} strokeWidth={12} centerLabel={String(aids.length)} centerSub="طلب" theme={theme} />
              </View>
              <View style={styles.donutLegend}>
                {aidSegs.slice(0, 4).map(s => (
                  <View key={s.label} style={styles.legendItem}>
                    <View style={[styles.legendDot, {backgroundColor: s.color}]} />
                    <Text numberOfLines={1} style={{fontSize: 9, color: theme.mu, flex: 1}}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <View style={styles.emptySmall}>
              <Text style={{color: theme.mu, fontSize: 11}}>لا توجد طلبات</Text>
            </View>
          )}
        </Card>

        <Card theme={theme} style={{flex: 1}}>
          <Text style={[styles.sectionTitle, {color: theme.tx, fontSize: 12}]}>حالة الأعضاء</Text>
          <View style={{alignItems: 'center', marginVertical: 6}}>
            <Donut segments={memberStatusSegs.map(s => ({value: s.value, color: s.color}))} size={104} strokeWidth={12} centerLabel={String(members.length)} centerSub="عضو" theme={theme} />
          </View>
          <View style={styles.donutLegend}>
            {memberStatusSegs.map(s => (
              <View key={s.label} style={styles.legendItem}>
                <View style={[styles.legendDot, {backgroundColor: s.color}]} />
                <Text style={{fontSize: 10, color: theme.mu}}>{s.label} ({s.value})</Text>
              </View>
            ))}
          </View>
        </Card>
      </View>

      <Card theme={theme} style={{marginBottom: 14}}>
        <Text style={[styles.sectionTitle, {color: theme.tx}]}>حالات طلبات المساعدة</Text>
        <BarChart bars={aidStatusBars} height={100} theme={theme} />
      </Card>

      <Card theme={theme} style={{marginBottom: 14}}>
        <View style={styles.rowBetween}>
          <Text style={[styles.sectionTitle, {color: theme.tx, marginBottom: 0}]}>الأعضاء الأكثر مساهمة</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Reports')}>
            <Text style={{color: theme.primary, fontSize: 12, fontWeight: '700'}}>التقرير الكامل</Text>
          </TouchableOpacity>
        </View>
        {topPayers.map((m, i) => (
          <View key={m.id} style={[styles.payerRow, {borderBottomColor: theme.border}]}>
            <View style={styles.rowGap}>
              <View style={[styles.rankBadge, {backgroundColor: i < 3 ? theme.gold + '22' : theme.bg}]}>
                <Text style={{fontSize: 10, fontWeight: '800', color: i < 3 ? theme.goldDark : theme.mu}}>{i + 1}</Text>
              </View>
              <View style={[styles.avatar, {backgroundColor: theme.primary + '1A'}]}>
                <Text style={{fontWeight: '800', color: theme.primary, fontSize: 13}}>{m.name[0]}</Text>
              </View>
              <Text style={{fontSize: 13, fontWeight: '700', color: theme.tx}}>{m.name}</Text>
            </View>
            <Text style={{fontWeight: '900', color: theme.primary, fontSize: 13}}>{m.paid.toLocaleString()} ﷼</Text>
          </View>
        ))}
      </Card>

      <Card theme={theme} style={{marginBottom: 14}}>
        <Text style={[styles.sectionTitle, {color: theme.tx}]}>الوصول السريع</Text>
        <View style={styles.quickGrid}>
          {QUICK.map(a => (
            <TouchableOpacity key={a.l} onPress={() => navigation.navigate(a.nav)} style={[styles.quickBtn, {backgroundColor: a.c + '15'}]}>
              <Icon name={a.icon} size={19} color={a.c} />
              <Text style={[styles.quickLabel, {color: a.c}]}>{a.l}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </Card>

      <Card theme={theme}>
        <View style={styles.rowBetween}>
          <View style={styles.rowGap}>
            <Icon name="money" size={16} color={theme.gold} />
            <Text style={[styles.sectionTitle, {color: theme.tx, marginBottom: 0}]}>آخر الاشتراكات</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Subscriptions')}>
            <Text style={{color: theme.primary, fontSize: 12, fontWeight: '700'}}>عرض الكل</Text>
          </TouchableOpacity>
        </View>
        {subs.slice(0, 4).map(s => (
          <View key={s.id} style={[styles.activityRow, {borderBottomColor: theme.border}]}>
            <View style={styles.rowGap}>
              <View style={[styles.avatar, {backgroundColor: theme.primary + '1A'}]}>
                <Text style={{fontWeight: '800', color: theme.primary, fontSize: 14}}>{s.mn[0]}</Text>
              </View>
              <View>
                <Text style={{fontSize: 13, fontWeight: '700', color: theme.tx}}>{s.mn}</Text>
                <Text style={{fontSize: 11, color: theme.mu}}>{s.date} · {s.method}</Text>
              </View>
            </View>
            <Text style={{fontWeight: '900', color: theme.ok, fontSize: 15}}>+{s.amt.toLocaleString()} ﷼</Text>
          </View>
        ))}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  hero: {borderRadius: 24, padding: 22, marginBottom: 14},
  heroLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 12, marginBottom: 4},
  heroValue: {color: '#fff', fontSize: 36, fontWeight: '900'},
  heroCurrency: {fontSize: 18, fontWeight: '500'},
  heroChips: {flexDirection: 'row-reverse', gap: 10, marginTop: 12, flexWrap: 'wrap'},
  chip: {backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7},
  chipLabel: {fontSize: 10, fontWeight: '700'},
  chipValue: {color: '#fff', fontSize: 14, fontWeight: '800'},
  kpiGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 14},
  kpiCard: {width: '48%', borderRadius: 16, padding: 14, borderTopWidth: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.07, shadowRadius: 8, elevation: 3},
  kpiTop: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'flex-start'},
  kpiLabel: {fontSize: 11, marginBottom: 4, textAlign: 'right'},
  kpiValue: {fontSize: 26, fontWeight: '900', textAlign: 'right'},
  kpiSubRow: {flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 3},
  kpiSub: {fontSize: 11, textAlign: 'right'},
  trendBadge: {flexDirection: 'row-reverse', alignItems: 'center', gap: 2, borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1},
  kpiIconWrap: {borderRadius: 10, padding: 8},
  sectionTitle: {fontWeight: '800', fontSize: 14, marginBottom: 12, textAlign: 'right'},
  rowBetween: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12},
  rowGap: {flexDirection: 'row-reverse', alignItems: 'center', gap: 8},
  periodSwitch: {flexDirection: 'row-reverse', backgroundColor: 'rgba(0,0,0,0.04)', borderRadius: 8, padding: 2},
  periodBtn: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6},
  legendRow: {flexDirection: 'row-reverse', gap: 12, marginTop: 8, justifyContent: 'center'},
  legendItem: {flexDirection: 'row-reverse', alignItems: 'center', gap: 4},
  legendDot: {width: 8, height: 8, borderRadius: 4},
  emptyChart: {alignItems: 'center', paddingVertical: 24},
  emptySmall: {alignItems: 'center', paddingVertical: 20},
  chartsRow: {flexDirection: 'row', gap: 10, marginBottom: 14},
  donutLegend: {gap: 4, marginTop: 4},
  payerRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1},
  rankBadge: {width: 20, height: 20, borderRadius: 6, alignItems: 'center', justifyContent: 'center'},
  avatar: {width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  quickGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'space-between'},
  quickBtn: {width: '18%', borderRadius: 12, paddingVertical: 10, alignItems: 'center', gap: 5},
  quickLabel: {fontSize: 9, fontWeight: '700', textAlign: 'center'},
  activityRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 9, borderBottomWidth: 1},
});
