// src/components/Field.js
import React from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import Icon from '../icons/Icon';

export default function Field({
  label, value, onChangeText, placeholder, icon, theme,
  secureTextEntry, keyboardType, opts, onSelect, rightEl, multiline, numberOfLines,
}) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={[styles.label, {color: theme.sub}]}>{label}</Text> : null}
      <View style={styles.row}>
        {icon ? (
          <View style={styles.iconWrap}>
            <Icon name={icon} size={17} color={theme.mu} />
          </View>
        ) : null}
        {opts ? (
          <View style={[styles.pickerBox, {borderColor: theme.border, backgroundColor: theme.surf}]}>
            <Picker
              selectedValue={value}
              onValueChange={onSelect}
              style={{color: theme.tx}}
              dropdownIconColor={theme.mu}>
              {opts.map(o => (
                <Picker.Item key={String(o.v)} label={o.l} value={o.v} />
              ))}
            </Picker>
          </View>
        ) : (
          <TextInput
            value={String(value ?? '')}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={theme.mu}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType || 'default'}
            multiline={multiline}
            numberOfLines={numberOfLines}
            textAlign="right"
            style={[
              styles.input,
              {
                borderColor: theme.border,
                color: theme.tx,
                backgroundColor: theme.surf,
                paddingRight: icon ? 40 : 14,
                paddingLeft: rightEl ? 40 : 14,
                height: multiline ? (numberOfLines || 3) * 22 + 20 : 46,
                textAlignVertical: multiline ? 'top' : 'center',
              },
            ]}
          />
        )}
        {rightEl ? <View style={styles.rightWrap}>{rightEl}</View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {marginBottom: 14},
  label: {fontSize: 12, fontWeight: '700', marginBottom: 5, textAlign: 'right'},
  row: {position: 'relative', justifyContent: 'center'},
  input: {
    borderWidth: 1.5,
    borderRadius: 12,
    fontSize: 14,
  },
  pickerBox: {
    borderWidth: 1.5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  iconWrap: {
    position: 'absolute',
    right: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
  rightWrap: {
    position: 'absolute',
    left: 12,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    zIndex: 2,
  },
});
