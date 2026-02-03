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

  const today = new Date().toISOString().split('T')[0];

  // Remove nutrition entries older than 3 days to avoid piling up data
  const pruneOldNutritionData = (data: Record<string, DailyNutrition>) => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 3);
      const cutoffStr = cutoff.toISOString().split('T')[0]; // YYYY-MM-DD

      return Object.keys(data).reduce((acc: Record<string, DailyNutrition>, dateKey) => {
        // keep entries that are on or after cutoff
        if (dateKey >= cutoffStr) {
          acc[dateKey] = data[dateKey];
        }
        return acc;
      }, {} as Record<string, DailyNutrition>);
    } catch (e) {
      console.error('Failed to prune nutrition data:', e);
      return data;
    }
  }; // YYYY-MM-DD format

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
        const parsed = JSON.parse(storedData);
        const pruned = pruneOldNutritionData(parsed);
        setNutritionData(pruned);
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
    const pruned = pruneOldNutritionData(data);
    setNutritionData(pruned);
    localStorage.setItem(NUTRITION_DATA_KEY, JSON.stringify(pruned));
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

  // Pantry Management Functions
  const addPantryItem = (item: Omit<PantryItem, 'id' | 'addedDate'>) => {
    const newItem: PantryItem = {
      ...item,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      addedDate: new Date().toISOString(),
      isLowStock: isLowStock({ ...item, id: '', addedDate: '' }),
    };

    const updatedItems = [...pantryItems, newItem];
    setPantryItems(updatedItems);
    localStorage.setItem(PANTRY_ITEMS_KEY, JSON.stringify(updatedItems));
  };

  const removePantryItem = (itemId: string) => {
    const updatedItems = pantryItems.filter(item => item.id !== itemId);
    setPantryItems(updatedItems);
    localStorage.setItem(PANTRY_ITEMS_KEY, JSON.stringify(updatedItems));
  };

  const updatePantryItem = (itemId: string, updates: Partial<PantryItem>) => {
    const updatedItems = pantryItems.map(item => {
      if (item.id === itemId) {
        const updated = { ...item, ...updates };
        return { ...updated, isLowStock: isLowStock(updated) };
      }
      return item;
    });
    setPantryItems(updatedItems);
    localStorage.setItem(PANTRY_ITEMS_KEY, JSON.stringify(updatedItems));
  };

  const getPantryStats = (): PantryStats => {
    const stats: PantryStats = {
      totalItems: pantryItems.length,
      expiringWithin3Days: pantryItems.filter(item =>
        item.expiryDate && isExpiringSoon(item.expiryDate)
      ).length,
      lowStockItems: pantryItems.filter(item => item.isLowStock).length,
      categoryCounts: pantryItems.reduce((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
    return stats;
  };

  // Recipe Management Functions
  const addRecipe = (recipe: Omit<Recipe, 'id' | 'createdAt'>) => {
    const newRecipe: Recipe = {
      ...recipe,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    const updatedRecipes = [...recipes, newRecipe];
    setRecipes(updatedRecipes);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
  };

  const removeRecipe = (recipeId: string) => {
    const updatedRecipes = recipes.filter(recipe => recipe.id !== recipeId);
    setRecipes(updatedRecipes);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
  };

  const updateRecipe = (recipeId: string, updates: Partial<Recipe>) => {
    const updatedRecipes = recipes.map(recipe =>
      recipe.id === recipeId ? { ...recipe, ...updates } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
  };

  const toggleRecipeFavorite = (recipeId: string) => {
    const updatedRecipes = recipes.map(recipe =>
      recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
    );
    setRecipes(updatedRecipes);
    localStorage.setItem(RECIPES_KEY, JSON.stringify(updatedRecipes));
  };

  // Meal Planning Functions
  const addMealPlan = (plan: Omit<MealPlan, 'id'>) => {
    const newPlan: MealPlan = {
      ...plan,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    };

    const updatedPlans = [...mealPlans, newPlan];
    setMealPlans(updatedPlans);
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updatedPlans));
  };

  const removeMealPlan = (planId: string) => {
    const updatedPlans = mealPlans.filter(plan => plan.id !== planId);
    setMealPlans(updatedPlans);
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updatedPlans));
  };

  const updateMealPlan = (planId: string, updates: Partial<MealPlan>) => {
    const updatedPlans = mealPlans.map(plan =>
      plan.id === planId ? { ...plan, ...updates } : plan
    );
    setMealPlans(updatedPlans);
    localStorage.setItem(MEAL_PLANS_KEY, JSON.stringify(updatedPlans));
  };

  const getMealPlansForDate = (date: string): MealPlan[] => {
    return mealPlans.filter(plan => plan.date === date);
  };

  // Grocery List Functions
  const addGroceryList = (list: Omit<GroceryList, 'id' | 'createdAt'>) => {
    const newList: GroceryList = {
      ...list,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    const updatedLists = [...groceryLists, newList];
    setGroceryLists(updatedLists);
    localStorage.setItem(GROCERY_LISTS_KEY, JSON.stringify(updatedLists));
  };

  const removeGroceryList = (listId: string) => {
    const updatedLists = groceryLists.filter(list => list.id !== listId);
    setGroceryLists(updatedLists);
    localStorage.setItem(GROCERY_LISTS_KEY, JSON.stringify(updatedLists));
  };

  const updateGroceryList = (listId: string, updates: Partial<GroceryList>) => {
    const updatedLists = groceryLists.map(list =>
      list.id === listId ? { ...list, ...updates } : list
    );
    setGroceryLists(updatedLists);
    localStorage.setItem(GROCERY_LISTS_KEY, JSON.stringify(updatedLists));
  };

  const generateGroceryListForRecipe = (recipeId: string, date?: string): GroceryList => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) throw new Error('Recipe not found');

    const availability = canMakeRecipe(recipe, pantryItems);
    const groceryItems = generateGroceryList(
      availability.missingIngredients,
      availability.insufficientIngredients,
      recipe.name
    );

    const newList: GroceryList = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: `Shopping for ${recipe.name}`,
      items: groceryItems,
      createdAt: new Date().toISOString(),
      isCompleted: false,
      forDate: date,
    };

    const updatedLists = [...groceryLists, newList];
    setGroceryLists(updatedLists);
    localStorage.setItem(GROCERY_LISTS_KEY, JSON.stringify(updatedLists));

    return newList;
  };

  const checkRecipeAvailability = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return { canMake: false, missingIngredients: [], insufficientIngredients: [] };

    return canMakeRecipe(recipe, pantryItems);
  };

  return (
    <FoodTrackingContext.Provider value={{
      // Nutrition data
      todaysNutrition,
      nutritionGoals,

      // Meal actions
      addMeal,
      removeMeal,
      updateMeal,
      updateNutritionGoals,

      // Pantry management
      pantryItems,
      addPantryItem,
      removePantryItem,
      updatePantryItem,
      getPantryStats,

      // Recipe management
      recipes,
      addRecipe,
      removeRecipe,
      updateRecipe,
      toggleRecipeFavorite,

      // Meal planning
      mealPlans,
      addMealPlan,
      removeMealPlan,
      updateMealPlan,
      getMealPlansForDate,

      // Grocery lists
      groceryLists,
      addGroceryList,
      removeGroceryList,
      updateGroceryList,
      generateGroceryListForRecipe,

      // Recipe checking
      checkRecipeAvailability,

      // Helpers
      getMacroPercentagesForToday,
      getCaloriesRemaining,
      getDailyNutrition,

      // AI analysis
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
