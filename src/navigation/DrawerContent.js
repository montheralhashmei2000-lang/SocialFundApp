// src/navigation/DrawerContent.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, ScrollView} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from '../icons/Icon';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';

const MENU_SECTIONS = [
  {
    title: null,
    items: [
      {route: 'Dashboard', label: 'الرئيسية', icon: 'dashboard'},
    ],
  },
  {
    title: 'العمليات',
    items: [
      {route: 'Members', label: 'الأعضاء', icon: 'members'},
      {route: 'Subscriptions', label: 'الاشتراكات', icon: 'subscriptions'},
      {route: 'Aid', label: 'طلبات المساعدة', icon: 'aid', badgeKey: 'pendingAids'},
      {route: 'Treasury', label: 'الخزينة', icon: 'bank'},
      {route: 'Vouchers', label: 'سندات القبض والصرف', icon: 'stamp'},
    ],
  },
  {
    title: 'التواصل والتنظيم',
    items: [
      {route: 'Messages', label: 'الرسائل الداخلية', icon: 'msg', badgeKey: 'unreadMsgs'},
      {route: 'Scheduler', label: 'المواعيد والجدول', icon: 'event'},
      {route: 'Reports', label: 'التقارير والإحصائيات', icon: 'reports'},
    ],
  },
  {
    title: 'النظام',
    items: [
      {route: 'FundInfo', label: 'بيانات الصندوق', icon: 'shield'},
      {route: 'Settings', label: 'الإعدادات', icon: 'settings'},
    ],
  },
];

export default function DrawerContent({navigation, state}) {
  const {theme} = useTheme();
  const {user, aids, msgs} = useData();
  const pendingAids = aids.filter(a => a.status === 'قيد المراجعة').length;
  const unreadMsgs = msgs.filter(m => !m.read && m.to === user.name).length;
  const badges = {pendingAids, unreadMsgs};

  const activeRouteName = state?.routes?.[state.index]?.name;

  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.card}} edges={['top', 'bottom']}>
      <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.header}>
        <LinearGradient colors={[theme.goldLight, theme.gold]} style={styles.avatar}>
          <Text style={[styles.avatarText, {color: theme.primaryDark}]}>{user.av}</Text>
        </LinearGradient>
        <Text style={styles.userName}>{user.name}</Text>
        <Text style={[styles.userRole, {color: theme.gold}]}>{user.role}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollBody}>
        {MENU_SECTIONS.map((section, si) => (
          <View key={si} style={styles.section}>
            {section.title && <Text style={[styles.sectionTitle, {color: theme.mu}]}>{section.title}</Text>}
            {section.items.map(item => {
              const active = activeRouteName === item.route;
              const badge = item.badgeKey ? badges[item.badgeKey] : 0;
              return (
                <TouchableOpacity
                  key={item.route}
                  onPress={() => navigation.navigate(item.route)}
                  style={[styles.item, active && {backgroundColor: theme.primary + '15'}]}>
                  <Icon name={item.icon} size={19} color={active ? theme.primary : theme.mu} />
                  <Text style={[styles.itemLabel, {color: active ? theme.primary : theme.tx, fontWeight: active ? '800' : '600'}]}>
                    {item.label}
                  </Text>
                  {badge > 0 && (
                    <View style={[styles.badge, {backgroundColor: theme.err}]}>
                      <Text style={styles.badgeText}>{badge}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={[styles.footer, {borderTopColor: theme.border}]}>
        <Text style={{fontSize: 10, color: theme.mu, textAlign: 'center'}}>الصندوق الاجتماعي التنموي · v8.0.0</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {padding: 22, alignItems: 'center'},
  avatar: {width: 62, height: 62, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 10},
  avatarText: {fontSize: 24, fontWeight: '900'},
  userName: {color: '#fff', fontWeight: '900', fontSize: 15},
  userRole: {fontSize: 12, fontWeight: '700', marginTop: 2},
  scrollBody: {paddingVertical: 10},
  section: {marginBottom: 8},
  sectionTitle: {fontSize: 10, fontWeight: '800', letterSpacing: 0.6, paddingHorizontal: 20, marginTop: 12, marginBottom: 6, textAlign: 'right'},
  item: {flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 12, marginHorizontal: 8, borderRadius: 10},
  itemLabel: {fontSize: 13, flex: 1, textAlign: 'right'},
  badge: {minWidth: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5},
  badgeText: {color: '#fff', fontSize: 10, fontWeight: '900'},
  footer: {padding: 14, borderTopWidth: 1},
});
