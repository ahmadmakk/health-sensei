import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export function Toast({ title, message }: { title: string; message?: string }) {
  return (
    <View style={styles.container} accessible accessibilityRole="alert">
      <Text style={styles.title}>{title}</Text>
      {message && <Text style={styles.msg}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 40, left: 20, right: 20, backgroundColor: '#111827', padding: 12, borderRadius: 8, zIndex: 9999 },
  title: { color: '#fff', fontWeight: '700' },
  msg: { color: '#e5e7eb', marginTop: 4 }
});
