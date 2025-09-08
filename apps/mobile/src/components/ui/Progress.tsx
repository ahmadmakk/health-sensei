import React from 'react';
import { View, StyleSheet } from 'react-native';

type ProgressProps = {
  value: number; // 0-100
  height?: number;
  color?: string;
};

export function Progress({ value, height = 8, color = '#10b981' }: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <View style={[styles.track, { height }]}> 
      <View style={[styles.fill, { width: `${clamped}%`, backgroundColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { backgroundColor: '#f3f4f6', borderRadius: 8, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 8 }
});
