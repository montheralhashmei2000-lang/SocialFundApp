// src/components/charts/Donut.js
import React from 'react';
import {View, Text} from 'react-native';
import Svg, {Circle} from 'react-native-svg';

export default function Donut({segments, size = 120, strokeWidth = 14, centerLabel, centerSub, theme}) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;

  return (
    <View style={{width: size, height: size, alignItems: 'center', justifyContent: 'center'}}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Circle cx={cx} cy={cy} r={r} stroke={theme.border} strokeWidth={strokeWidth} fill="none" />
        {segments.map((seg, i) => {
          const len = (seg.value / total) * circ;
          const gap = circ - len;
          const el = (
            <Circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              stroke={seg.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${len} ${gap}`}
              strokeDashoffset={-offset}
              fill="none"
              strokeLinecap="butt"
              rotation={-90}
              origin={`${cx}, ${cy}`}
            />
          );
          offset += len;
          return el;
        })}
      </Svg>
      {(centerLabel || centerSub) && (
        <View style={{position: 'absolute', alignItems: 'center'}}>
          {centerLabel ? <Text style={{fontSize: 18, fontWeight: '900', color: theme.tx}}>{centerLabel}</Text> : null}
          {centerSub ? <Text style={{fontSize: 10, color: theme.mu, marginTop: 1}}>{centerSub}</Text> : null}
        </View>
      )}
    </View>
  );
}
