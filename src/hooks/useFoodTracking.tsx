import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  MealEntry,
  DailyNutrition,
  FoodItem,
  NutritionGoals,
  calculateDailyNutrition,
  getMacroPercentages
} from '@/types/food';
import {
  PantryItem,
  Recipe,
  MealPlan,
  GroceryList,
  GroceryItem,
  PantryStats,
  canMakeRecipe,
  generateGroceryList,
  isExpiringSoon,
  isLowStock
} from '@/types/pantry';
import { useUserInfo } from './useUserInfo';

interface FoodTrackingContextType {
  // Daily nutrition data
  todaysNutrition: DailyNutrition;
  nutritionGoals: NutritionGoals;

  // Meal Actions
  addMeal: (meal: Omit<MealEntry, 'id' | 'timestamp'>) => void;
  removeMeal: (mealId: string) => void;
  updateMeal: (mealId: string, updates: Partial<MealEntry>) => void;
  updateNutritionGoals: (goals: Partial<NutritionGoals>) => void;

  // Pantry Management
  pantryItems: PantryItem[];
  addPantryItem: (item: Omit<PantryItem, 'id' | 'addedDate'>) => void;
  removePantryItem: (itemId: string) => void;
  updatePantryItem: (itemId: string, updates: Partial<PantryItem>) => void;
  getPantryStats: () => PantryStats;

  // Recipe Management
  recipes: Recipe[];
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt'>) => void;
  removeRecipe: (recipeId: string) => void;
  updateRecipe: (recipeId: string, updates: Partial<Recipe>) => void;
  toggleRecipeFavorite: (recipeId: string) => void;

  // Meal Planning
  mealPlans: MealPlan[];
  addMealPlan: (plan: Omit<MealPlan, 'id'>) => void;
  removeMealPlan: (planId: string) => void;
  updateMealPlan: (planId: string, updates: Partial<MealPlan>) => void;
  getMealPlansForDate: (date: string) => MealPlan[];

  // Grocery Lists
  groceryLists: GroceryList[];
  addGroceryList: (list: Omit<GroceryList, 'id' | 'createdAt'>) => void;
  removeGroceryList: (listId: string) => void;
  updateGroceryList: (listId: string, updates: Partial<GroceryList>) => void;
  generateGroceryListForRecipe: (recipeId: string, date?: string) => GroceryList;

  // Recipe Checking
  checkRecipeAvailability: (recipeId: string) => {
    canMake: boolean;
    missingIngredients: any[];
    insufficientIngredients: any[];
  };

  // Helpers
  getMacroPercentagesForToday: () => { protein: number; carbs: number; fat: number };
  getCaloriesRemaining: () => number;
  getDailyNutrition: (date: string) => DailyNutrition | null;

  // AI Analysis
  analyzeFood: (imageData: string, goal: 'lose_weight' | 'maintain' | 'gain_weight') => Promise<FoodItem>;
  searchFood: (foodDescription: string, goal: 'lose_weight' | 'maintain' | 'gain_weight') => Promise<FoodItem>;
}

const FoodTrackingContext = createContext<FoodTrackingContextType | undefined>(undefined);

const NUTRITION_DATA_KEY = 'healthai_nutrition_data';
const NUTRITION_GOALS_KEY = 'healthai_nutrition_goals';
const PANTRY_ITEMS_KEY = 'healthai_pantry_items';
const RECIPES_KEY = 'healthai_recipes';
const MEAL_PLANS_KEY = 'healthai_meal_plans';
const GROCERY_LISTS_KEY = 'healthai_grocery_lists';

// Default nutrition goals
const defaultNutritionGoals: NutritionGoals = {
  targetCalories: 2200,
  targetMacros: {
    protein: 140,  // grams
    carbs: 250,    // grams
    fat: 80,       // grams
  },
  goal: 'maintain',
  activityLevel: 'moderate',
};

export function FoodTrackingProvider({ children }: { children: ReactNode }) {
  const { userInfo } = useUserInfo();
  const [nutritionData, setNutritionData] = useState<Record<string, DailyNutrition>>({});
  const [nutritionGoals, setNutritionGoals] = useState<NutritionGoals>(defaultNutritionGoals);
  const [pantryItems, setPantryItems] = useState<PantryItem[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealPlans, setMealPlans] = useState<MealPlan[]>([]);
  const [groceryLists, setGroceryLists] = useState<GroceryList[]>([]);

  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format

  // Load data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem(NUTRITION_DATA_KEY);
    const storedGoals = localStorage.getItem(NUTRITION_GOALS_KEY);
    const storedPantry = localStorage.getItem(PANTRY_ITEMS_KEY);
    const storedRecipes = localStorage.getItem(RECIPES_KEY);
    const storedMealPlans = localStorage.getItem(MEAL_PLANS_KEY);
    const storedGroceryLists = localStorage.getItem(GROCERY_LISTS_KEY);

    if (storedData) {
      try {
        setNutritionData(JSON.parse(storedData));
      } catch (error) {
        console.error('Failed to parse nutrition data:', error);
      }
    }

    if (storedGoals) {
      try {
        setNutritionGoals(JSON.parse(storedGoals));
      } catch (error) {
        console.error('Failed to parse nutrition goals:', error);
      }
    }

    if (storedPantry) {
      try {
        setPantryItems(JSON.parse(storedPantry));
      } catch (error) {
        console.error('Failed to parse pantry items:', error);
      }
    }

    if (storedRecipes) {
      try {
        setRecipes(JSON.parse(storedRecipes));
      } catch (error) {
        console.error('Failed to parse recipes:', error);
      }
    }

    if (storedMealPlans) {
      try {
        setMealPlans(JSON.parse(storedMealPlans));
      } catch (error) {
        console.error('Failed to parse meal plans:', error);
      }
    }

    if (storedGroceryLists) {
      try {
        setGroceryLists(JSON.parse(storedGroceryLists));
      } catch (error) {
        console.error('Failed to parse grocery lists:', error);
      }
    }
  }, []);

  // Calculate nutrition goals based on user info
  useEffect(() => {
    if (userInfo.weight && userInfo.height && userInfo.age && userInfo.sex) {
      const calculatedGoals = calculateNutritionGoals(userInfo);
      setNutritionGoals(prev => ({ ...prev, ...calculatedGoals }));
    }
  }, [userInfo]);

  // Get or create today's nutrition data
  const todaysNutrition: DailyNutrition = nutritionData[today] || {
    date: today,
    meals: [],
    totalCalories: 0,
    totalMacros: { protein: 0, carbs: 0, fat: 0 },
    waterIntake: 0,
    supplementsTaken: [],
  };

  const saveNutritionData = (data: Record<string, DailyNutrition>) => {
    setNutritionData(data);
    localStorage.setItem(NUTRITION_DATA_KEY, JSON.stringify(data));
  };

  const addMeal = (meal: Omit<MealEntry, 'id' | 'timestamp'>) => {
    const newMeal: MealEntry = {
      ...meal,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };

    const updatedMeals = [...todaysNutrition.meals, newMeal];
    const { calories, macros } = calculateDailyNutrition(updatedMeals);
    
    const updatedDay: DailyNutrition = {
      ...todaysNutrition,
      meals: updatedMeals,
      totalCalories: calories,
      totalMacros: macros,
    };

    const updatedData = {
      ...nutritionData,
      [today]: updatedDay,
    };

    saveNutritionData(updatedData);
  };

  const removeMeal = (mealId: string) => {
    const updatedMeals = todaysNutrition.meals.filter(meal => meal.id !== mealId);
    const { calories, macros } = calculateDailyNutrition(updatedMeals);
    
    const updatedDay: DailyNutrition = {
      ...todaysNutrition,
      meals: updatedMeals,
      totalCalories: calories,
      totalMacros: macros,
    };

    const updatedData = {
      ...nutritionData,
      [today]: updatedDay,
    };

    saveNutritionData(updatedData);
  };

  const updateMeal = (mealId: string, updates: Partial<MealEntry>) => {
    const updatedMeals = todaysNutrition.meals.map(meal =>
      meal.id === mealId ? { ...meal, ...updates } : meal
    );
    const { calories, macros } = calculateDailyNutrition(updatedMeals);
    
    const updatedDay: DailyNutrition = {
      ...todaysNutrition,
      meals: updatedMeals,
      totalCalories: calories,
      totalMacros: macros,
    };

    const updatedData = {
      ...nutritionData,
      [today]: updatedDay,
    };

    saveNutritionData(updatedData);
  };

  const updateNutritionGoals = (goals: Partial<NutritionGoals>) => {
    const updatedGoals = { ...nutritionGoals, ...goals };
    setNutritionGoals(updatedGoals);
    localStorage.setItem(NUTRITION_GOALS_KEY, JSON.stringify(updatedGoals));
  };

  const getMacroPercentagesForToday = () => {
    return getMacroPercentages(todaysNutrition.totalMacros, todaysNutrition.totalCalories);
  };

  const getCaloriesRemaining = () => {
    return Math.max(nutritionGoals.targetCalories - todaysNutrition.totalCalories, 0);
  };

  const getDailyNutrition = (date: string) => {
    return nutritionData[date] || null;
  };

  // Real AI food analysis using Google Gemini
  const analyzeFood = async (imageData: string, goal: 'lose_weight' | 'maintain' | 'gain_weight'): Promise<FoodItem> => {
    try {
      // Dynamic import to avoid bundling issues
      const { foodAnalysisService } = await import('@/services/foodAnalysisService');
      return await foodAnalysisService.analyzeFood(imageData, goal);
    } catch (error) {
      console.error('AI food analysis failed:', error);

      // Fallback to a basic estimation if AI fails
      return {
        id: Date.now().toString(),
        name: "Unknown Food (Please edit)",
        calories: goal === 'lose_weight' ? 400 : goal === 'gain_weight' ? 350 : 375,
        macros: { protein: 20, carbs: 40, fat: 15 },
        servingSize: "1 portion",
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
    }
  };

  // AI text-based food search using Google Gemini
  const searchFood = async (foodDescription: string, goal: 'lose_weight' | 'maintain' | 'gain_weight'): Promise<FoodItem> => {
    try {
      // Dynamic import to avoid bundling issues
      const { foodAnalysisService } = await import('@/services/foodAnalysisService');
      return await foodAnalysisService.searchFood(foodDescription, goal);
    } catch (error) {
      console.error('AI food search failed:', error);

      // Fallback to a basic estimation if AI fails
      return {
        id: Date.now().toString(),
        name: `${foodDescription} (Estimated)`,
        calories: goal === 'lose_weight' ? 350 : goal === 'gain_weight' ? 320 : 335,
        macros: { protein: 18, carbs: 30, fat: 12 },
        servingSize: "1 serving",
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
    }
  };

  return (
    <FoodTrackingContext.Provider value={{
      todaysNutrition,
      nutritionGoals,
      addMeal,
      removeMeal,
      updateMeal,
      updateNutritionGoals,
      getMacroPercentagesForToday,
      getCaloriesRemaining,
      getDailyNutrition,
      analyzeFood,
      searchFood,
    }}>
      {children}
    </FoodTrackingContext.Provider>
  );
}

export const useFoodTracking = () => {
  const context = useContext(FoodTrackingContext);
  if (context === undefined) {
    throw new Error('useFoodTracking must be used within a FoodTrackingProvider');
  }
  return context;
};

// Helper function to calculate nutrition goals based on user info
function calculateNutritionGoals(userInfo: any): Partial<NutritionGoals> {
  const { weight, height, age, sex, lifestyle, goals } = userInfo;
  
  if (!weight || !height || !age) return {};
  
  // Calculate BMR using Mifflin-St Jeor Equation
  let bmr;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  // Activity multiplier
  const activityMultipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
  };
  
  const tdee = bmr * (activityMultipliers[lifestyle as keyof typeof activityMultipliers] || 1.55);
  
  // Adjust based on goals
  let targetCalories = tdee;
  let goal: 'lose_weight' | 'maintain' | 'gain_weight' = 'maintain';
  
  if (goals?.includes('lose_weight')) {
    targetCalories = tdee - 500; // 500 calorie deficit
    goal = 'lose_weight';
  } else if (goals?.includes('gain_weight') || goals?.includes('build_muscle')) {
    targetCalories = tdee + 300; // 300 calorie surplus
    goal = 'gain_weight';
  }
  
  // Calculate macro targets
  const proteinTarget = weight * 2.2; // 2.2g per kg
  const fatTarget = Math.round((targetCalories * 0.25) / 9); // 25% of calories from fat
  const carbsTarget = Math.round((targetCalories - (proteinTarget * 4) - (fatTarget * 9)) / 4);
  
  return {
    targetCalories: Math.round(targetCalories),
    targetMacros: {
      protein: Math.round(proteinTarget),
      carbs: Math.max(carbsTarget, 0),
      fat: fatTarget,
    },
    goal,
  };
}
