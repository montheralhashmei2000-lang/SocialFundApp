// src/components/Btn.js
import React from 'react';
import {TouchableOpacity, Text, StyleSheet, View} from 'react-native';

export default function Btn({onPress, children, variant = 'primary', small, disabled, full = true, theme}) {
  const VARIANTS = {
    primary: {backgroundColor: theme.primaryMid, textColor: '#fff'},
    gold:    {backgroundColor: theme.gold, textColor: theme.primaryDark},
    outline: {backgroundColor: 'transparent', textColor: theme.primary, borderColor: theme.primary, borderWidth: 1.5},
    danger:  {backgroundColor: theme.err, textColor: '#fff'},
    ghost:   {backgroundColor: theme.surf, textColor: theme.sub, borderColor: theme.border, borderWidth: 1},
    info:    {backgroundColor: theme.info, textColor: '#fff'},
  };
  const v = VARIANTS[variant] || VARIANTS.primary;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        {
          backgroundColor: v.backgroundColor,
          borderColor: v.borderColor,
          borderWidth: v.borderWidth || 0,
          paddingVertical: small ? 8 : 13,
          paddingHorizontal: small ? 14 : 20,
          opacity: disabled ? 0.5 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
      ]}>
      <View style={styles.content}>
        {typeof children === 'string' ? (
          <Text style={[styles.text, {color: v.textColor, fontSize: small ? 13 : 15}]}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 6,
  },
  text: {
    fontWeight: '700',
  },
});
