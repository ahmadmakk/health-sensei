import { Tabs } from 'expo-router';
import { View, Pressable } from 'react-native';
import { Menu } from 'lucide-react-native';

export default function Layout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
      }}
    >
      <Tabs.Screen name="(tabs)/index" options={{ title: 'Kitchen' }} />
      <Tabs.Screen name="(tabs)/profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
