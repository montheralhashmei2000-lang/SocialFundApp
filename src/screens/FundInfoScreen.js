// src/screens/FundInfoScreen.js
import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../icons/Icon';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';

let launchImageLibrary = null;
try {
  // Optional dependency — screen still works (logo picker disabled) if not installed yet.
  launchImageLibrary = require('react-native-image-picker').launchImageLibrary;
} catch (e) {
  launchImageLibrary = null;
}

export default function FundInfoScreen() {
  const {theme} = useTheme();
  const {fundInfo, setFundInfo, toast} = useData();
  const [form, setForm] = useState(fundInfo);
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setForm(fundInfo); setDirty(false); }, [fundInfo]);

  const update = (k, v) => { setForm(f => ({...f, [k]: v})); setDirty(true); };

  const pickLogo = () => {
    if (!launchImageLibrary) {
      toast('يرجى تثبيت مكتبة react-native-image-picker أولاً', 'error');
      return;
    }
    launchImageLibrary(
      {mediaType: 'photo', quality: 0.7, includeBase64: true, maxWidth: 512, maxHeight: 512},
      response => {
        if (response.didCancel || response.errorCode) return;
        const asset = response.assets && response.assets[0];
        if (asset && asset.base64) {
          const uri = `data:${asset.type || 'image/png'};base64,${asset.base64}`;
          update('logo', uri);
        }
      },
    );
  };

  const removeLogo = () => {
    Alert.alert('إزالة الشعار', 'هل تريد إزالة شعار الصندوق والعودة للشعار الافتراضي؟', [
      {text: 'إلغاء', style: 'cancel'},
      {text: 'إزالة', style: 'destructive', onPress: () => update('logo', null)},
    ]);
  };

  const save = () => {
    if (!form.name.trim()) { toast('يرجى إدخال اسم الصندوق', 'error'); return; }
    setFundInfo(form);
    setDirty(false);
    toast('تم حفظ بيانات الصندوق بنجاح', 'success');
  };

  return (
    <ScrollView style={{flex: 1, backgroundColor: theme.bg}} contentContainerStyle={styles.container}>
      <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.previewHero}>
        <TouchableOpacity onPress={pickLogo} style={styles.logoWrap}>
          {form.logo ? (
            <Image source={{uri: form.logo}} style={styles.logoImg} />
          ) : (
            <LinearGradient colors={[theme.goldLight, theme.gold]} style={styles.logoPlaceholder}>
              <Icon name="shield" size={40} color={theme.primaryDark} />
            </LinearGradient>
          )}
          <View style={[styles.editBadge, {backgroundColor: theme.gold}]}>
            <Icon name="edit" size={13} color={theme.primaryDark} />
          </View>
        </TouchableOpacity>
        <Text style={styles.previewName}>{form.name || 'اسم الصندوق'}</Text>
        {form.address ? <Text style={styles.previewSub}>{form.address}</Text> : null}
        <View style={styles.logoActions}>
          <TouchableOpacity onPress={pickLogo} style={styles.logoActionBtn}>
            <Icon name="edit" size={14} color="#fff" />
            <Text style={styles.logoActionText}>تغيير الشعار</Text>
          </TouchableOpacity>
          {form.logo ? (
            <TouchableOpacity onPress={removeLogo} style={[styles.logoActionBtn, {backgroundColor: 'rgba(220,0,0,0.35)'}]}>
              <Icon name="delete" size={14} color="#fff" />
              <Text style={styles.logoActionText}>إزالة</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      <View style={[styles.formCard, {backgroundColor: theme.card}]}>
        <Text style={[styles.sectionLabel, {color: theme.mu}]}>البيانات الأساسية</Text>
        <Field label="اسم الصندوق *" value={form.name} onChangeText={v => update('name', v)} placeholder="الصندوق الاجتماعي التنموي" icon="shield" theme={theme} />
        <Field label="رقم السجل / الترخيص" value={form.regNo} onChangeText={v => update('regNo', v)} placeholder="اختياري" icon="security" theme={theme} />
        <Field label="العنوان" value={form.address} onChangeText={v => update('address', v)} placeholder="صنعاء - الجمهورية اليمنية" icon="event" theme={theme} />
      </View>

      <View style={[styles.formCard, {backgroundColor: theme.card}]}>
        <Text style={[styles.sectionLabel, {color: theme.mu}]}>بيانات التواصل</Text>
        <Field label="رقم الهاتف" value={form.phone} onChangeText={v => update('phone', v)} placeholder="777123456" icon="phone" theme={theme} keyboardType="phone-pad" />
        <Field label="البريد الإلكتروني" value={form.email} onChangeText={v => update('email', v)} placeholder="info@example.com" icon="msg" theme={theme} keyboardType="email-address" />
      </View>

      <View style={styles.previewCardWrap}>
        <Text style={[styles.sectionLabel, {color: theme.mu, textAlign: 'right', marginBottom: 10}]}>معاينة السندات والتقارير</Text>
        <View style={styles.voucherPreview}>
          <View style={styles.vpHeader}>
            {form.logo ? (
              <Image source={{uri: form.logo}} style={styles.vpLogo} />
            ) : (
              <View style={[styles.vpLogo, {backgroundColor: theme.primary + '18', alignItems: 'center', justifyContent: 'center'}]}>
                <Icon name="shield" size={22} color={theme.primary} />
              </View>
            )}
            <View style={{flex: 1}}>
              <Text style={styles.vpName}>{form.name || 'اسم الصندوق'}</Text>
              {form.address ? <Text style={styles.vpSub}>{form.address}</Text> : null}
            </View>
          </View>
          <View style={styles.vpFooter}>
            {form.phone ? <Text style={styles.vpContact}>☎ {form.phone}</Text> : null}
            {form.email ? <Text style={styles.vpContact}>✉ {form.email}</Text> : null}
          </View>
        </View>
      </View>

      <Btn onPress={save} theme={theme} disabled={!dirty}>
        <Icon name="check" size={17} color="#fff" />
        <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>{dirty ? 'حفظ التغييرات' : 'تم الحفظ'}</Text>
      </Btn>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 32},
  previewHero: {borderRadius: 22, padding: 22, alignItems: 'center', marginBottom: 14},
  logoWrap: {position: 'relative', marginBottom: 12},
  logoImg: {width: 84, height: 84, borderRadius: 22, backgroundColor: '#fff'},
  logoPlaceholder: {width: 84, height: 84, borderRadius: 22, alignItems: 'center', justifyContent: 'center'},
  editBadge: {position: 'absolute', bottom: -4, left: -4, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff'},
  previewName: {color: '#fff', fontWeight: '900', fontSize: 18, textAlign: 'center'},
  previewSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 4, textAlign: 'center'},
  logoActions: {flexDirection: 'row-reverse', gap: 8, marginTop: 14},
  logoActionBtn: {backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 7, flexDirection: 'row-reverse', alignItems: 'center', gap: 6},
  logoActionText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  formCard: {borderRadius: 16, padding: 16, marginBottom: 14},
  sectionLabel: {fontSize: 11, fontWeight: '800', letterSpacing: 0.6, marginBottom: 10, textAlign: 'right'},
  previewCardWrap: {marginBottom: 18},
  voucherPreview: {backgroundColor: '#fff', borderRadius: 14, padding: 14, borderWidth: 1, borderColor: '#E0E0E0'},
  vpHeader: {flexDirection: 'row-reverse', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#EEE', paddingBottom: 10, marginBottom: 8},
  vpLogo: {width: 40, height: 40, borderRadius: 10},
  vpName: {fontWeight: '900', fontSize: 13, color: '#0D1B0F', textAlign: 'right'},
  vpSub: {fontSize: 10, color: '#888', marginTop: 2, textAlign: 'right'},
  vpFooter: {flexDirection: 'row-reverse', gap: 14},
  vpContact: {fontSize: 10, color: '#666'},
});
