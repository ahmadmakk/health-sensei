import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodItem, AIFoodAnalysis } from '@/types/food';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('Google API key not found. Please set VITE_GOOGLE_API_KEY environment variable.');
} else {
  console.log('Google API key found, length:', API_KEY.length);
}

const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

interface FoodAnalysisResult {
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence: number;
}

export class FoodAnalysisService {
  private model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

  async analyzeFood(
    imageData: string,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): Promise<FoodItem> {
    // Check if API is available
    if (!this.model || !API_KEY) {
      console.warn('Google API not available, using fallback');
      return this.getFallbackFood(goal);
    }

    try {
      console.log('Starting photo analysis...');

      // Convert base64 image data to the format Gemini expects
      const base64Data = imageData.split(',')[1];

      const prompt = `
        Analyze this food image and provide a detailed nutritional breakdown.

        Please identify:
        1. The main food item(s) in the image
        2. Estimate the portion size/serving
        3. Calculate approximate nutritional values

        ${this.getGoalSpecificPrompt(goal)}

        Return your analysis in this exact JSON format:
        {
          "name": "Food name",
          "calories": number,
          "protein": number (grams),
          "carbs": number (grams),
          "fat": number (grams),
          "servingSize": "description of portion",
          "confidence": number (0-100)
        }

        Be conservative with estimates and realistic about portion sizes.
        If you can't clearly identify the food, return confidence below 50.
      `;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: 'image/jpeg',
        },
      };

      // Add timeout to photo analysis as well
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Photo analysis timeout')), 15000)
      );

      const requestPromise = this.model.generateContent([prompt, imagePart]);

      const result = await Promise.race([requestPromise, timeoutPromise]) as any;
      const response = result.response;
      const text = response.text();

      console.log('Photo analysis response received');

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response - no JSON found');
      }

      const analysis: FoodAnalysisResult = JSON.parse(jsonMatch[0]);

      // Validate the analysis
      if (!analysis.name || typeof analysis.calories !== 'number') {
        throw new Error('Invalid AI response format');
      }

      // Apply goal-based calorie adjustments
      const adjustedCalories = this.applyGoalAdjustment(analysis.calories, goal);

      // Convert to FoodItem format
      const foodItem: FoodItem = {
        id: Date.now().toString(),
        name: analysis.name,
        calories: adjustedCalories,
        macros: {
          protein: analysis.protein || 0,
          carbs: analysis.carbs || 0,
          fat: analysis.fat || 0,
        },
        servingSize: analysis.servingSize || '1 serving',
        isCustom: true,
        createdAt: new Date().toISOString(),
      };

      console.log('Successfully analyzed photo:', foodItem.name);
      return foodItem;

    } catch (error: any) {
      console.error('Photo analysis failed:', error);

      // Provide more specific error messaging
      if (error.message?.includes('Failed to fetch')) {
        console.error('Network error during photo analysis - check internet connection');
      } else if (error.message?.includes('timeout')) {
        console.error('Photo analysis timed out - image might be too large or API is slow');
      }

      // Enhanced fallback with error context
      const fallbackFood = this.getFallbackFood(goal);
      fallbackFood.name = `${fallbackFood.name} (Analysis Failed)`;

      return fallbackFood;
    }
  }

  async searchFood(
    foodDescription: string,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): Promise<FoodItem> {
    // Check if API is available
    if (!this.model || !API_KEY) {
      console.warn('Google API not available, using fallback');
      return this.getFallbackFoodFromText(foodDescription, goal);
    }

    // Retry logic for network issues
    const maxRetries = 2;
    let lastError: any;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting food search (attempt ${attempt}/${maxRetries}) for: "${foodDescription}"`);

        const prompt = `
          Analyze the food described as: "${foodDescription}"

          Please provide detailed nutritional information for a typical serving of this food.

          Consider:
          1. Standard serving size for this food item
          2. Typical preparation method (if not specified, assume most common)
          3. Accurate calorie and macro estimates

          ${this.getGoalSpecificPrompt(goal)}

          Return your analysis in this exact JSON format:
          {
            "name": "Properly formatted food name",
            "calories": number,
            "protein": number (grams),
            "carbs": number (grams),
            "fat": number (grams),
            "servingSize": "standard serving description",
            "confidence": number (0-100)
          }

          Examples:
          - "hamburger" → "Hamburger with Bun", calories for 1 medium burger
          - "chicken" → "Grilled Chicken Breast", calories for 4oz serving
          - "apple" → "Medium Apple", calories for 1 medium apple

          Be realistic about portion sizes and accurate with nutritional data.
          If the description is too vague, make reasonable assumptions and note lower confidence.
        `;

        // Add timeout to the request
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timeout')), 10000)
        );

        const requestPromise = this.model.generateContent(prompt);

        const result = await Promise.race([requestPromise, timeoutPromise]) as any;
        const response = result.response;
        const text = response.text();

        console.log('AI Response received:', text.substring(0, 200) + '...');

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('Could not parse AI response - no JSON found');
        }

        const analysis: FoodAnalysisResult = JSON.parse(jsonMatch[0]);

        // Validate the analysis
        if (!analysis.name || typeof analysis.calories !== 'number') {
          throw new Error('Invalid AI response format');
        }

        // Apply goal-based calorie adjustments
        const adjustedCalories = this.applyGoalAdjustment(analysis.calories, goal);

        // Convert to FoodItem format
        const foodItem: FoodItem = {
          id: Date.now().toString(),
          name: analysis.name,
          calories: adjustedCalories,
          macros: {
            protein: analysis.protein || 0,
            carbs: analysis.carbs || 0,
            fat: analysis.fat || 0,
          },
          servingSize: analysis.servingSize || '1 serving',
          isCustom: true,
          createdAt: new Date().toISOString(),
        };

        console.log('Successfully analyzed food:', foodItem.name);
        return foodItem;

      } catch (error: any) {
        lastError = error;
        console.error(`Food search attempt ${attempt} failed:`, error);

        // Check for specific error types
        if (error.message?.includes('Failed to fetch')) {
          console.error('Network error detected - check internet connection and API access');
        } else if (error.message?.includes('API_KEY')) {
          console.error('API key error detected');
          break; // Don't retry API key errors
        } else if (error.message?.includes('timeout')) {
          console.error('Request timeout - API might be slow');
        }

        // Wait before retry (except on last attempt)
        if (attempt < maxRetries) {
          console.log(`Waiting 1 second before retry...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    console.error(`All ${maxRetries} attempts failed. Last error:`, lastError);
    console.log('Falling back to local food database...');

    // Enhanced fallback with error context
    const fallbackFood = this.getFallbackFoodFromText(foodDescription, goal);
    fallbackFood.name = `${fallbackFood.name} (Network Error - Estimated)`;

    return fallbackFood;
  }

  private getGoalSpecificPrompt(goal: 'lose_weight' | 'maintain' | 'gain_weight'): string {
    switch (goal) {
      case 'lose_weight':
        return `
          This user is trying to lose weight, so err on the side of higher calorie estimates.
          Be generous with portion sizes and calorie counts to help them stay in a deficit.
          Add about 10-15% to your calorie estimate.
        `;
      case 'gain_weight':
        return `
          This user is trying to gain weight, so err on the side of lower calorie estimates.
          Be conservative with portion sizes and calorie counts.
          Reduce your calorie estimate by about 10-15%.
        `;
      default:
        return `
          Provide accurate, realistic estimates for calories and macros.
          Use standard portion sizes as reference.
        `;
    }
  }

  private applyGoalAdjustment(
    baseCalories: number, 
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): number {
    switch (goal) {
      case 'lose_weight':
        return Math.round(baseCalories * 1.12); // 12% higher
      case 'gain_weight':
        return Math.round(baseCalories * 0.88); // 12% lower
      default:
        return baseCalories;
    }
  }

  private getFallbackFood(goal: 'lose_weight' | 'maintain' | 'gain_weight'): FoodItem {
    // Fallback foods if AI analysis fails
    const fallbackFoods = [
      {
        name: "Mixed Meal",
        calories: 450,
        macros: { protein: 25, carbs: 45, fat: 18 },
        servingSize: "1 portion"
      },
      {
        name: "Protein and Vegetables",
        calories: 320,
        macros: { protein: 35, carbs: 15, fat: 12 },
        servingSize: "1 serving"
      },
      {
        name: "Balanced Meal",
        calories: 520,
        macros: { protein: 28, carbs: 52, fat: 22 },
        servingSize: "1 plate"
      }
    ];

    const randomFood = fallbackFoods[Math.floor(Math.random() * fallbackFoods.length)];
    const adjustedCalories = this.applyGoalAdjustment(randomFood.calories, goal);

    return {
      id: Date.now().toString(),
      name: `${randomFood.name} (Estimated)`,
      calories: adjustedCalories,
      macros: randomFood.macros,
      servingSize: randomFood.servingSize,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
  }

  private getFallbackFoodFromText(
    foodDescription: string,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): FoodItem {
    // Basic fallback based on common food types
    const description = foodDescription.toLowerCase();
    let fallbackFood;

    if (description.includes('burger') || description.includes('hamburger')) {
      fallbackFood = { name: "Hamburger", calories: 540, macros: { protein: 25, carbs: 40, fat: 31 }, servingSize: "1 medium burger" };
    } else if (description.includes('chicken')) {
      fallbackFood = { name: "Grilled Chicken", calories: 165, macros: { protein: 31, carbs: 0, fat: 4 }, servingSize: "4oz serving" };
    } else if (description.includes('salad')) {
      fallbackFood = { name: "Garden Salad", calories: 120, macros: { protein: 8, carbs: 15, fat: 6 }, servingSize: "1 bowl" };
    } else if (description.includes('apple') || description.includes('fruit')) {
      fallbackFood = { name: "Apple", calories: 80, macros: { protein: 0, carbs: 21, fat: 0 }, servingSize: "1 medium" };
    } else if (description.includes('rice')) {
      fallbackFood = { name: "White Rice", calories: 130, macros: { protein: 3, carbs: 28, fat: 0 }, servingSize: "1/2 cup cooked" };
    } else {
      fallbackFood = { name: "Mixed Food", calories: 300, macros: { protein: 15, carbs: 35, fat: 12 }, servingSize: "1 serving" };
    }

    const adjustedCalories = this.applyGoalAdjustment(fallbackFood.calories, goal);

    return {
      id: Date.now().toString(),
      name: `${fallbackFood.name} (Estimated)`,
      calories: adjustedCalories,
      macros: fallbackFood.macros,
      servingSize: fallbackFood.servingSize,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
  }

  // Health check method to verify API connectivity
  async healthCheck(): Promise<boolean> {
    if (!this.model || !API_KEY) {
      console.warn('Google API not configured');
      return false;
    }

    try {
      console.log('Running API health check...');
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Health check timeout')), 5000)
      );

      const requestPromise = this.model.generateContent("Test connection. Reply with 'OK'.");
      const result = await Promise.race([requestPromise, timeoutPromise]) as any;

      const response = result.response.text();
      const isHealthy = response.includes('OK');
      console.log('API health check result:', isHealthy ? 'HEALTHY' : 'UNHEALTHY');
      return isHealthy;
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }

  // Test basic connectivity
  async testConnectivity(): Promise<{success: boolean; error?: string}> {
    try {
      // Test basic fetch to Google's API endpoint
      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models?key=' + API_KEY);
      if (response.ok) {
        console.log('Google API connectivity test: SUCCESS');
        return { success: true };
      } else {
        console.log('Google API connectivity test: FAILED - Status:', response.status);
        return { success: false, error: `HTTP ${response.status}` };
      }
    } catch (error: any) {
      console.log('Google API connectivity test: FAILED - Network error:', error.message);
      return { success: false, error: error.message };
    }
  }
}

// Export singleton instance
export const foodAnalysisService = new FoodAnalysisService();
