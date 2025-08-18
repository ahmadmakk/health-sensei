export interface UserInfo {
  // Basic info
  name?: string;
  age?: number;
  weight?: number; // in kg
  height?: number; // in cm
  sex?: 'male' | 'female' | 'other' | 'prefer-not-to-say';
  
  // Location & lifestyle
  location?: string;
  lifestyle?: 'sedentary' | 'lightly-active' | 'moderately-active' | 'very-active' | 'extremely-active';
  
  // Goals & beliefs
  goals?: string[];
  beliefs?: string; // dietary restrictions, religious considerations, etc.
  
  // Health info
  healthConditions?: string[];
  medications?: string[];
  allergies?: string[];
  
  // Preferences
  preferredUnits?: 'metric' | 'imperial';
  
  // Tracking
  onboardingCompleted?: boolean;
  lastUpdated?: string;
}

export const defaultUserInfo: UserInfo = {
  preferredUnits: 'metric',
  onboardingCompleted: false,
  goals: [],
  healthConditions: [],
  medications: [],
  allergies: [],
};