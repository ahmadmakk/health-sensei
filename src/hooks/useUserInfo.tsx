import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { UserInfo, defaultUserInfo } from '@/types/userInfo';

interface UserInfoContextType {
  userInfo: UserInfo;
  updateUserInfo: (updates: Partial<UserInfo>) => void;
  resetUserInfo: () => void;
  isOnboardingComplete: boolean;
  getUserInfoForAI: () => string;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

const USER_INFO_KEY = 'healthai_user_info';

export function UserInfoProvider({ children }: { children: ReactNode }) {
  const [userInfo, setUserInfo] = useState<UserInfo>(defaultUserInfo);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(USER_INFO_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserInfo({ ...defaultUserInfo, ...parsed });
      } catch (error) {
        console.error('Failed to parse stored user info:', error);
      }
    }
  }, []);

  const updateUserInfo = (updates: Partial<UserInfo>) => {
    const updatedInfo = {
      ...userInfo,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };
    setUserInfo(updatedInfo);
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(updatedInfo));
  };

  const resetUserInfo = () => {
    setUserInfo(defaultUserInfo);
    localStorage.removeItem(USER_INFO_KEY);
  };

  const getUserInfoForAI = () => {
    const info = [];
    
    if (userInfo.name) info.push(`Name: ${userInfo.name}`);
    if (userInfo.age) info.push(`Age: ${userInfo.age}`);
    if (userInfo.sex) info.push(`Sex: ${userInfo.sex}`);
    if (userInfo.weight) info.push(`Weight: ${userInfo.weight}kg`);
    if (userInfo.height) info.push(`Height: ${userInfo.height}cm`);
    if (userInfo.lifestyle) info.push(`Activity level: ${userInfo.lifestyle}`);
    if (userInfo.location) info.push(`Location: ${userInfo.location}`);
    if (userInfo.goals?.length) info.push(`Goals: ${userInfo.goals.join(', ')}`);
    if (userInfo.beliefs) info.push(`Dietary/Religious considerations: ${userInfo.beliefs}`);
    if (userInfo.healthConditions?.length) info.push(`Health conditions: ${userInfo.healthConditions.join(', ')}`);
    if (userInfo.medications?.length) info.push(`Medications: ${userInfo.medications.join(', ')}`);
    if (userInfo.allergies?.length) info.push(`Allergies: ${userInfo.allergies.join(', ')}`);
    
    return info.length > 0 ? `User Profile: ${info.join('; ')}` : '';
  };

  const isOnboardingComplete = userInfo.onboardingCompleted || false;

  return (
    <UserInfoContext.Provider value={{
      userInfo,
      updateUserInfo,
      resetUserInfo,
      isOnboardingComplete,
      getUserInfoForAI,
    }}>
      {children}
    </UserInfoContext.Provider>
  );
}

export const useUserInfo = () => {
  const context = useContext(UserInfoContext);
  if (context === undefined) {
    throw new Error('useUserInfo must be used within a UserInfoProvider');
  }
  return context;
};