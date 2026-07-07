// src/screens/LoginScreen.js
import React, {useState, useRef, useEffect} from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, TextInput,
  Animated, Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../icons/Icon';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import * as authApi from '../api/auth';
import {getDeviceId} from '../api/deviceId';
import {ApiError, NetworkError} from '../api/client';

export default function LoginScreen() {
  const {theme} = useTheme();
  const {setUser} = useData();
  const [step, setStep] = useState('splash');
  const [un, setUn] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [bio, setBio] = useState('idle');
  const [otpToken, setOtpToken] = useState(null);
  const [pendingUserName, setPendingUserName] = useState('');
  const [phoneHint, setPhoneHint] = useState(null);
  const [cd, setCd] = useState(60);
  const refs = useRef([]);
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {toValue: 1.08, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
        Animated.timing(pulse, {toValue: 1, duration: 1400, easing: Easing.inOut(Easing.ease), useNativeDriver: true}),
      ]),
    ).start();
  }, []);

  useEffect(() => {
    if (step === 'otp') {
      const t = setInterval(() => setCd(c => (c <= 1 ? (clearInterval(t), 0) : c - 1)), 1000);
      return () => clearInterval(t);
    }
  }, [step]);

  const friendlyError = e => {
    if (e instanceof NetworkError) return 'لا يوجد اتصال بالخادم. تحقق من الشبكة أو عنوان الخادم.';
    if (e instanceof ApiError) return e.message;
    return 'حدث خطأ غير متوقع';
  };

  const roleLabel = key => ({
    admin: 'مدير النظام', accountant: 'محاسب', reviewer: 'مراجع', viewer: 'مراقب',
  }[key] || key);

  const finishLogin = async () => {
    try {
      const me = await authApi.getMe();
      setUser({
        id: me.id, un: me.username, name: me.full_name,
        role: roleLabel(me.role), roleKey: me.role,
        av: me.avatar_initial, phone: me.phone,
      });
    } catch (e) {
      setErr(friendlyError(e));
    }
  };

  const tryLogin = async () => {
    if (!un || !pw) { setErr('يرجى إدخال البيانات'); return; }
    setErr(''); setBusy(true);
    try {
      const res = await authApi.login(un, pw);
      setOtpToken(res.otp_token);
      setPendingUserName(res.user_name);
      setPhoneHint(res.phone_hint || null);
      setOtp(['', '', '', '', '', '']);
      setCd(60);
      setStep('otp');
    } catch (e) {
      setErr(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const tryBio = () => {
    setBio('scanning');
    setTimeout(async () => {
      const hasSession = await authApi.hasStoredSession();
      if (!hasSession) {
        setBio('fail');
        setTimeout(() => { setBio('idle'); setStep('creds'); }, 900);
        return;
      }
      setBio('success');
      setTimeout(finishLogin, 700);
    }, 2000);
  };

  const doOtp = (i, v) => {
    if (!/^\d?$/.test(v)) return;
    const n = [...otp]; n[i] = v; setOtp(n);
    if (v && i < 5) refs.current[i + 1]?.focus();
    if (n.every(d => d !== '')) {
      submitOtp(n.join(''));
    }
  };

  const submitOtp = async code => {
    setBusy(true);
    setErr('');
    try {
      const deviceId = await getDeviceId();
      await authApi.verifyOtp(otpToken, code, deviceId);
      await finishLogin();
    } catch (e) {
      setErr(friendlyError(e));
      setOtp(['', '', '', '', '', '']);
      refs.current[0]?.focus();
    } finally {
      setBusy(false);
    }
  };

  const bioColor = bio === 'success' ? theme.ok : bio === 'fail' ? theme.err : bio === 'scanning' ? theme.gold : theme.mu;

  if (step === 'splash') {
    return (
      <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.full}>
        <View style={styles.splashContent}>
          <View style={styles.splashTop}>
            <Animated.View style={[styles.logoCircle, {backgroundColor: theme.gold, transform: [{scale: pulse}]}]}>
              <Icon name="shield" size={58} color={theme.primaryDark} />
            </Animated.View>
            <Text style={[styles.republic, {color: theme.gold}]}>الجمهورية اليمنية</Text>
            <Text style={styles.appTitle}>الصندوق الاجتماعي{'\n'}التنموي</Text>
            <Text style={styles.appSub}>نظام الإدارة الشامل · الإصدار 8.0</Text>
          </View>
          <View style={styles.splashBottom}>
            <TouchableOpacity onPress={() => { setErr(''); setStep('creds'); }} style={[styles.mainBtn, {backgroundColor: theme.primaryMid}]}>
              <Icon name="lock" size={20} color="#fff" />
              <Text style={styles.mainBtnText}>تسجيل الدخول</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setBio('idle'); setStep('bio'); }} style={styles.ghostBtn}>
              <Icon name="fingerprint" size={20} color="#fff" />
              <Text style={styles.ghostBtnText}>الدخول بالبصمة</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.footer}>v8.0 · AES-256 · نظام آمن</Text>
        </View>
      </LinearGradient>
    );
  }

  if (step === 'creds') {
    return (
      <View style={[styles.full, {backgroundColor: theme.bg}]}>
        <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.credHeader}>
          <TouchableOpacity onPress={() => setStep('splash')} style={styles.backBtn}>
            <Icon name="chevronRight" size={16} color="#fff" />
            <Text style={styles.backBtnText}>رجوع</Text>
          </TouchableOpacity>
          <Text style={[styles.smallLabel, {color: theme.gold}]}>تسجيل الدخول</Text>
          <Text style={styles.credTitle}>مرحباً بك</Text>
        </LinearGradient>
        <View style={styles.credBody}>
          <View style={[styles.card, {backgroundColor: theme.card}]}>
            <Field label="اسم المستخدم" value={un} onChangeText={setUn} placeholder="أدخل اسم المستخدم" icon="person" theme={theme} />
            <Field
              label="كلمة المرور" value={pw} onChangeText={setPw} placeholder="••••••••" icon="lock" theme={theme}
              secureTextEntry={!showPw}
              rightEl={
                <TouchableOpacity onPress={() => setShowPw(!showPw)}>
                  <Icon name={showPw ? 'eye_off' : 'eye'} size={18} color={theme.mu} />
                </TouchableOpacity>
              }
            />
            {err ? (
              <View style={styles.errBox}>
                <Icon name="warning" size={16} color={theme.err} />
                <Text style={[styles.errText, {color: theme.err}]}>{err}</Text>
              </View>
            ) : null}
            <Btn onPress={tryLogin} theme={theme} disabled={busy}>
              {busy ? 'جارٍ الاتصال بالخادم…' : 'دخول إلى النظام'}
            </Btn>
            <TouchableOpacity onPress={() => { setBio('idle'); setStep('bio'); }} style={styles.linkBtn}>
              <Icon name="fingerprint" size={16} color={theme.primary} />
              <Text style={[styles.linkBtnText, {color: theme.primary}]}>دخول بالبصمة</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (step === 'bio') {
    return (
      <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.full}>
        <TouchableOpacity onPress={() => setStep('splash')} style={styles.bioBack}>
          <Icon name="chevronRight" size={16} color="#fff" />
          <Text style={styles.backBtnText}>رجوع</Text>
        </TouchableOpacity>
        <View style={styles.bioContent}>
          <Text style={styles.bioLabel}>المصادقة البيومترية</Text>
          <Text style={styles.bioTitle}>ضع إصبعك على{'\n'}مستشعر البصمة</Text>
          <View style={[styles.bioCircle, {borderColor: bioColor, backgroundColor: bio === 'success' ? theme.ok + '30' : bio === 'fail' ? theme.err + '30' : theme.gold + '1A'}]}>
            <Icon name={bio === 'success' ? 'verified' : bio === 'fail' ? 'close' : 'fingerprint'} size={90} color={bioColor} />
          </View>
          {bio === 'idle' && (
            <TouchableOpacity onPress={tryBio} style={[styles.scanBtn, {backgroundColor: theme.gold}]}>
              <Icon name="fingerprint" size={22} color={theme.primaryDark} />
              <Text style={[styles.scanBtnText, {color: theme.primaryDark}]}>بدء المسح</Text>
            </TouchableOpacity>
          )}
          {bio === 'scanning' && <Text style={[styles.bioStatus, {color: theme.gold}]}>جارٍ المسح…</Text>}
          {bio === 'success' && <Text style={[styles.bioStatus, {color: theme.gold, fontWeight: '900'}]}>✓ تم التحقق</Text>}
          {bio === 'fail' && <Text style={[styles.bioStatus, {color: theme.err}]}>لا توجد جلسة محفوظة — يرجى تسجيل الدخول</Text>}
        </View>
      </LinearGradient>
    );
  }

  if (step === 'otp') {
    return (
      <View style={[styles.full, {backgroundColor: theme.bg}]}>
        <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.credHeader}>
          <TouchableOpacity onPress={() => setStep('creds')} style={styles.backBtn}>
            <Icon name="chevronRight" size={16} color="#fff" />
            <Text style={styles.backBtnText}>رجوع</Text>
          </TouchableOpacity>
          <Text style={[styles.smallLabel, {color: theme.gold}]}>التحقق الثنائي · OTP</Text>
          <Text style={styles.credTitle}>أدخل رمز التحقق</Text>
        </LinearGradient>
        <View style={styles.credBody}>
          <View style={[styles.card, {backgroundColor: theme.card, alignItems: 'center'}]}>
            <View style={[styles.otpIconWrap, {backgroundColor: theme.primary + '1A'}]}>
              <Icon name="security" size={30} color={theme.primary} />
            </View>
            <Text style={[styles.otpWelcome, {color: theme.tx}]}>مرحباً، {pendingUserName}</Text>
            <Text style={[styles.otpSub, {color: theme.mu}]}>
              {phoneHint ? `أُرسل رمز التحقق إلى الهاتف ${phoneHint}` : 'أُرسل رمز التحقق إلى هاتفك المسجّل'}
            </Text>
            {err ? (
              <View style={styles.errBox}>
                <Icon name="warning" size={16} color={theme.err} />
                <Text style={[styles.errText, {color: theme.err}]}>{err}</Text>
              </View>
            ) : null}
            <View style={styles.otpRow}>
              {otp.map((d, i) => (
                <TextInput
                  key={i}
                  ref={el => (refs.current[i] = el)}
                  value={d}
                  maxLength={1}
                  editable={!busy}
                  keyboardType="number-pad"
                  onChangeText={v => doOtp(i, v)}
                  textAlign="center"
                  style={[
                    styles.otpBox,
                    {
                      borderColor: d ? theme.primary : theme.border,
                      color: theme.primary,
                      backgroundColor: d ? theme.primary + '0F' : theme.surf,
                    },
                  ]}
                />
              ))}
            </View>
            <Text style={{color: theme.mu, fontSize: 13}}>
              {busy ? 'جارٍ التحقق…' : cd > 0 ? (
                <>إعادة الإرسال بعد <Text style={{color: theme.primary, fontWeight: '700'}}>{cd}</Text> ث</>
              ) : (
                <Text onPress={tryLogin} style={{color: theme.primary, fontWeight: '700'}}>
                  إعادة إرسال الرمز
                </Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  full: {flex: 1},
  splashContent: {flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 28, paddingTop: 64, paddingBottom: 52},
  splashTop: {alignItems: 'center'},
  logoCircle: {width: 112, height: 112, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 22},
  republic: {fontSize: 11, letterSpacing: 3, fontWeight: '800', marginBottom: 10},
  appTitle: {color: '#fff', fontSize: 26, fontWeight: '900', textAlign: 'center', lineHeight: 34, marginBottom: 10},
  appSub: {color: 'rgba(255,255,255,0.5)', fontSize: 13},
  splashBottom: {width: '100%', maxWidth: 360, gap: 12},
  mainBtn: {flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 16},
  mainBtnText: {color: '#fff', fontWeight: '800', fontSize: 16},
  ghostBtn: {flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 10, borderRadius: 16, paddingVertical: 15, backgroundColor: 'rgba(255,255,255,0.13)', borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.28)'},
  ghostBtnText: {color: '#fff', fontWeight: '700', fontSize: 15},
  footer: {color: 'rgba(255,255,255,0.3)', fontSize: 11},
  credHeader: {paddingHorizontal: 24, paddingTop: 52, paddingBottom: 30},
  backBtn: {flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, alignSelf: 'flex-start', marginBottom: 20},
  backBtnText: {color: '#fff', fontSize: 13, fontWeight: '600'},
  smallLabel: {fontSize: 11, letterSpacing: 2, fontWeight: '800', marginBottom: 4},
  credTitle: {color: '#fff', fontSize: 24, fontWeight: '900'},
  credBody: {padding: 20, gap: 14},
  card: {borderRadius: 20, padding: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4},
  errBox: {flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: '#FFEBEE', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 12},
  errText: {fontSize: 13, flex: 1},
  linkBtn: {flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 14},
  linkBtnText: {fontSize: 13, fontWeight: '700'},
  bioBack: {position: 'absolute', top: 52, right: 24, flexDirection: 'row-reverse', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 8, zIndex: 5},
  bioContent: {flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32},
  bioLabel: {color: 'rgba(255,255,255,0.55)', fontSize: 14, marginBottom: 8},
  bioTitle: {color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center', lineHeight: 32, marginBottom: 52},
  bioCircle: {width: 180, height: 180, borderRadius: 90, borderWidth: 3, alignItems: 'center', justifyContent: 'center', marginBottom: 52},
  scanBtn: {flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderRadius: 16, paddingVertical: 15, paddingHorizontal: 36},
  scanBtnText: {fontWeight: '800', fontSize: 16},
  bioStatus: {fontSize: 15, fontWeight: '700', textAlign: 'center', paddingHorizontal: 20},
  otpIconWrap: {width: 64, height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 12},
  otpWelcome: {fontWeight: '800', fontSize: 16, marginBottom: 4},
  otpSub: {fontSize: 13, marginBottom: 6, textAlign: 'center'},
  otpRow: {flexDirection: 'row', gap: 8, marginBottom: 20, marginTop: 10},
  otpBox: {width: 46, height: 56, borderRadius: 12, borderWidth: 2, fontSize: 24, fontWeight: '900'},
});
