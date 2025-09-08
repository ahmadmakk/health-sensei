import React, { useState, useEffect, createContext, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { defaultUserInfo } from '../../../src/types/userInfo';

const USER_INFO_KEY = 'healthai_user_info';

export const UserInfoContext = createContext<any>(null);

export function UserInfoProvider({ children }: any) {
  const [userInfo, setUserInfo] = useState(defaultUserInfo);

  useEffect(() => {
    (async () => {
      const stored = await AsyncStorage.getItem(USER_INFO_KEY);
      if (stored) {
        try { setUserInfo({ ...defaultUserInfo, ...JSON.parse(stored) }); } catch(e) { console.warn(e); }
      }
    })();
  }, []);

  const updateUserInfo = async (updates: any) => {
    const updated = { ...userInfo, ...updates, lastUpdated: new Date().toISOString() };
    setUserInfo(updated);
    await AsyncStorage.setItem(USER_INFO_KEY, JSON.stringify(updated));
  };

  const resetUserInfo = async () => {
    setUserInfo(defaultUserInfo);
    await AsyncStorage.removeItem(USER_INFO_KEY);
  };

  return (
    <UserInfoContext.Provider value={{ userInfo, updateUserInfo, resetUserInfo }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export const useUserInfo = () => useContext(UserInfoContext);