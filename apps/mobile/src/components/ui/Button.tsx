import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

type ButtonProps = {
  title?: string;
  children?: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  style?: ViewStyle;
  textStyle?: TextStyle;
  disabled?: boolean;
};

export function Button({ title, children, onPress, variant = 'default', style, textStyle, disabled }: ButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.button, variant === 'outline' && styles.outline, variant === 'ghost' && styles.ghost, style]} disabled={disabled}>
      {children ? children : <Text style={[styles.text, textStyle]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    color: '#fff',
    fontWeight: '600'
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  ghost: {
    backgroundColor: 'transparent'
  }
});
