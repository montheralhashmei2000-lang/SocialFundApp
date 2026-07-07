// src/api/newId.js
/**
 * Generates a client-side UUID for brand-new records (members, aid
 * requests, subscriptions, etc.) created while offline or online.
 *
 * Using a real UUID (not Date.now()) matters because the backend's primary
 * keys are UUID columns and the sync engine treats `id` as the stable
 * identity of a row across devices - a numeric timestamp id would collide
 * in theory and doesn't match the column type the API expects.
 */
export default function newId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
