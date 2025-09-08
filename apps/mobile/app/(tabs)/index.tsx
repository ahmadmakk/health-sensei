import React from 'react';
import { View, Text, Button } from 'react-native';
import { useMealsStore } from '../../src/hooks/useMeals';
import { useUserInfo } from '../../src/hooks/useUserInfo';

export default function KitchenScreen() {
  const { loadMeals, mealsByDate } = useMealsStore();
  const { userInfo } = useUserInfo();

  React.useEffect(() => {
    loadMeals();
  }, []);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 12 }}>Kitchen</Text>
      <Text style={{ marginBottom: 8 }}>Hello {userInfo.name ?? 'Guest'}</Text>
      <Button title="Start AI Food Chat" onPress={() => {
        // open AI chat screen or implementation
      }} />
    </View>
  );
}
