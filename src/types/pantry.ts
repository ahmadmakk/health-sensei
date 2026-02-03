export interface PantryItem {
  id: string;
  name: string;
  category: 'protein' | 'vegetables' | 'fruits' | 'grains' | 'dairy' | 'spices' | 'condiments' | 'other';
  quantity: number;
  unit: 'grams' | 'cups' | 'pieces' | 'liters' | 'tablespoons' | 'teaspoons' | 'ounces' | 'pounds';
  expiryDate?: string;          // ISO date string
  addedDate: string;            // ISO date string
  location?: string;            // 'fridge', 'freezer', 'pantry', 'counter'
  isLowStock?: boolean;         // Auto-calculated based on quantity thresholds
}

export interface RecipeIngredient {
  name: string;
  quantity: number;
  unit: 'grams' | 'cups' | 'pieces' | 'liters' | 'tablespoons' | 'teaspoons' | 'ounces' | 'pounds';
  optional?: boolean;
  substitutes?: string[];       // Alternative ingredients
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  cuisine: string;              // 'Italian', 'Asian', 'Mexican', etc.
  difficulty: 'easy' | 'medium' | 'hard';
  prepTime: number;             // minutes
  cookTime: number;             // minutes
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags: string[];               // 'vegetarian', 'gluten-free', 'high-protein', etc.
  nutrition: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  imageUrl?: string;
  createdAt: string;
  isFavorite?: boolean;
  lastMade?: string;            // ISO date string
}

export interface MealPlan {
  id: string;
  date: string;                 // YYYY-MM-DD format
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  recipeId: string;
  servings: number;             // How many servings to make
  status: 'planned' | 'shopping' | 'prepared' | 'completed';
  notes?: string;
}

export interface GroceryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  isChecked: boolean;
  estimatedPrice?: number;
  fromRecipe?: string;          // Recipe name that requires this item
  priority: 'low' | 'medium' | 'high';
}

export interface GroceryList {
  id: string;
  name: string;
  items: GroceryItem[];
  createdAt: string;
  isCompleted: boolean;
  totalEstimatedCost?: number;
  forDate?: string;             // If grocery list is for specific meal plan date
}

export interface PantryStats {
  totalItems: number;
  expiringWithin3Days: number;
  lowStockItems: number;
  categoryCounts: Record<string, number>;
}

// Helper function to check if pantry can fulfill recipe
export function canMakeRecipe(recipe: Recipe, pantryItems: PantryItem[]): {
  canMake: boolean;
  missingIngredients: RecipeIngredient[];
  insufficientIngredients: { ingredient: RecipeIngredient; available: number; needed: number }[];
} {
  const missingIngredients: RecipeIngredient[] = [];
  const insufficientIngredients: { ingredient: RecipeIngredient; available: number; needed: number }[] = [];

  for (const ingredient of recipe.ingredients) {
    if (ingredient.optional) continue; // Skip optional ingredients

    const pantryItem = pantryItems.find(item => 
      item.name.toLowerCase().includes(ingredient.name.toLowerCase()) ||
      ingredient.name.toLowerCase().includes(item.name.toLowerCase())
    );

    if (!pantryItem) {
      missingIngredients.push(ingredient);
    } else {
      // Convert units and check if sufficient quantity
      const availableQuantity = convertToCommonUnit(pantryItem.quantity, pantryItem.unit);
      const neededQuantity = convertToCommonUnit(ingredient.quantity, ingredient.unit);
      
      if (availableQuantity < neededQuantity) {
        insufficientIngredients.push({
          ingredient,
          available: pantryItem.quantity,
          needed: ingredient.quantity
        });
      }
    }
  }

  return {
    canMake: missingIngredients.length === 0 && insufficientIngredients.length === 0,
    missingIngredients,
    insufficientIngredients
  };
}

// Helper function to generate grocery list from missing ingredients
export function generateGroceryList(
  missingIngredients: RecipeIngredient[],
  insufficientIngredients: { ingredient: RecipeIngredient; available: number; needed: number }[],
  recipeName: string
): GroceryItem[] {
  const groceryItems: GroceryItem[] = [];

  // Add missing ingredients
  missingIngredients.forEach((ingredient, index) => {
    groceryItems.push({
      id: `missing-${index}`,
      name: ingredient.name,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      category: getCategoryFromIngredient(ingredient.name),
      isChecked: false,
      fromRecipe: recipeName,
      priority: ingredient.optional ? 'low' : 'high'
    });
  });

  // Add insufficient ingredients (need more)
  insufficientIngredients.forEach((item, index) => {
    const neededMore = item.needed - item.available;
    groceryItems.push({
      id: `insufficient-${index}`,
      name: item.ingredient.name,
      quantity: neededMore,
      unit: item.ingredient.unit,
      category: getCategoryFromIngredient(item.ingredient.name),
      isChecked: false,
      fromRecipe: recipeName,
      priority: 'medium'
    });
  });

  return groceryItems;
}

// Helper function to categorize ingredients
function getCategoryFromIngredient(ingredientName: string): string {
  const name = ingredientName.toLowerCase();
  
  if (name.includes('chicken') || name.includes('beef') || name.includes('fish') || name.includes('meat') || name.includes('protein')) {
    return 'protein';
  }
  if (name.includes('milk') || name.includes('cheese') || name.includes('yogurt') || name.includes('cream')) {
    return 'dairy';
  }
  if (name.includes('tomato') || name.includes('onion') || name.includes('pepper') || name.includes('lettuce') || name.includes('vegetable')) {
    return 'vegetables';
  }
  if (name.includes('apple') || name.includes('banana') || name.includes('berry') || name.includes('fruit')) {
    return 'fruits';
  }
  if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || name.includes('flour') || name.includes('grain')) {
    return 'grains';
  }
  if (name.includes('salt') || name.includes('pepper') || name.includes('spice') || name.includes('herb')) {
    return 'spices';
  }
  
  return 'other';
}

// Simple unit conversion helper (for basic comparisons)
function convertToCommonUnit(quantity: number, unit: string): number {
  // Convert everything to grams for comparison (simplified)
  const conversionFactors: Record<string, number> = {
    'grams': 1,
    'ounces': 28.35,
    'pounds': 453.592,
    'cups': 240, // Approximate for liquids
    'tablespoons': 15,
    'teaspoons': 5,
    'liters': 1000,
    'pieces': 100 // Arbitrary value for countable items
  };

  return quantity * (conversionFactors[unit] || 1);
}

// Helper function to check if item is expiring soon
export function isExpiringSoon(expiryDate: string, daysThreshold = 3): boolean {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays <= daysThreshold && diffDays >= 0;
}

// Helper function to check if item is low stock
export function isLowStock(item: PantryItem): boolean {
  // Define low stock thresholds based on unit type
  const thresholds: Record<string, number> = {
    'grams': 100,
    'cups': 0.5,
    'pieces': 2,
    'liters': 0.2,
    'tablespoons': 2,
    'teaspoons': 1,
    'ounces': 3,
    'pounds': 0.2
  };

  const threshold = thresholds[item.unit] || 1;
  return item.quantity <= threshold;
}
