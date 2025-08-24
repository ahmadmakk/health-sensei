import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodItem, AIFoodAnalysis } from '@/types/food';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;

if (!API_KEY) {
  console.error('Google API key not found. Please set VITE_GOOGLE_API_KEY environment variable.');
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

      const result = await this.model.generateContent([prompt, imagePart]);
      const response = result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response');
      }
      
      const analysis: FoodAnalysisResult = JSON.parse(jsonMatch[0]);
      
      // Apply goal-based calorie adjustments
      const adjustedCalories = this.applyGoalAdjustment(analysis.calories, goal);
      
      // Convert to FoodItem format
      const foodItem: FoodItem = {
        id: Date.now().toString(),
        name: analysis.name,
        calories: adjustedCalories,
        macros: {
          protein: analysis.protein,
          carbs: analysis.carbs,
          fat: analysis.fat,
        },
        servingSize: analysis.servingSize,
        isCustom: true,
        createdAt: new Date().toISOString(),
      };
      
      return foodItem;
      
    } catch (error) {
      console.error('Food analysis failed:', error);
      
      // Fallback to mock data if AI fails
      return this.getFallbackFood(goal);
    }
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

  // Health check method to verify API connectivity
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.model.generateContent("Test connection. Reply with 'OK'.");
      return result.response.text().includes('OK');
    } catch (error) {
      console.error('AI service health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const foodAnalysisService = new FoodAnalysisService();
