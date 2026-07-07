// src/components/charts/BarChart.js
import React from 'react';
import {View, Text} from 'react-native';
import Svg, {Rect} from 'react-native-svg';

export default function BarChart({bars, height = 90, theme, valueFormat}) {
  const max = Math.max(...bars.map(b => b.value), 1);
  const barGap = 8;
  const chartH = height - 26;

  return (
    <View style={{width: '100%'}}>
      <View style={{flexDirection: 'row-reverse', alignItems: 'flex-end', height: chartH, gap: barGap}}>
        {bars.map((b, i) => {
          const h = Math.max((b.value / max) * chartH, 3);
          return (
            <View key={i} style={{flex: 1, alignItems: 'center'}}>
              {b.showValue !== false && (
                <Text style={{fontSize: 9, color: theme.mu, marginBottom: 2}}>
                  {valueFormat ? valueFormat(b.value) : b.value}
                </Text>
              )}
              <View style={{width: '100%', height: chartH, justifyContent: 'flex-end'}}>
                <Svg width="100%" height={h}>
                  <Rect x="10%" y="0" width="80%" height={h} rx={4} fill={b.color || theme.primary} opacity={0.9} />
                </Svg>
              </View>
            </View>
          );
        })}
      </View>
      <View style={{flexDirection: 'row-reverse', gap: barGap, marginTop: 6}}>
        {bars.map((b, i) => (
          <Text key={i} style={{flex: 1, fontSize: 9, color: theme.mu, textAlign: 'center'}} numberOfLines={1}>
            {b.label}
          </Text>
        ))}
      </View>
    </View>
  );
}
