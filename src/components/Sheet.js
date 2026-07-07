// src/components/Sheet.js
import React from 'react';
import {Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView, Pressable} from 'react-native';
import Icon from '../icons/Icon';

export default function Sheet({visible, title, onClose, children, theme, accent, noPad}) {
  if (!visible) return null;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, {backgroundColor: theme.card}]} onPress={() => {}}>
          <View style={[styles.header, {borderBottomColor: theme.border, backgroundColor: theme.card}]}>
            <Text style={[styles.title, {color: accent || theme.p}]}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={[styles.closeBtn, {backgroundColor: theme.bg}]}>
              <Icon name="close" size={18} color={theme.mu} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={{padding: noPad ? 0 : 20, paddingBottom: 36}}>
            {children}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,12,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: {
    fontWeight: '800',
    fontSize: 16,
  },
  closeBtn: {
    borderRadius: 10,
    padding: 6,
  },
});
