import React from 'react';
import { TextInput, StyleSheet, View, TextInputProps } from 'react-native';

export function Input(props: TextInputProps) {
  return (
    <View style={styles.wrapper}>
      <TextInput {...props} style={[styles.input, props.style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%'
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#fff'
  }
});
