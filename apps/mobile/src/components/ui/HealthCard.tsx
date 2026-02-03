import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type HealthCardProps = {
  title: string;
  value?: string | number;
  subtitle?: string;
  children?: React.ReactNode;
  style?: ViewStyle;
  valueStyle?: TextStyle;
};

export function HealthCard({ title, value, subtitle, children, style, valueStyle }: HealthCardProps) {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {value !== undefined && <Text style={[styles.value, valueStyle]}>{value}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {children && <View style={styles.children}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e6edf3'
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: '#374151', fontWeight: '600' },
  value: { fontSize: 20, fontWeight: '700', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 6 },
  children: { marginTop: 10 }
});
