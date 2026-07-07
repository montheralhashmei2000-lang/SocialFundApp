// src/components/Badge.js
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

const MAP = {
  'نشط':          ['#E8F5E9', '#1B5E20'],
  'معلق':         ['#FFF3E0', '#E65100'],
  'معتمدة':       ['#E8F5E9', '#2E7D32'],
  'مصروفة':       ['#E3F2FD', '#0D47A1'],
  'قيد المراجعة':['#FFF8E1', '#F57F17'],
  'مرفوضة':      ['#FFEBEE', '#B71C1C'],
  'معتمد':        ['#E8F5E9', '#2E7D32'],
};

export default function Badge({status}) {
  const [bg, fg] = MAP[status] || ['#F5F5F5', '#666'];
  return (
    <View style={[styles.badge, {backgroundColor: bg}]}>
      <Text style={[styles.text, {color: fg}]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
  },
});
