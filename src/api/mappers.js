// src/api/mappers.js
/**
 * The screens (MembersScreen, AidScreen, etc.) were built against a simple
 * local shape (m.nid, m.sub, m.paid, m.balance, m.join, numeric Date.now()
 * ids...). The backend uses UUIDs and full field names (national_id,
 * monthly_subscription, total_paid, balance_due, join_date...).
 *
 * Rather than rewrite every screen, these mappers translate both ways so
 * DataContext can keep exposing the exact same local shape to screens while
 * still pushing/pulling correctly-shaped records to/from the API.
 */

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function isUuid(id) {
  return typeof id === 'string' && /^[0-9a-f-]{36}$/i.test(id);
}

export function ensureUuid(localId) {
  return isUuid(localId) ? localId : uuid();
}

export function memberToApi(m) {
  return {
    id: ensureUuid(m.id),
    name: m.name,
    national_id: m.nid,
    phone: m.phone,
    email: m.email || null,
    city: m.city || null,
    join_date: m.join || null,
    monthly_subscription: Number(m.sub) || 0,
    status: m.status,
    total_paid: Number(m.paid) || 0,
    balance_due: Number(m.balance) || 0,
  };
}

export function memberFromApi(r) {
  return {
    id: r.id,
    name: r.name,
    nid: r.national_id,
    phone: r.phone,
    email: r.email,
    city: r.city,
    join: r.join_date,
    sub: r.monthly_subscription,
    status: r.status,
    paid: r.total_paid,
    balance: r.balance_due,
    updatedAt: r.updated_at,
    deleted: r.deleted,
  };
}

export function aidToApi(a) {
  return {
    id: ensureUuid(a.id),
    member_id: a.mid,
    member_name: a.mn,
    aid_type: a.type,
    amount: Number(a.amt) || 0,
    request_date: a.date,
    status: a.status,
    note: a.note || null,
    reviewer_name: a.reviewer || null,
  };
}

export function aidFromApi(r) {
  return {
    id: r.id,
    mid: r.member_id,
    mn: r.member_name,
    type: r.aid_type,
    amt: r.amount,
    date: r.request_date,
    status: r.status,
    note: r.note,
    reviewer: r.reviewer_name,
    updatedAt: r.updated_at,
    deleted: r.deleted,
  };
}

export function subToApi(s) {
  return {
    id: ensureUuid(s.id),
    member_id: s.mid,
    member_name: s.mn,
    amount: Number(s.amt) || 0,
    payment_date: s.date,
    method: s.method,
    reference_no: s.ref || null,
  };
}

export function subFromApi(r) {
  return {
    id: r.id,
    mid: r.member_id,
    mn: r.member_name,
    amt: r.amount,
    date: r.payment_date,
    method: r.method,
    ref: r.reference_no,
    updatedAt: r.updated_at,
    deleted: r.deleted,
  };
}

export function treasuryToApi(t) {
  return {
    id: ensureUuid(t.id),
    type: t.type,
    category: t.cat,
    description: t.desc,
    amount: Number(t.amt) || 0,
    entry_date: t.date,
    reference_no: t.ref || null,
  };
}

export function treasuryFromApi(r) {
  return {
    id: r.id,
    type: r.type,
    cat: r.category,
    desc: r.description,
    amt: r.amount,
    date: r.entry_date,
    ref: r.reference_no,
    updatedAt: r.updated_at,
    deleted: r.deleted,
  };
}

export function voucherToApi(v) {
  return {
    id: ensureUuid(v.id),
    voucher_no: v.no,
    kind: v.kind,
    member_id: v.mid,
    member_name: v.mn,
    amount: Number(v.amt) || 0,
    voucher_date: v.date,
    method: v.method,
    description: v.desc,
    issued_by_name: v.recv || v.paidBy || '',
    status: v.status,
  };
}

export function voucherFromApi(r) {
  const base = {
    id: r.id,
    no: r.voucher_no,
    kind: r.kind,
    mid: r.member_id,
    mn: r.member_name,
    amt: r.amount,
    date: r.voucher_date,
    method: r.method,
    desc: r.description,
    status: r.status,
    updatedAt: r.updated_at,
    deleted: r.deleted,
  };
  return r.kind === 'قبض' ? {...base, recv: r.issued_by_name} : {...base, paidBy: r.issued_by_name};
}

export function messageToApi(m) {
  return {
    id: ensureUuid(m.id),
    from_user_id: m.fromId,
    from_name: m.from,
    to_user_id: m.toId,
    to_name: m.to,
    body: m.body,
    read: !!m.read,
  };
}

export function messageFromApi(r) {
  return {
    id: r.id,
    fromId: r.from_user_id,
    from: r.from_name,
    fromAv: (r.from_name || '?')[0],
    toId: r.to_user_id,
    to: r.to_name,
    body: r.body,
    read: r.read,
    time: r.updated_at ? new Date(r.updated_at).toLocaleTimeString('ar', {hour: '2-digit', minute: '2-digit'}) : '',
    date: r.updated_at ? new Date(r.updated_at).toLocaleDateString('ar') : '',
    updatedAt: r.updated_at,
    deleted: r.deleted,
  };
}

export function eventToApi(e) {
  return {
    id: ensureUuid(e.id),
    title: e.title,
    event_date: e.date,
    event_time: e.time || null,
    place: e.place || null,
    type: e.type || null,
    color: e.color || '#1B5E20',
  };
}

export function eventFromApi(r) {
  return {
    id: r.id,
    title: r.title,
    date: r.event_date,
    time: r.event_time,
    place: r.place,
    type: r.type,
    color: r.color,
    updatedAt: r.updated_at,
    deleted: r.deleted,
  };
}

export function fundInfoToApi(f) {
  return {
    name: f.name,
    logo_base64: f.logo || null,
    phone: f.phone || null,
    email: f.email || null,
    address: f.address || null,
    registration_no: f.regNo || null,
  };
}

export function fundInfoFromApi(r) {
  return {
    name: r.name,
    logo: r.logo_base64,
    phone: r.phone,
    email: r.email,
    address: r.address,
    regNo: r.registration_no,
  };
}
