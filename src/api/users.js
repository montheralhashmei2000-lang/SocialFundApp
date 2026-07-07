// src/api/users.js
import {api} from './client';

/** Lightweight roster of active colleagues (excludes the current user) for the messaging recipient picker. */
export function listColleagues() {
  return api.get('/users/colleagues');
}
