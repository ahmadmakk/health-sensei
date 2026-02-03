import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultUserInfo, UserInfo } from '../../../src/types/userInfo';

const USER_INFO_KEY = 'healthai_user_info';

interface UserInfoContextType {
  userInfo: UserInfo;
  updateUserInfo: (updates: Partial<UserInfo>) => Promise<void>;
  resetUserInfo: () => Promise<void>;
}

export const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(USER_INFO_KEY);
        if (stored) {
          setUserInfo({ ...defaultUserInfo, ...JSON.parse(stored) });
        }
      } catch (e) {
        console.warn('Failed to load user info', e);
      }
    })();
  }, []);

  const updateUserInfo = async (updates: Partial<UserInfo>) => {
    const updated = { ...userInfo, ...updates, lastUpdated: new Date().toISOString() };
    setUserInfo(updated);
    try {
      await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save user info', e);
    }
  };

  const resetUserInfo = async () => {
    setUserInfo(defaultUserInfo);
    try {
      await AsyncStorage.removeItem(USER_INFO_KEY);
    } catch (e) {
      console.warn('Failed to remove user info', e);
    }
  };

  return (
    <UserInfoContext.Provider value={{ userInfo, updateUserInfo, resetUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export const useUserInfo = () => {
  const ctx = useContext(UserInfoContext);
  if (!ctx) throw new Error('useUserInfo must be used within UserInfoProvider');
  return ctx;
};
