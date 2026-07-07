// src/screens/VouchersScreen.js
import React, {useState} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable} from 'react-native';
import Icon from '../icons/Icon';
import Badge from '../components/Badge';
import Sheet from '../components/Sheet';
import Field from '../components/Field';
import Btn from '../components/Btn';
import {useTheme} from '../context/ThemeContext';
import {useData} from '../context/DataContext';
import {PAY_METHODS} from '../data';
import newId from '../api/newId';

function VoucherPrint({v, kind, theme, onClose}) {
  const isReceipt = kind === 'قبض';
  const accent = isReceipt ? theme.ok : theme.err;
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.printOverlay} onPress={onClose}>
        <Pressable style={styles.printCard} onPress={() => {}}>
          <TouchableOpacity onPress={onClose} style={styles.printClose}>
            <Icon name="close" size={16} color="#666" />
          </TouchableOpacity>
          <ScrollView contentContainerStyle={styles.printBody}>
            <View style={[styles.printHeader, {borderBottomColor: accent}]}>
              <View style={[styles.printLogo, {backgroundColor: accent + '18'}]}>
                <Icon name="shield" size={26} color={accent} />
              </View>
              <Text style={styles.printOrgName}>الصندوق الاجتماعي التنموي</Text>
              <Text style={styles.printOrgSub}>الجمهورية اليمنية</Text>
            </View>

            <View style={{alignItems: 'center', marginBottom: 18}}>
              <View style={[styles.printBadge, {backgroundColor: accent}]}>
                <Text style={styles.printBadgeText}>سند {kind}</Text>
              </View>
              <Text style={styles.printNo}>{v.no}</Text>
            </View>

            <View style={[styles.printAmountBox, {borderColor: accent, backgroundColor: accent + '0E'}]}>
              <Text style={styles.printAmountLabel}>{isReceipt ? 'المبلغ المستلم' : 'المبلغ المصروف'}</Text>
              <Text style={[styles.printAmountValue, {color: accent}]}>{v.amt.toLocaleString()} <Text style={{fontSize: 15}}>﷼ يمني</Text></Text>
            </View>

            <View style={styles.printDetails}>
              {[
                [isReceipt ? 'استلمنا من السيد/ة' : 'صرفنا إلى السيد/ة', v.mn],
                ['وذلك مقابل', v.desc],
                ['طريقة الدفع', v.method],
                ['التاريخ', v.date],
                [isReceipt ? 'استلم بواسطة' : 'صرف بواسطة', isReceipt ? v.recv : v.paidBy],
              ].map(([k, val]) => (
                <View key={k} style={styles.printRow}>
                  <Text style={styles.printRowKey}>{k}</Text>
                  <Text style={styles.printRowVal}>{val}</Text>
                </View>
              ))}
            </View>

            <View style={styles.printSignRow}>
              <View style={styles.printSignBox}>
                <View style={styles.printSignLine} />
                <Text style={styles.printSignLabel}>توقيع {isReceipt ? 'المستلم' : 'المستفيد'}</Text>
              </View>
              <View style={styles.printSignBox}>
                <View style={styles.printSignLine} />
                <Text style={styles.printSignLabel}>ختم واعتماد الصندوق</Text>
              </View>
            </View>
            <Text style={styles.printFooter}>سند آلي معتمد · {v.status}</Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function VouchersScreen() {
  const {theme} = useTheme();
  const {members, receipts, setReceipts, payments, setPayments, toast, user} = useData();
  const [tab, setTab] = useState('receipts');
  const [addOpen, setAddOpen] = useState(false);
  const [printV, setPrintV] = useState(null);
  const blank = {mid: '', amt: '', date: new Date().toISOString().split('T')[0], method: 'نقداً', desc: ''};
  const [form, setForm] = useState(blank);

  const list = tab === 'receipts' ? receipts : payments;
  const accent = tab === 'receipts' ? theme.ok : theme.err;
  const totalR = receipts.reduce((s, r) => s + r.amt, 0);
  const totalP = payments.reduce((s, p) => s + p.amt, 0);

  const save = () => {
    const m = members.find(x => x.id === +form.mid);
    if (!m || !form.amt || !form.desc) { toast('يرجى ملء جميع الحقول المطلوبة', 'error'); return; }
    if (tab === 'receipts') {
      const no = 'REC-2024-' + String(receipts.length + 1).padStart(3, '0');
      setReceipts([{id: newId(), no, kind: 'قبض', mid: m.id, mn: m.name, amt: +form.amt, date: form.date, method: form.method, desc: form.desc, recv: user.name, status: 'معتمد'}, ...receipts]);
      toast('تم إصدار سند القبض بنجاح', 'success');
    } else {
      const no = 'PAY-2024-' + String(payments.length + 1).padStart(3, '0');
      setPayments([{id: newId(), no, kind: 'صرف', mid: m.id, mn: m.name, amt: +form.amt, date: form.date, method: form.method, desc: form.desc, paidBy: user.name, status: 'معتمد'}, ...payments]);
      toast('تم إصدار سند الصرف بنجاح', 'success');
    }
    setAddOpen(false); setForm(blank);
  };

  return (
    <View style={{flex: 1, backgroundColor: theme.bg}}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.tabRow}>
          <TouchableOpacity
            onPress={() => setTab('receipts')}
            style={[styles.tabCard, {backgroundColor: tab === 'receipts' ? theme.primaryMid : theme.card}]}>
            <Icon name="voucherIn" size={24} color={tab === 'receipts' ? '#fff' : theme.ok} />
            <Text style={[styles.tabCardTitle, {color: tab === 'receipts' ? '#fff' : theme.tx}]}>سندات القبض</Text>
            <Text style={[styles.tabCardSub, {color: tab === 'receipts' ? 'rgba(255,255,255,0.8)' : theme.mu}]}>{receipts.length} سند</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTab('payments')}
            style={[styles.tabCard, {backgroundColor: tab === 'payments' ? theme.err : theme.card}]}>
            <Icon name="voucherOut" size={24} color={tab === 'payments' ? '#fff' : theme.err} />
            <Text style={[styles.tabCardTitle, {color: tab === 'payments' ? '#fff' : theme.tx}]}>سندات الصرف</Text>
            <Text style={[styles.tabCardSub, {color: tab === 'payments' ? 'rgba(255,255,255,0.8)' : theme.mu}]}>{payments.length} سند</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.summaryRow}>
          <View>
            <Text style={{fontSize: 11, color: theme.mu, textAlign: 'right'}}>إجمالي {tab === 'receipts' ? 'المقبوضات' : 'المصروفات'}</Text>
            <Text style={{fontSize: 22, fontWeight: '900', color: accent, textAlign: 'right'}}>{(tab === 'receipts' ? totalR : totalP).toLocaleString()} ﷼</Text>
          </View>
          <TouchableOpacity onPress={() => { setForm(blank); setAddOpen(true); }} style={[styles.newBtn, {backgroundColor: tab === 'receipts' ? theme.primaryMid : theme.err}]}>
            <Icon name="add" size={16} color="#fff" />
            <Text style={styles.newBtnText}>سند {tab === 'receipts' ? 'قبض' : 'صرف'} جديد</Text>
          </TouchableOpacity>
        </View>

        {list.length === 0 && (
          <View style={{alignItems: 'center', paddingVertical: 32}}>
            <Icon name={tab === 'receipts' ? 'voucherIn' : 'voucherOut'} size={40} color={theme.border} />
            <Text style={{color: theme.mu, marginTop: 8}}>لا توجد سندات بعد</Text>
          </View>
        )}

        {list.map(v => (
          <TouchableOpacity key={v.id} onPress={() => setPrintV(v)} style={[styles.voucherCard, {backgroundColor: theme.card, borderRightColor: accent}]}>
            <View style={styles.voucherTop}>
              <View style={{flex: 1}}>
                <View style={styles.voucherTags}>
                  <Text style={[styles.voucherNo, {backgroundColor: accent + '18', color: accent}]}>{v.no}</Text>
                  <Badge status={v.status === 'معتمد' ? 'معتمدة' : v.status} />
                </View>
                <Text style={{fontWeight: '800', fontSize: 14, color: theme.tx, marginTop: 6, textAlign: 'right'}}>{v.mn}</Text>
                <Text style={{fontSize: 12, color: theme.sub, marginTop: 2, textAlign: 'right'}}>{v.desc}</Text>
              </View>
              <View style={[styles.stampWrap, {backgroundColor: accent + '15'}]}>
                <Icon name="stamp" size={18} color={accent} />
              </View>
            </View>
            <View style={styles.voucherBottom}>
              <Text style={{fontSize: 11, color: theme.mu}}>{v.date} · {v.method}</Text>
              <Text style={{fontWeight: '900', color: accent, fontSize: 18}}>{tab === 'receipts' ? '+' : '-'}{v.amt.toLocaleString()} ﷼</Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <Sheet visible={addOpen} title={`إصدار سند ${tab === 'receipts' ? 'قبض' : 'صرف'}`} onClose={() => { setAddOpen(false); setForm(blank); }} theme={theme} accent={accent}>
        <Field label={tab === 'receipts' ? 'العضو الدافع *' : 'العضو المستفيد *'} value={form.mid} onSelect={v => setForm({...form, mid: v})} opts={[{v: '', l: 'اختر العضو…'}, ...members.map(m => ({v: m.id, l: m.name}))]} icon="person" theme={theme} />
        <Field label="المبلغ (﷼) *" value={form.amt} onChangeText={v => setForm({...form, amt: v})} keyboardType="numeric" icon="money" theme={theme} />
        <Field label="التاريخ" value={form.date} onChangeText={v => setForm({...form, date: v})} theme={theme} />
        <Field label="طريقة الدفع" value={form.method} onSelect={v => setForm({...form, method: v})} opts={PAY_METHODS.map(m => ({v: m, l: m}))} theme={theme} />
        <Field label={tab === 'receipts' ? 'وذلك مقابل *' : 'بيان الصرف *'} value={form.desc} onChangeText={v => setForm({...form, desc: v})} multiline numberOfLines={2} theme={theme} />
        <Btn onPress={save} variant={tab === 'receipts' ? 'primary' : 'danger'} theme={theme}>إصدار واعتماد السند</Btn>
      </Sheet>

      {printV && <VoucherPrint v={printV} kind={tab === 'receipts' ? 'قبض' : 'صرف'} theme={theme} onClose={() => setPrintV(null)} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {padding: 16, paddingBottom: 24},
  tabRow: {flexDirection: 'row-reverse', gap: 8, marginBottom: 14},
  tabCard: {flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center'},
  tabCardTitle: {fontWeight: '800', fontSize: 13, marginTop: 6},
  tabCardSub: {fontSize: 11, marginTop: 2},
  summaryRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14},
  newBtn: {borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, flexDirection: 'row-reverse', alignItems: 'center', gap: 6},
  newBtnText: {color: '#fff', fontWeight: '700', fontSize: 13},
  voucherCard: {borderRadius: 16, padding: 16, marginBottom: 10, borderRightWidth: 3},
  voucherTop: {flexDirection: 'row-reverse', alignItems: 'flex-start'},
  voucherTags: {flexDirection: 'row-reverse', alignItems: 'center', gap: 8},
  voucherNo: {fontSize: 10, fontWeight: '800', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6},
  stampWrap: {borderRadius: 10, padding: 8},
  voucherBottom: {flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 8},
  printOverlay: {flex: 1, backgroundColor: 'rgba(0,12,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 16},
  printCard: {backgroundColor: '#fff', borderRadius: 18, width: '100%', maxWidth: 380, maxHeight: '90%'},
  printClose: {position: 'absolute', top: 12, left: 12, backgroundColor: '#F0F0F0', borderRadius: 10, padding: 6, zIndex: 2},
  printBody: {padding: 22},
  printHeader: {alignItems: 'center', marginBottom: 16, borderBottomWidth: 2, paddingBottom: 14},
  printLogo: {width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 8},
  printOrgName: {fontWeight: '900', fontSize: 14, color: '#0D1B0F'},
  printOrgSub: {fontSize: 11, color: '#888'},
  printBadge: {borderRadius: 24, paddingHorizontal: 22, paddingVertical: 6},
  printBadgeText: {color: '#fff', fontWeight: '900', fontSize: 15, letterSpacing: 1},
  printNo: {fontSize: 12, color: '#888', marginTop: 8, fontWeight: '700'},
  printAmountBox: {borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 18},
  printAmountLabel: {fontSize: 11, color: '#666', marginBottom: 4},
  printAmountValue: {fontSize: 30, fontWeight: '900'},
  printDetails: {borderTopWidth: 1, borderTopColor: '#EEE'},
  printRow: {flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#EEE'},
  printRowKey: {fontSize: 12, color: '#777'},
  printRowVal: {fontSize: 13, fontWeight: '700', color: '#222', maxWidth: '60%', textAlign: 'left'},
  printSignRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 28, paddingTop: 14},
  printSignBox: {alignItems: 'center', flex: 1},
  printSignLine: {borderTopWidth: 1.5, borderTopColor: '#999', width: '80%', marginBottom: 6},
  printSignLabel: {fontSize: 11, color: '#777'},
  printFooter: {textAlign: 'center', marginTop: 18, fontSize: 10, color: '#AAA'},
});
