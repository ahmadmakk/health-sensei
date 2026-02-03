import { Tabs } from 'expo-router';
import React from 'react';
import { UserInfoProvider } from '../src/hooks/useUserInfo';

export default function Layout() {
  return (
    <UserInfoProvider>
      <Tabs
        screenOptions={{
          headerShown: true,
        }}
      >
        <Tabs.Screen name="(tabs)/index" options={{ title: 'Kitchen' }} />
        <Tabs.Screen name="(tabs)/profile" options={{ title: 'Profile' }} />
      </Tabs>
    </UserInfoProvider>
  );
}
