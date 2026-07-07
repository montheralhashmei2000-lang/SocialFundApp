// src/data/index.js

// NOTE: USERS is no longer used for authentication - LoginScreen now calls
// the real backend (/auth/login + /auth/verify-otp). Kept here only in case
// any leftover screen references it as a fallback; safe to delete once
// confirmed unused.
export const USERS = [
  {id:1, un:'admin',       pw:'1234', role:'مدير النظام',  name:'محمد العمري',  av:'م', perm:'all'},
  {id:2, un:'accountant',  pw:'5678', role:'محاسب',         name:'فاطمة الصالح', av:'ف', perm:'acc'},
  {id:3, un:'viewer',      pw:'0000', role:'مراقب',         name:'أحمد القرشي',  av:'أ', perm:'view'},
];

export const MEMBERS = [
  {id:1, name:'أحمد محمد الصالح',    nid:'1234567890', phone:'0777123456', join:'2024-01-15', status:'نشط',  sub:500,  paid:6000,  balance:0,    city:'صنعاء'},
  {id:2, name:'فاطمة علي العمري',    nid:'2345678901', phone:'0733234567', join:'2024-02-01', status:'نشط',  sub:500,  paid:5000,  balance:500,  city:'عدن'},
  {id:3, name:'محمد حسن القرشي',    nid:'3456789012', phone:'0711345678', join:'2023-11-10', status:'نشط',  sub:750,  paid:9000,  balance:0,    city:'تعز'},
  {id:4, name:'نور عبدالله المطري', nid:'4567890123', phone:'0777456789', join:'2024-03-05', status:'معلق', sub:500,  paid:1500,  balance:1000, city:'صنعاء'},
  {id:5, name:'خالد عمر السلامي',   nid:'5678901234', phone:'0733567890', join:'2023-09-20', status:'نشط',  sub:1000, paid:15000, balance:0,    city:'حضرموت'},
  {id:6, name:'سارة يحيى الحكيمي', nid:'6789012345', phone:'0711678901', join:'2024-01-30', status:'نشط',  sub:500,  paid:4500,  balance:500,  city:'إب'},
];

export const AIDS = [
  {id:1, mid:1, mn:'أحمد محمد الصالح',    type:'مساعدة زواج',    amt:10000, date:'2024-11-01', status:'معتمدة',       note:'زواج الابن البكر',    reviewer:'محمد العمري'},
  {id:2, mid:3, mn:'محمد حسن القرشي',    type:'مساعدة وفاة',    amt:5000,  date:'2024-10-15', status:'مصروفة',        note:'وفاة الوالد',          reviewer:'فاطمة الصالح'},
  {id:3, mid:2, mn:'فاطمة علي العمري',   type:'مساعدة مرضية',   amt:3000,  date:'2024-11-20', status:'قيد المراجعة',  note:'علاج خارجي',           reviewer:''},
  {id:4, mid:5, mn:'خالد عمر السلامي',   type:'مساعدة تعليمية', amt:4000,  date:'2024-09-01', status:'مصروفة',        note:'رسوم جامعية',          reviewer:'محمد العمري'},
  {id:5, mid:6, mn:'سارة يحيى الحكيمي', type:'مساعدة ولادة',   amt:2000,  date:'2024-11-25', status:'قيد المراجعة',  note:'ولادة المولود الأول',  reviewer:''},
];

export const SUBSCRIPTIONS = [
  {id:1, mid:1, mn:'أحمد محمد الصالح',    amt:500,  date:'2024-11-01', method:'نقداً',  ref:'RCP-001'},
  {id:2, mid:3, mn:'محمد حسن القرشي',    amt:750,  date:'2024-11-02', method:'تحويل',  ref:'RCP-002'},
  {id:3, mid:5, mn:'خالد عمر السلامي',   amt:1000, date:'2024-11-03', method:'نقداً',  ref:'RCP-003'},
  {id:4, mid:2, mn:'فاطمة علي العمري',   amt:500,  date:'2024-11-05', method:'تحويل',  ref:'RCP-004'},
  {id:5, mid:6, mn:'سارة يحيى الحكيمي', amt:500,  date:'2024-11-07', method:'نقداً',  ref:'RCP-005'},
];

export const TREASURY = [
  {id:1, type:'إيراد', cat:'اشتراكات', desc:'اشتراكات شهر نوفمبر',      amt:3250, date:'2024-11-07', ref:'TR-001'},
  {id:2, type:'إيراد', cat:'تبرعات',   desc:'تبرع من محسن',              amt:5000, date:'2024-11-05', ref:'TR-002'},
  {id:3, type:'مصروف', cat:'مساعدات',  desc:'مساعدة وفاة القرشي',        amt:5000, date:'2024-10-20', ref:'TR-003'},
  {id:4, type:'مصروف', cat:'إدارة',    desc:'رواتب موظفين',              amt:2000, date:'2024-10-31', ref:'TR-004'},
  {id:5, type:'إيراد', cat:'اشتراكات', desc:'اشتراكات شهر أكتوبر',      amt:3000, date:'2024-10-07', ref:'TR-005'},
  {id:6, type:'مصروف', cat:'مساعدات',  desc:'مساعدة تعليمية السلامي',   amt:4000, date:'2024-09-05', ref:'TR-006'},
];

export const RECEIPTS = [
  {id:1, no:'REC-2024-001', kind:'قبض', mid:1, mn:'أحمد محمد الصالح',    amt:500,  date:'2024-11-01', method:'نقداً',  desc:'اشتراك شهر نوفمبر 2024',   recv:'محمد العمري',   status:'معتمد'},
  {id:2, no:'REC-2024-002', kind:'قبض', mid:5, mn:'خالد عمر السلامي',   amt:5000, date:'2024-11-03', method:'تحويل', desc:'تبرع دعم صندوق المساعدات',  recv:'فاطمة الصالح',  status:'معتمد'},
];

export const PAYMENTS = [
  {id:1, no:'PAY-2024-001', kind:'صرف', mid:1, mn:'أحمد محمد الصالح',    amt:10000, date:'2024-11-02', method:'تحويل', desc:'صرف مساعدة زواج معتمدة',   paidBy:'محمد العمري',  status:'معتمد'},
  {id:2, no:'PAY-2024-002', kind:'صرف', mid:3, mn:'محمد حسن القرشي',    amt:5000,  date:'2024-10-16', method:'نقداً', desc:'صرف مساعدة وفاة الوالد',   paidBy:'فاطمة الصالح', status:'معتمد'},
];

export const MESSAGES = [
  {id:1, from:'فاطمة الصالح', fromAv:'ف', to:'محمد العمري',  body:'يرجى مراجعة طلب المساعدة رقم 3', time:'09:15', date:'اليوم', read:false},
  {id:2, from:'أحمد القرشي',  fromAv:'أ', to:'محمد العمري',  body:'تم تحديث تقرير الشهر الماضي',    time:'08:30', date:'اليوم', read:true},
  {id:3, from:'محمد العمري',  fromAv:'م', to:'فاطمة الصالح', body:'تم اعتماد ميزانية الشهر القادم', time:'أمس',   date:'أمس',   read:true},
];

export const EVENTS = [
  {id:1, title:'اجتماع مجلس الإدارة', date:'2024-12-15', time:'10:00', place:'مقر الصندوق',    type:'اجتماع', color:'#1B5E20'},
  {id:2, title:'توزيع مساعدات الشهر', date:'2024-12-20', time:'09:00', place:'الطابق الثاني',  type:'توزيع',  color:'#0D47A1'},
  {id:3, title:'مراجعة حسابات سنوية', date:'2024-12-25', time:'11:00', place:'قسم المالية',    type:'مالي',   color:'#BF6000'},
  {id:4, title:'استقبال أعضاء جدد',   date:'2024-12-28', time:'14:00', place:'قاعة الاستقبال', type:'عضوية', color:'#6A1B9A'},
];

export const AID_TYPES = [
  'مساعدة زواج', 'مساعدة وفاة', 'مساعدة مرضية',
  'مساعدة تعليمية', 'مساعدة ولادة', 'مساعدة طارئة',
];

export const PAY_METHODS = ['نقداً', 'تحويل بنكي', 'شيك', 'محفظة إلكترونية', 'وكالة'];
