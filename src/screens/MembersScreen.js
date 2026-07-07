// src/screens/MembersScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../icons/Icon';
import Badge from '../components/Badge';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import newId from '../api/newId';

export default function MembersScreen() {
  const {theme} = useTheme();
  const {members, setMembers, subs, aids, toast} = useData();
  const [q, setQ] = useState('');
  const [flt, setFlt] = useState('الكل');
  const [addOpen, setAddOpen] = useState(false);
  const [sel, setSel] = useState(null);
  const [editM, setEditM] = useState(null);
  const [delC, setDelC] = useState(null);

  const blank = {name: '', nid: '', phone: '', join: '', sub: '500', city: ''};
  const [form, setForm] = useState(blank);

  const filtered = members.filter(
    m => (flt === 'الكل' || m.status === flt) &&
      (m.name.includes(q) || m.nid.includes(q) || m.phone.includes(q) || (m.city || '').includes(q)),
  );

  const save = () => {
    if (!form.name || !form.nid || !form.phone) { toast('يرجى ملء الحقول المطلوبة', 'error'); return; }
    if (editM) {
      setMembers(members.map(m => (m.id === editM.id ? {...m, ...form, sub: +form.sub} : m)));
      toast('تم تحديث البيانات', 'success');
    } else {
      setMembers([...members, {...form, id: newId(), status: 'نشط', paid: 0, balance: 0, sub: +form.sub}]);
      toast('تمت الإضافة', 'success');
    }
    setAddOpen(false); setEditM(null); setForm(blank);
  };

  const doDelete = () => {
    setMembers(members.filter(m => m.id !== delC.id));
    setDelC(null); setSel(null); toast('تم الحذف', 'success');
  };

  const toggleStatus = m => {
    setMembers(members.map(x => (x.id === m.id ? {...x, status: x.status === 'نشط' ? 'معلق' : 'نشط'} : x)));
    setSel(null); toast('تم تحديث الحالة', 'success');
  };

  const mSubs = sel ? subs.filter(s => s.mid === sel.id) : [];
  const mAids = sel ? aids.filter(a => a.mid === sel.id) : [];

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, {backgroundColor: theme.card}]}>
            <Icon name="search" size={18} color={theme.mu} />
            <TextInput
              value={q} onChangeText={setQ} placeholder="بحث…" placeholderTextColor={theme.mu}
              style={[styles.searchInput, {color: theme.tx}]} textAlign="right"
            />
            {q ? (
              <TouchableOpacity onPress={() => setQ('')}>
                <Icon name="close" size={16} color={theme.mu} />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            onPress={() => { setEditM(null); setForm(blank); setAddOpen(true); }}
            style={[styles.addBtn, {backgroundColor: theme.primaryMid}]}>
            <Icon name="add" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.filterRow}>
          {['الكل', 'نشط', 'معلق'].map(f => (
            <TouchableOpacity
              key={f} onPress={() => setFlt(f)}
              style={[styles.filterChip, {backgroundColor: flt === f ? theme.primary : theme.card}]}>
              <Text style={{color: flt === f ? '#fff' : theme.sub, fontSize: 12, fontWeight: '700'}}>
                {f} ({f === 'الكل' ? members.length : members.filter(m => m.status === f).length})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.countText, {color: theme.mu}]}>{filtered.length} عضو</Text>

        {filtered.map(m => (
          <TouchableOpacity
            key={m.id} onPress={() => setSel(m)}
            style={[styles.memberCard, {backgroundColor: theme.card, borderRightColor: m.status === 'نشط' ? theme.primary : theme.warn}]}>
            <View style={styles.memberHeader}>
              <View style={styles.rowGap}>
                <LinearGradient colors={[theme.primaryLight, theme.primary]} style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name[0]}</Text>
                </LinearGradient>
                <View>
                  <Text style={[styles.memberName, {color: theme.tx}]}>{m.name}</Text>
                  <Text style={[styles.memberSub, {color: theme.mu}]}>{m.nid} · {m.city}</Text>
                </View>
              </View>
              <Badge status={m.status} />
            </View>
            <View style={styles.statsRow}>
              {[
                {l: 'شهري', v: `${m.sub} ﷼`, alert: false},
                {l: 'مدفوع', v: `${m.paid.toLocaleString()} ﷼`, alert: false},
                {l: 'متأخر', v: `${m.balance} ﷼`, alert: m.balance > 0},
              ].map(x => (
                <View key={x.l} style={[styles.statBox, {backgroundColor: x.alert ? '#FFEBEE' : theme.bg}]}>
                  <Text style={{fontSize: 13, fontWeight: '800', color: x.alert ? theme.err : theme.primary}}>{x.v}</Text>
                  <Text style={{fontSize: 10, color: theme.mu}}>{x.l}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Sheet visible={addOpen || !!editM} title={editM ? 'تعديل عضو' : 'إضافة عضو جديد'} onClose={() => { setAddOpen(false); setEditM(null); setForm(blank); }} theme={theme}>
        <Field label="الاسم الرباعي *" value={form.name} onChangeText={v => setForm({...form, name: v})} placeholder="أحمد محمد الصالح" icon="person" theme={theme} />
        <Field label="رقم الهوية *" value={form.nid} onChangeText={v => setForm({...form, nid: v})} placeholder="1234567890" icon="security" theme={theme} keyboardType="number-pad" />
        <Field label="رقم الجوال *" value={form.phone} onChangeText={v => setForm({...form, phone: v})} placeholder="07XXXXXXXX" icon="phone" theme={theme} keyboardType="phone-pad" />
        <Field label="المدينة" value={form.city} onChangeText={v => setForm({...form, city: v})} placeholder="صنعاء" theme={theme} />
        <Field label="تاريخ الانضمام" value={form.join} onChangeText={v => setForm({...form, join: v})} placeholder="2024-01-01" theme={theme} />
        <Field label="الاشتراك الشهري (﷼)" value={form.sub} onChangeText={v => setForm({...form, sub: v})} keyboardType="numeric" icon="money" theme={theme} />
        <Btn onPress={save} theme={theme}>
          <Icon name="check" size={17} color="#fff" />
          <Text style={{color: '#fff', fontWeight: '700', fontSize: 15}}>{editM ? 'حفظ التعديلات' : 'إضافة العضو'}</Text>
        </Btn>
      </Sheet>

      <Sheet visible={!!sel} title="ملف العضو" onClose={() => setSel(null)} theme={theme}>
        {sel && (
          <>
            <LinearGradient colors={[theme.primaryDark, theme.primaryMid]} style={styles.detailHeader}>
              <View style={styles.rowGap}>
                <LinearGradient colors={[theme.goldLight, theme.gold]} style={styles.detailAvatar}>
                  <Text style={styles.detailAvatarText}>{sel.name[0]}</Text>
                </LinearGradient>
                <View>
                  <Text style={styles.detailName}>{sel.name}</Text>
                  <Text style={styles.detailSub}>{sel.city} · {sel.join}</Text>
                  <View style={{marginTop: 6}}><Badge status={sel.status} /></View>
                </View>
              </View>
              <View style={styles.detailActions}>
                <TouchableOpacity
                  onPress={() => { setForm({name: sel.name, nid: sel.nid, phone: sel.phone, join: sel.join || '', sub: String(sel.sub), city: sel.city || ''}); setEditM(sel); setSel(null); }}
                  style={styles.actionBtn}>
                  <Icon name="edit" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>تعديل</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleStatus(sel)} style={styles.actionBtn}>
                  <Icon name="swap" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>{sel.status === 'نشط' ? 'تعليق' : 'تفعيل'}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setSel(null); setDelC(sel); }} style={[styles.actionBtn, {backgroundColor: 'rgba(220,0,0,0.3)'}]}>
                  <Icon name="delete" size={14} color="#fff" />
                  <Text style={styles.actionBtnText}>حذف</Text>
                </TouchableOpacity>
              </View>
            </LinearGradient>

            <View style={[styles.infoBox, {backgroundColor: theme.bg}]}>
              {[['رقم الهوية', sel.nid], ['الجوال', sel.phone], ['الاشتراك', `${sel.sub} ﷼`], ['المدفوع', `${sel.paid.toLocaleString()} ﷼`], ['المتأخرات', `${sel.balance} ﷼`]].map(([k, v], i, arr) => (
                <View key={k} style={[styles.infoRow, {borderBottomColor: theme.border, borderBottomWidth: i < arr.length - 1 ? 1 : 0}]}>
                  <Text style={{color: theme.sub, fontSize: 13}}>{k}</Text>
                  <Text style={{fontWeight: '700', color: theme.tx, fontSize: 13}}>{v}</Text>
                </View>
              ))}
            </View>

            {mSubs.length > 0 && (
              <>
                <View style={[styles.rowGap, {marginBottom: 8}]}>
                  <Icon name="history" size={15} color={theme.gold} />
                  <Text style={{fontWeight: '800', fontSize: 13, color: theme.tx}}>سجل الاشتراكات ({mSubs.length})</Text>
                </View>
                {mSubs.map(s => (
                  <View key={s.id} style={[styles.histRow, {backgroundColor: theme.bg}]}>
                    <View>
                      <Text style={{fontSize: 12, fontWeight: '700', color: theme.tx}}>{s.date}</Text>
                      <Text style={{fontSize: 11, color: theme.mu}}>{s.method} · {s.ref}</Text>
                    </View>
                    <Text style={{fontWeight: '800', color: theme.ok, fontSize: 14}}>+{s.amt.toLocaleString()} ﷼</Text>
                  </View>
                ))}
              </>
            )}

            {mAids.length > 0 && (
              <>
                <View style={[styles.rowGap, {marginTop: 12, marginBottom: 8}]}>
                  <Icon name="aid" size={15} color={theme.info} />
                  <Text style={{fontWeight: '800', fontSize: 13, color: theme.tx}}>سجل المساعدات ({mAids.length})</Text>
                </View>
                {mAids.map(a => (
                  <View key={a.id} style={[styles.histRow, {backgroundColor: theme.bg}]}>
                    <View>
                      <Text style={{fontSize: 12, fontWeight: '700', color: theme.tx}}>{a.type}</Text>
                      <Text style={{fontSize: 11, color: theme.mu}}>{a.date}</Text>
                    </View>
                    <View style={{alignItems: 'flex-end'}}>
                      <Text style={{fontWeight: '800', color: theme.primary, fontSize: 13}}>{a.amt.toLocaleString()} ﷼</Text>
                      <Badge status={a.status} />
                    </View>
                  </View>
                ))}
              </>
            )}
          </>
        )}
      </Sheet>

      <Sheet visible={!!delC} title="تأكيد الحذف" onClose={() => setDelC(null)} theme={theme} accent={theme.err}>
        {delC && (
          <View style={{alignItems: 'center', paddingVertical: 8}}>
            <View style={[styles.warnCircle, {backgroundColor: theme.err + '1A'}]}>
              <Icon name="delete" size={28} color={theme.err} />
            </View>
            <Text style={{fontWeight: '800', fontSize: 16, color: theme.tx, marginBottom: 8}}>حذف: {delC.name}</Text>
            <Text style={{fontSize: 13, color: theme.mu, marginBottom: 24, textAlign: 'center'}}>سيتم حذف جميع البيانات نهائياً.</Text>
            <View style={{flexDirection: 'row-reverse', gap: 10}}>
              <Btn onPress={() => setDelC(null)} variant="ghost" full={false} small theme={theme}>إلغاء</Btn>
              <Btn onPress={doDelete} variant="danger" full={false} small theme={theme}>حذف نهائياً</Btn>
            </View>
          </View>
        )}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  searchRow: {flexDirection: 'row-reverse', gap: 10, marginBottom: 10},
  searchBox: {flex: 1, flexDirection: 'row-reverse', alignItems: 'center', borderRadius: 12, paddingHorizontal: 12, gap: 8},
  searchInput: {flex: 1, paddingVertical: 11, fontSize: 14},
  addBtn: {borderRadius: 12, width: 48, alignItems: 'center', justifyContent: 'center'},
  filterRow: {flexDirection: 'row-reverse', gap: 6, marginBottom: 10},
  filterChip: {borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6},
  countText: {fontSize: 12, marginBottom: 10, textAlign: 'right'},
  memberCard: {borderRadius: 16, padding: 14, marginBottom: 10, borderRightWidth: 3, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2},
  memberHeader: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10},
  rowGap: {flexDirection: 'row-reverse', alignItems: 'center', gap: 10},
  avatar: {width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center'},
  avatarText: {color: '#fff', fontSize: 20, fontWeight: '900'},
  memberName: {fontWeight: '800', fontSize: 14, textAlign: 'right'},
  memberSub: {fontSize: 11, marginTop: 2, textAlign: 'right'},
  statsRow: {flexDirection: 'row', gap: 6},
  statBox: {flex: 1, borderRadius: 8, paddingVertical: 7, paddingHorizontal: 10, alignItems: 'center'},
  detailHeader: {borderRadius: 16, padding: 16, marginBottom: 16},
  detailAvatar: {width: 60, height: 60, borderRadius: 18, alignItems: 'center', justifyContent: 'center'},
  detailAvatarText: {color: '#003300', fontSize: 24, fontWeight: '900'},
  detailName: {color: '#fff', fontWeight: '900', fontSize: 17, textAlign: 'right'},
  detailSub: {color: 'rgba(255,255,255,0.6)', fontSize: 12, marginTop: 2, textAlign: 'right'},
  detailActions: {flexDirection: 'row-reverse', gap: 8, marginTop: 14},
  actionBtn: {backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7, flexDirection: 'row-reverse', alignItems: 'center', gap: 6},
  actionBtnText: {color: '#fff', fontSize: 12, fontWeight: '700'},
  infoBox: {borderRadius: 12, paddingHorizontal: 12, marginBottom: 14},
  infoRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 11},
  histRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', borderRadius: 10, padding: 12, marginBottom: 6},
  warnCircle: {width: 60, height: 60, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 14},
});
