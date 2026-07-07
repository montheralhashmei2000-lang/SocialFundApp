// src/components/charts/LineChart.js
import React from 'react';
import {View, Text} from 'react-native';
import Svg, {Polyline, Circle, Line, Defs, LinearGradient as SvgLinearGradient, Stop, Polygon} from 'react-native-svg';

export default function LineChart({points, height = 120, theme, color}) {
  const width = 300;
  const padding = 20;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2;
  const max = Math.max(...points.map(p => p.value), 1);
  const min = Math.min(...points.map(p => p.value), 0);
  const range = max - min || 1;
  const lineColor = color || theme.primary;

  const coords = points.map((p, i) => {
    const x = padding + (i / (points.length - 1 || 1)) * chartW;
    const y = padding + chartH - ((p.value - min) / range) * chartH;
    return {x, y, ...p};
  });

  const polylinePoints = coords.map(c => `${c.x},${c.y}`).join(' ');
  const areaPoints = `${padding},${padding + chartH} ${polylinePoints} ${padding + chartW},${padding + chartH}`;

  return (
    <View>
      <Svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <Defs>
          <SvgLinearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={lineColor} stopOpacity="0.3" />
            <Stop offset="1" stopColor={lineColor} stopOpacity="0" />
          </SvgLinearGradient>
        </Defs>
        {[0, 0.5, 1].map((t, i) => (
          <Line
            key={i}
            x1={padding}
            x2={padding + chartW}
            y1={padding + chartH * t}
            y2={padding + chartH * t}
            stroke={theme.border}
            strokeWidth={1}
          />
        ))}
        <Polygon points={areaPoints} fill="url(#areaGrad)" />
        <Polyline points={polylinePoints} fill="none" stroke={lineColor} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {coords.map((c, i) => (
          <Circle key={i} cx={c.x} cy={c.y} r={4} fill={theme.card} stroke={lineColor} strokeWidth={2} />
        ))}
      </Svg>
      <View style={{flexDirection: 'row-reverse', justifyContent: 'space-between', paddingHorizontal: 4, marginTop: -4}}>
        {points.map((p, i) => (
          <Text key={i} style={{fontSize: 9, color: theme.mu}}>{p.label}</Text>
        ))}
      </View>
    </View>
  );
}
