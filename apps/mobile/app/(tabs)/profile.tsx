import React from 'react';
import { View, Text, Button, ScrollView } from 'react-native';
import { useUserInfo } from '../../src/hooks/useUserInfo';

export default function ProfileScreen() {
  const { userInfo, resetUserInfo } = useUserInfo();

  const entries = [
    ['Name', userInfo.name ?? '—'],
    ['Age', userInfo.age ? String(userInfo.age) : '—'],
    ['Weight', userInfo.weight ? String(userInfo.weight) + ' kg' : '—'],
    ['Height', userInfo.height ? String(userInfo.height) + ' cm' : '—'],
    ['Preferred Units', userInfo.preferredUnits ?? 'metric'],
  ];

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Profile</Text>
      {entries.map(([k,v]) => (
        <View key={k} style={{ paddingVertical: 8 }}>
          <Text style={{ fontWeight: '600' }}>{k}</Text>
          <Text>{v}</Text>
        </View>
      ))}

      <Button title="Reset Personal Info" onPress={() => resetUserInfo()} />
    </ScrollView>
  );
}
