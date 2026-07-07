// src/navigation/RootNavigator.js
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, StatusBar} from 'react-native';
import {NavigationContainer, DrawerActions, useNavigation} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import LinearGradient from 'react-native-linear-gradient';
import {SafeAreaView} from 'react-native-safe-area-context';

import Icon from '../icons/Icon';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import DrawerContent from './DrawerContent';

import DashboardScreen from '../screens/DashboardScreen';
import MembersScreen from '../screens/MembersScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import AidScreen from '../screens/AidScreen';
import TreasuryScreen from '../screens/TreasuryScreen';
import VouchersScreen from '../screens/VouchersScreen';
import MessagesScreen from '../screens/MessagesScreen';
import SchedulerScreen from '../screens/SchedulerScreen';
import ReportsScreen from '../screens/ReportsScreen';
import FundInfoScreen from '../screens/FundInfoScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();

const TITLES = {
  Dashboard: 'الصندوق الاجتماعي التنموي',
  Members: 'إدارة الأعضاء',
  Subscriptions: 'الاشتراكات الشهرية',
  Aid: 'طلبات المساعدة',
  Treasury: 'إدارة الخزينة',
  Vouchers: 'سندات القبض والصرف',
  Messages: 'الرسائل الداخلية',
  Scheduler: 'المواعيد والجدول',
  Reports: 'التقارير والإحصائيات',
  FundInfo: 'بيانات الصندوق',
  Settings: 'الإعدادات',
};

function Header({title}) {
  const {theme} = useTheme();
  const {user, aids} = useData();
  const navigation = useNavigation();
  const pendingAids = aids.filter(a => a.status === 'قيد المراجعة').length;

  return (
    <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.header}>
      <View style={styles.headerRow}>
        <TouchableOpacity
          onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
          style={styles.menuBtn}>
          <Icon name="menu" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={{flex: 1, marginHorizontal: 10}}>
          <Text style={[styles.headerSmall, {color: theme.gold}]}>{user.role} · نظام v8.0</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
        </View>

        <View style={styles.headerActions}>
          <View style={styles.bellWrap}>
            <View style={styles.bellBtn}>
              <Icon name="bell" size={18} color="#fff" />
            </View>
            {pendingAids > 0 && (
              <View style={[styles.bellBadge, {backgroundColor: theme.err}]}>
                <Text style={styles.bellBadgeText}>{pendingAids}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={[styles.avatarBtn, {backgroundColor: theme.gold}]}>
            <Text style={[styles.avatarText, {color: theme.primaryDark}]}>{user.av}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

function ScreenWrapper({title, children}) {
  const {theme} = useTheme();
  return (
    <SafeAreaView style={{flex: 1, backgroundColor: theme.bg}} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={theme.primaryDark} />
      <Header title={title} />
      <View style={{flex: 1}}>{children}</View>
    </SafeAreaView>
  );
}

function withHeader(Component, title) {
  return function Wrapped(props) {
    return (
      <ScreenWrapper title={title}>
        <Component {...props} />
      </ScreenWrapper>
    );
  };
}

export default function RootNavigator() {
  const {theme} = useTheme();

  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Dashboard"
        drawerContent={props => <DrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerType: 'front',
          drawerStyle: {width: '80%', backgroundColor: theme.card},
          overlayColor: 'rgba(0,12,0,0.5)',
          swipeEnabled: true,
        }}>
        <Drawer.Screen name="Dashboard" component={withHeader(DashboardScreen, TITLES.Dashboard)} />
        <Drawer.Screen name="Members" component={withHeader(MembersScreen, TITLES.Members)} />
        <Drawer.Screen name="Subscriptions" component={withHeader(SubscriptionsScreen, TITLES.Subscriptions)} />
        <Drawer.Screen name="Aid" component={withHeader(AidScreen, TITLES.Aid)} />
        <Drawer.Screen name="Treasury" component={withHeader(TreasuryScreen, TITLES.Treasury)} />
        <Drawer.Screen name="Vouchers" component={withHeader(VouchersScreen, TITLES.Vouchers)} />
        <Drawer.Screen name="Messages" component={withHeader(MessagesScreen, TITLES.Messages)} />
        <Drawer.Screen name="Scheduler" component={withHeader(SchedulerScreen, TITLES.Scheduler)} />
        <Drawer.Screen name="Reports" component={withHeader(ReportsScreen, TITLES.Reports)} />
        <Drawer.Screen name="FundInfo" component={withHeader(FundInfoScreen, TITLES.FundInfo)} />
        <Drawer.Screen name="Settings" component={withHeader(SettingsScreen, TITLES.Settings)} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  header: {paddingHorizontal: 14, paddingVertical: 14},
  headerRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center'},
  menuBtn: {backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 10, padding: 9},
  headerSmall: {fontSize: 10, letterSpacing: 1.5, fontWeight: '800', marginBottom: 2, textAlign: 'right'},
  headerTitle: {color: '#fff', fontWeight: '900', fontSize: 15, textAlign: 'right'},
  headerActions: {flexDirection: 'row-reverse', alignItems: 'center', gap: 8},
  bellWrap: {position: 'relative'},
  bellBtn: {backgroundColor: 'rgba(255,255,255,0.14)', borderRadius: 10, padding: 8},
  bellBadge: {position: 'absolute', top: -3, left: -3, width: 17, height: 17, borderRadius: 9, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff'},
  bellBadgeText: {fontSize: 9, fontWeight: '900', color: '#fff'},
  avatarBtn: {width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center'},
  avatarText: {fontSize: 16, fontWeight: '900'},
});
