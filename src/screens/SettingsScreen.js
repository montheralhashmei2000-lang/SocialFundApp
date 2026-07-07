// src/screens/SettingsScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../icons/Icon';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import Toggle from '../components/Toggle';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import * as authApi from '../api/auth';
import {ApiError, NetworkError} from '../api/client';

export default function SettingsScreen() {
  const {theme, dark, setDark} = useTheme();
  const {user, setUser, toast, resetAllData, syncNow, syncing, pendingCount, isOffline} = useData();

  const [bioOn, setBio] = useState(false);
  const [notif, setNotif] = useState(true);
  const [autoLk, setAuto] = useState(true);
  const [sound, setSound] = useState(true);
  const [pwSh, setPwSh] = useState(false);
  const [pwBusy, setPwBusy] = useState(false);
  const [about, setAbout] = useState(false);
  const [logoutSh, setLogout] = useState(false);
  const [resetSh, setResetSh] = useState(false);
  const [oldPw, setOld] = useState('');
  const [newPw, setNew] = useState('');
  const [conPw, setCon] = useState('');

  const changePw = async () => {
    if (!oldPw || !newPw || !conPw) { toast('يرجى ملء جميع الحقول', 'error'); return; }
    if (newPw !== conPw) { toast('كلمتا المرور غير متطابقتين', 'error'); return; }
    if (newPw.length < 4) { toast('كلمة المرور قصيرة جداً', 'error'); return; }

    setPwBusy(true);
    try {
      await authApi.changePassword(oldPw, newPw);
      toast('تم تغيير كلمة المرور ✓', 'success');
      setPwSh(false); setOld(''); setNew(''); setCon('');
    } catch (e) {
      if (e instanceof NetworkError) toast('لا يوجد اتصال بالخادم', 'error');
      else if (e instanceof ApiError) toast(e.message, 'error');
      else toast('حدث خطأ غير متوقع', 'error');
    } finally {
      setPwBusy(false);
    }
  };

  const logout = () => { setUser(null); setLogout(false); };

  const doReset = async () => {
    await resetAllData();
    setResetSh(false);
    toast('تمت إعادة تعيين جميع البيانات إلى القيم الافتراضية', 'success');
  };

  const Sec = ({title, children}) => (
    <View style={[styles.sec, {backgroundColor: theme.card}]}>
      <Text style={[styles.secTitle, {color: theme.mu, borderBottomColor: theme.border}]}>{title}</Text>
      {children}
    </View>
  );

  const Row = ({icon, iconColor, label, sub, right, onPress, danger, last}) => (
    <TouchableOpacity onPress={onPress} disabled={!onPress} style={[styles.row, {borderBottomWidth: last ? 0 : 1, borderBottomColor: theme.border}]}>
      <View style={[styles.rowIcon, {backgroundColor: (danger ? theme.err : iconColor || theme.primary) + '1A'}]}>
        <Icon name={icon} size={18} color={danger ? theme.err : iconColor || theme.primary} />
      </View>
      <View style={{flex: 1}}>
        <Text style={{fontSize: 14, fontWeight: '700', color: danger ? theme.err : theme.tx, textAlign: 'right'}}>{label}</Text>
        {sub ? <Text style={{fontSize: 11, color: theme.mu, marginTop: 1, textAlign: 'right'}}>{sub}</Text> : null}
      </View>
      {right !== undefined ? right : onPress ? <Icon name="chevronLeft" size={16} color={theme.mu} /> : null}
    </TouchableOpacity>
  );

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.profileHero}>
          <View style={styles.profileRow}>
            <LinearGradient colors={[theme.goldLight, theme.gold]} style={styles.profileAvatar}>
              <Text style={styles.profileAvatarText}>{user.av}</Text>
            </LinearGradient>
            <View style={{flex: 1}}>
              <Text style={styles.profileName}>{user.name}</Text>
              <Text style={[styles.profileRole, {color: theme.gold}]}>{user.role}</Text>
              <Text style={styles.profileUn}>@{user.un}</Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>نشط</Text>
            </View>
          </View>
        </LinearGradient>

        <Sec title="الأمان">
          <Row icon="fingerprint" iconColor={theme.gold} label="الدخول بالبصمة" sub={bioOn ? 'مفعّل' : 'معطّل'} right={<Toggle value={bioOn} onValueChange={v => { setBio(v); toast(v ? 'تم تفعيل البصمة' : 'تم إيقاف البصمة', 'success'); }} theme={theme} />} />
          <Row icon="lock" iconColor={theme.primary} label="تغيير كلمة المرور" sub="آخر تغيير 30 يوم" onPress={() => setPwSh(true)} />
          <Row icon="security" iconColor={theme.info} label="المصادقة الثنائية" sub="مفعّلة دائماً عبر SMS" right={<Toggle value={true} onValueChange={() => toast('لا يمكن تعطيل OTP', 'error')} theme={theme} disabled />} last />
        </Sec>

        <Sec title="التفضيلات">
          <Row icon="bell" iconColor={theme.warn} label="الإشعارات" sub={notif ? 'فعّالة' : 'صامتة'} right={<Toggle value={notif} onValueChange={v => { setNotif(v); toast(v ? 'إشعارات مفعّلة' : 'صامتة', 'success'); }} theme={theme} />} />
          <Row icon={dark ? 'sun' : 'moon'} iconColor="#9C27B0" label="الوضع الداكن" sub={dark ? 'مفعّل' : 'فاتح'} right={<Toggle value={dark} onValueChange={v => { setDark(v); toast(v ? 'الوضع الداكن مفعّل 🌙' : 'الوضع الفاتح مفعّل ☀️', 'success'); }} theme={theme} />} />
          <Row icon="phone" iconColor={theme.info} label="الأصوات" sub={sound ? 'مفعّل' : 'صامت'} right={<Toggle value={sound} onValueChange={setSound} theme={theme} />} />
          <Row icon="security" iconColor={theme.warn} label="القفل التلقائي" sub={autoLk ? 'بعد 5 دقائق' : 'معطّل'} right={<Toggle value={autoLk} onValueChange={setAuto} theme={theme} />} last />
        </Sec>

        <Sec title="المزامنة">
          <Row
            icon={isOffline ? 'warning' : 'backup'}
            iconColor={isOffline ? theme.err : theme.ok}
            label={isOffline ? 'غير متصل بالخادم' : 'متصل بالخادم'}
            sub={pendingCount > 0 ? `${pendingCount} عملية بانتظار المزامنة` : 'جميع البيانات مُزامنة'}
            onPress={syncNow}
            right={syncing ? <Text style={{fontSize: 12, color: theme.mu}}>جارٍ المزامنة…</Text> : <Icon name="chevronLeft" size={16} color={theme.mu} />}
            last
          />
        </Sec>

        <Sec title="البيانات">
          <Row icon="backup" iconColor={theme.ok} label="نسخ احتياطي" sub="يومياً 2:00 ص" onPress={() => toast('جارٍ إنشاء نسخة احتياطية…', 'info')} />
          <Row icon="download" iconColor={theme.info} label="تصدير التقارير" sub="PDF أو Excel" onPress={() => toast('جارٍ تجهيز ملف التصدير…', 'info')} />
          <Row icon="print" iconColor={theme.sub} label="طباعة كشف" sub="الاشتراكات والمساعدات" onPress={() => toast('جارٍ تجهيز ملف الطباعة…', 'info')} />
          <Row icon="delete" iconColor={theme.err} label="إعادة تعيين البيانات" sub="حذف كل شيء والبدء من جديد" onPress={() => setResetSh(true)} last />
        </Sec>

        <Sec title="الدعم">
          <Row icon="help" iconColor={theme.gold} label="الدعم الفني" sub="تواصل مع الفريق التقني" onPress={() => toast('جارٍ فتح الدعم الفني…', 'info')} />
          <Row icon="star" iconColor={theme.gold} label="تقييم التطبيق" sub="شاركنا رأيك" onPress={() => toast('شكراً لتقييمك ⭐', 'success')} />
          <Row icon="info" iconColor={theme.mu} label="عن التطبيق" sub="الإصدار 8.0 · 2024" onPress={() => setAbout(true)} last />
        </Sec>

        <View style={[styles.sec, {backgroundColor: theme.card, marginBottom: 8}]}>
          <Row icon="logout" danger label="تسجيل الخروج" sub="ستحتاج إعادة تسجيل الدخول" onPress={() => setLogout(true)} last />
        </View>
        <Text style={{textAlign: 'center', fontSize: 11, color: theme.mu}}>الصندوق الاجتماعي التنموي · v8.0.0</Text>
      </ScrollView>

      <Sheet visible={pwSh} title="تغيير كلمة المرور" onClose={() => { setPwSh(false); setOld(''); setNew(''); setCon(''); }} theme={theme}>
        <View style={styles.infoNote}>
          <Icon name="info" size={18} color={theme.info} />
          <Text style={{fontSize: 12, color: '#0D47A1', flex: 1, textAlign: 'right'}}>كلمة المرور يجب أن تكون 4 أحرف على الأقل.</Text>
        </View>
        <Field label="كلمة المرور الحالية *" value={oldPw} onChangeText={setOld} secureTextEntry icon="lock" theme={theme} />
        <Field label="كلمة المرور الجديدة *" value={newPw} onChangeText={setNew} secureTextEntry icon="lock" theme={theme} />
        <Field label="تأكيد كلمة المرور *" value={conPw} onChangeText={setCon} secureTextEntry icon="lock" theme={theme} />
        {newPw && conPw && newPw !== conPw ? (
          <View style={{flexDirection: 'row-reverse', gap: 6, marginBottom: 10}}>
            <Icon name="warning" size={14} color={theme.err} />
            <Text style={{color: theme.err, fontSize: 12}}>كلمتا المرور غير متطابقتين</Text>
          </View>
        ) : null}
        <Btn onPress={changePw} theme={theme} disabled={pwBusy}>{pwBusy ? 'جارٍ التحقق…' : 'تغيير كلمة المرور'}</Btn>
      </Sheet>

      <Sheet visible={about} title="عن التطبيق" onClose={() => setAbout(false)} theme={theme}>
        <View style={{alignItems: 'center', paddingVertical: 8, marginBottom: 12}}>
          <LinearGradient colors={[theme.goldLight, theme.gold]} style={styles.aboutIcon}>
            <Icon name="shield" size={38} color={theme.primaryDark} />
          </LinearGradient>
          <Text style={{fontWeight: '900', fontSize: 18, color: theme.tx}}>الصندوق الاجتماعي التنموي</Text>
          <Text style={{color: theme.mu, fontSize: 12, marginTop: 4}}>نظام إدارة الأعضاء والمساعدات</Text>
        </View>
        {[['الإصدار', '8.0.0'], ['تاريخ الإصدار', 'ديسمبر 2024'], ['المطوِّر', 'فريق التقنية اليمني'], ['المنصة', 'Android APK'], ['التشفير', 'AES-256']].map(([k, v]) => (
          <View key={k} style={[styles.aboutRow, {borderBottomColor: theme.border}]}>
            <Text style={{color: theme.sub, fontSize: 13}}>{k}</Text>
            <Text style={{fontWeight: '700', color: theme.tx, fontSize: 13}}>{v}</Text>
          </View>
        ))}
      </Sheet>

      <Sheet visible={logoutSh} title="تسجيل الخروج" onClose={() => setLogout(false)} theme={theme} accent={theme.err}>
        <View style={{alignItems: 'center', paddingVertical: 8}}>
          <View style={[styles.warnCircle, {backgroundColor: theme.err + '18'}]}>
            <Icon name="logout" size={30} color={theme.err} />
          </View>
          <Text style={{fontWeight: '800', fontSize: 16, color: theme.tx, marginBottom: 8}}>هل تريد تسجيل الخروج؟</Text>
          <Text style={{fontSize: 13, color: theme.mu, marginBottom: 24, textAlign: 'center'}}>ستتم إنهاء جلسة العمل الحالية.</Text>
          <View style={{flexDirection: 'row-reverse', gap: 10}}>
            <Btn onPress={() => setLogout(false)} variant="ghost" full={false} small theme={theme}>البقاء</Btn>
            <Btn onPress={logout} variant="danger" full={false} small theme={theme}>خروج</Btn>
          </View>
        </View>
      </Sheet>

      <Sheet visible={resetSh} title="إعادة تعيين البيانات" onClose={() => setResetSh(false)} theme={theme} accent={theme.err}>
        <View style={{alignItems: 'center', paddingVertical: 8}}>
          <View style={[styles.warnCircle, {backgroundColor: theme.err + '18'}]}>
            <Icon name="warning" size={30} color={theme.err} />
          </View>
          <Text style={{fontWeight: '800', fontSize: 16, color: theme.tx, marginBottom: 8}}>حذف جميع البيانات نهائياً؟</Text>
          <Text style={{fontSize: 13, color: theme.mu, marginBottom: 24, textAlign: 'center'}}>
            سيتم حذف الأعضاء والاشتراكات والمساعدات والسندات والرسائل والمواعيد المضافة، والعودة للبيانات الافتراضية. هذا الإجراء لا يمكن التراجع عنه.
          </Text>
          <View style={{flexDirection: 'row-reverse', gap: 10}}>
            <Btn onPress={() => setResetSh(false)} variant="ghost" full={false} small theme={theme}>إلغاء</Btn>
            <Btn onPress={doReset} variant="danger" full={false} small theme={theme}>حذف وإعادة التعيين</Btn>
          </View>
        </View>
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  profileHero: {borderRadius: 22, padding: 20, marginBottom: 14},
  profileRow: {flexDirection: 'row-reverse', alignItems: 'center', gap: 14},
  profileAvatar: {width: 66, height: 66, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  profileAvatarText: {fontSize: 27, fontWeight: '900', color: '#003300'},
  profileName: {color: '#fff', fontWeight: '900', fontSize: 18, textAlign: 'right'},
  profileRole: {fontSize: 12, fontWeight: '700', marginTop: 2, textAlign: 'right'},
  profileUn: {color: 'rgba(255,255,255,0.45)', fontSize: 11, marginTop: 2, textAlign: 'right'},
  statusBadge: {backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 5, flexDirection: 'row-reverse', alignItems: 'center', gap: 5},
  statusDot: {width: 7, height: 7, borderRadius: 4, backgroundColor: '#69F0AE'},
  statusText: {color: '#fff', fontSize: 11, fontWeight: '700'},
  sec: {borderRadius: 16, marginBottom: 12, overflow: 'hidden'},
  secTitle: {padding: 14, paddingBottom: 8, fontSize: 11, fontWeight: '800', letterSpacing: 0.8, borderBottomWidth: 1, textAlign: 'right'},
  row: {flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 13},
  rowIcon: {width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center'},
  infoNote: {backgroundColor: '#E3F2FD', borderRadius: 12, padding: 12, marginBottom: 16, flexDirection: 'row-reverse', gap: 10},
  aboutIcon: {width: 74, height: 74, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 14},
  aboutRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1},
  warnCircle: {width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 14},
});
