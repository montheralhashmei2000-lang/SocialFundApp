// src/components/Card.js
import React from 'react';
import {View, StyleSheet} from 'react-native';

export default function Card({children, style, theme}) {
  return (
    <View
      style={[
        styles.card,
        {backgroundColor: theme.card, shadowColor: '#000'},
        style,
      ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
});
