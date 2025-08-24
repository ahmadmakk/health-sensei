export interface MacroNutrients {
  protein: number;    // grams
  carbs: number;      // grams
  fat: number;        // grams
  fiber?: number;     // grams (optional)
  sugar?: number;     // grams (optional)
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;           // per serving
  macros: MacroNutrients;
  servingSize: string;        // e.g., "1 cup", "100g", "1 medium"
  servingWeight?: number;     // grams (for calculations)
  brand?: string;
  barcode?: string;
  isCustom: boolean;          // user-created vs database food
  createdAt: string;
}

export interface MealEntry {
  id: string;
  foodItem: FoodItem;
  quantity: number;           // serving multiplier (e.g., 1.5 for 1.5 servings)
  timestamp: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  notes?: string;
  imageUrl?: string;          // for photo-logged meals
  source: 'manual' | 'photo' | 'barcode' | 'search';
}

export interface DailyNutrition {
  date: string;               // YYYY-MM-DD format
  meals: MealEntry[];
  totalCalories: number;
  totalMacros: MacroNutrients;
  waterIntake: number;        // glasses/liters
  supplementsTaken: string[];
}

export interface NutritionGoals {
  targetCalories: number;
  targetMacros: MacroNutrients;
  goal: 'lose_weight' | 'maintain' | 'gain_weight';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';
}

export interface AIFoodAnalysis {
  confidence: number;         // 0-100
  detectedFoods: {
    name: string;
    confidence: number;
    estimatedPortion: string;
  }[];
  totalCalories: number;
  macros: MacroNutrients;
  adjustmentNote?: string;    // based on weight goal
}

// Helper function to calculate total nutrition from meals
export function calculateDailyNutrition(meals: MealEntry[]): { calories: number; macros: MacroNutrients } {
  const totals = meals.reduce(
    (acc, meal) => {
      const mealCalories = meal.foodItem.calories * meal.quantity;
      const mealMacros = {
        protein: meal.foodItem.macros.protein * meal.quantity,
        carbs: meal.foodItem.macros.carbs * meal.quantity,
        fat: meal.foodItem.macros.fat * meal.quantity,
        fiber: (meal.foodItem.macros.fiber || 0) * meal.quantity,
        sugar: (meal.foodItem.macros.sugar || 0) * meal.quantity,
      };

      return {
        calories: acc.calories + mealCalories,
        macros: {
          protein: acc.macros.protein + mealMacros.protein,
          carbs: acc.macros.carbs + mealMacros.carbs,
          fat: acc.macros.fat + mealMacros.fat,
          fiber: acc.macros.fiber! + mealMacros.fiber,
          sugar: acc.macros.sugar! + mealMacros.sugar,
        },
      };
    },
    {
      calories: 0,
      macros: { protein: 0, carbs: 0, fat: 0, fiber: 0, sugar: 0 },
    }
  );

  return totals;
}

// Helper function to get macro percentages
export function getMacroPercentages(macros: MacroNutrients, totalCalories: number) {
  if (totalCalories === 0) return { protein: 0, carbs: 0, fat: 0 };
  
  const proteinCals = macros.protein * 4;
  const carbsCals = macros.carbs * 4;
  const fatCals = macros.fat * 9;
  
  return {
    protein: (proteinCals / totalCalories) * 100,
    carbs: (carbsCals / totalCalories) * 100,
    fat: (fatCals / totalCalories) * 100,
  };
}
