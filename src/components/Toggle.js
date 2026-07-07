// src/components/Toggle.js
import React from 'react';
import {Switch, Platform} from 'react-native';

export default function Toggle({value, onValueChange, theme, disabled}) {
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{false: theme.border, true: theme.primary}}
      thumbColor={Platform.OS === 'android' ? '#fff' : undefined}
      ios_backgroundColor={theme.border}
    />
  );
}
