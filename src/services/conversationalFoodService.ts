import { GoogleGenerativeAI } from '@google/generative-ai';
import { FoodItem } from '@/types/food';

// Initialize Gemini AI
const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = API_KEY ? new GoogleGenerativeAI(API_KEY) : null;

export interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ConversationState {
  id: string;
  messages: ConversationMessage[];
  status: 'collecting_info' | 'ready_to_analyze' | 'completed' | 'error';
  extractedInfo: {
    foodName?: string;
    portion?: string;
    weight?: string;
    preparationMethod?: string;
    brand?: string;
    additionalDetails?: string;
    estimatedNutrition?: any;
  };
}

export class ConversationalFoodService {
  private model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

  async startFoodConversation(
    initialInput: string,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): Promise<ConversationState> {
    const conversationId = Date.now().toString();
    
    const conversation: ConversationState = {
      id: conversationId,
      messages: [{
        id: `${conversationId}_1`,
        role: 'user',
        content: initialInput,
        timestamp: new Date()
      }],
      status: 'collecting_info',
      extractedInfo: {}
    };

    // Analyze the initial input to determine what additional info we need
    const response = await this.analyzeInputAndAskFollowUp(initialInput, goal);
    
    conversation.messages.push({
      id: `${conversationId}_2`,
      role: 'assistant',
      content: response.message,
      timestamp: new Date()
    });

    // Update extracted info and status based on AI analysis
    conversation.extractedInfo = { ...conversation.extractedInfo, ...response.extractedInfo };
    conversation.status = response.hasEnoughInfo ? 'ready_to_analyze' : 'collecting_info';

    return conversation;
  }

  async continueConversation(
    conversation: ConversationState,
    userResponse: string,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): Promise<ConversationState> {
    // Add user response to conversation
    conversation.messages.push({
      id: `${conversation.id}_${conversation.messages.length + 1}`,
      role: 'user',
      content: userResponse,
      timestamp: new Date()
    });

    if (conversation.status === 'collecting_info') {
      // Continue gathering information
      const response = await this.processFollowUpResponse(
        conversation.messages,
        conversation.extractedInfo,
        goal
      );

      conversation.messages.push({
        id: `${conversation.id}_${conversation.messages.length + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date()
      });

      // Update extracted info and status
      conversation.extractedInfo = { ...conversation.extractedInfo, ...response.extractedInfo };
      conversation.status = response.hasEnoughInfo ? 'ready_to_analyze' : 'collecting_info';
    }

    return conversation;
  }

  async generateFinalAnalysis(
    conversation: ConversationState,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): Promise<FoodItem> {
    if (!this.model || !API_KEY) {
      console.warn('Google API not available, using fallback');
      return this.getFallbackFromConversation(conversation, goal);
    }

    try {
      // Compile all the information gathered
      const allInfo = {
        foodName: conversation.extractedInfo.foodName || 'Unknown food',
        portion: conversation.extractedInfo.portion || 'standard serving',
        weight: conversation.extractedInfo.weight || '',
        preparationMethod: conversation.extractedInfo.preparationMethod || '',
        brand: conversation.extractedInfo.brand || '',
        additionalDetails: conversation.extractedInfo.additionalDetails || ''
      };

      const conversationHistory = conversation.messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `
        Based on this conversation about food logging, provide a complete nutritional analysis.

        Conversation:
        ${conversationHistory}

        Extracted Information:
        - Food: ${allInfo.foodName}
        - Portion: ${allInfo.portion}
        - Weight: ${allInfo.weight}
        - Preparation: ${allInfo.preparationMethod}
        - Brand: ${allInfo.brand}
        - Additional: ${allInfo.additionalDetails}

        ${this.getGoalSpecificPrompt(goal)}

        Provide a precise nutritional analysis in this exact JSON format:
        {
          "name": "Complete food name with details",
          "calories": number,
          "protein": number (grams),
          "carbs": number (grams),
          "fat": number (grams),
          "servingSize": "detailed serving description",
          "confidence": number (90-100, since we have detailed info)
        }

        Use all the specific details provided (weight, brand, preparation method) to give the most accurate possible estimate.
      `;

      const result = await this.model.generateContent(prompt);
      const response = result.response;
      const text = response.text();

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not parse AI response - no JSON found');
      }

      const analysis = JSON.parse(jsonMatch[0]);

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

      return foodItem;

    } catch (error: any) {
      console.error('Final analysis failed:', error);
      return this.getFallbackFromConversation(conversation, goal);
    }
  }

  private async analyzeInputAndAskFollowUp(
    input: string,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): Promise<{
    message: string;
    extractedInfo: Partial<ConversationState['extractedInfo']>;
    hasEnoughInfo: boolean;
  }> {
    // First, try a local parse to detect weights/portions in the initial input so we
    // don't ask for clarification when the user already provided usable info.
    try {
      const weightMatch = input.match(/(\d+(?:\.\d+)?)\s*(g|gram|grams|kg|kilogram|oz|ounce|lb|lbs)/i);
      const portionMatch = input.match(/(\d+(?:\.\d+)?)\s*(cup|cups|slice|slices|piece|pieces|serving|servings|tbsp|tsp)/i);
      const sizeMatch = input.match(/\b(small|medium|large|extra large|xl|sm|lg)\b/i);

      let foodName = input.replace(/(\d+(?:\.\d+)?\s*(g|gram|grams|kg|kilogram|oz|ounce|lb|lbs|cup|cups|slice|slices|piece|pieces|serving|servings|tbsp|tsp))/gi, '').trim();
      if (!foodName) foodName = input.trim();

      const extracted: Partial<ConversationState['extractedInfo']> = {
        foodName: foodName || undefined,
        portion: portionMatch ? portionMatch[0] : (sizeMatch ? sizeMatch[0] : undefined),
        weight: weightMatch ? weightMatch[0] : undefined,
      };

      const hasEnoughLocal = !!(extracted.foodName && (extracted.weight || extracted.portion));
      if (hasEnoughLocal) {
        return {
          message: "Thanks — I have enough info. Let me calculate the nutrition for you.",
          extractedInfo: extracted,
          hasEnoughInfo: true,
        };
      }
    } catch (e) {
      // ignore parsing errors and fall through to model-based analysis
      console.warn('Local input parse failed:', e);
    }

    // Check for common branded items that can be resolved to a standard serving
    const brandedLookup: { pattern: RegExp; estimate: { name: string; calories: number; protein: number; carbs: number; fat: number; servingSize: string } }[] = [
      {
        pattern: /\bbig\s*mac\b/i,
        estimate: { name: 'Big Mac', calories: 563, protein: 25, carbs: 46, fat: 33, servingSize: '1 burger' }
      },
      {
        pattern: /\bwhopper\b/i,
        estimate: { name: 'Whopper (Burger King)', calories: 657, protein: 28, carbs: 49, fat: 40, servingSize: '1 burger' }
      },
      {
        pattern: /kfc\s*(?:9|nine)\s*(?:piece|pc|pcs)\s*bucket|9-?piece\s*kfc\s*bucket/i,
        estimate: { name: 'KFC 9-piece Bucket', calories: 2700, protein: 150, carbs: 120, fat: 180, servingSize: '9 pieces (bucket)' }
      },
      // Add more branded items here as needed
    ];

    const brandMatch = brandedLookup.find(b => b.pattern.test(input));
    if (brandMatch) {
      // If we have the model available, ask it to return a precise JSON for this branded item,
      // otherwise use the local estimate.
      if (this.model && API_KEY) {
        try {
          const prompt = `Provide a nutritional estimate for "${brandMatch.estimate.name}" in the exact JSON format:
{
  "name": "Complete food name with details",
  "calories": number,
  "protein": number,
  "carbs": number,
  "fat": number,
  "servingSize": "detailed serving description",
  "confidence": number (0-100)
}`;

          const result = await this.model.generateContent(prompt);
          const text = result.response.text();
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const analysis = JSON.parse(jsonMatch[0]);
            return {
              message: `I found a match and estimated ${analysis.calories} cal (${analysis.protein}P/${analysis.carbs}C/${analysis.fat}F) for ${analysis.name}. Using this estimate.`,
              extractedInfo: { foodName: analysis.name, portion: analysis.servingSize, estimatedNutrition: analysis, additionalDetails: `confidence:${analysis.confidence}` },
              hasEnoughInfo: true,
            };
          }
        } catch (e) {
          console.warn('Branded model lookup failed, falling back to local estimate', e);
        }
      }

      // Local fallback
      const est = brandMatch.estimate;
      return {
        message: `I found a ${est.name} and estimate ${est.calories} cal (${est.protein}P/${est.carbs}C/${est.fat}F). Using this estimate.`,
        extractedInfo: { foodName: est.name, portion: est.servingSize, estimatedNutrition: est, additionalDetails: 'branded_local_estimate' },
        hasEnoughInfo: true,
      };
    }

    if (!this.model || !API_KEY) {
      return {
        message: "I'd like to help you log that food! Can you tell me more about the portion size or weight?",
        extractedInfo: { foodName: input },
        hasEnoughInfo: false
      };
    }

    try {
      const prompt = `
        Analyze this food input: "${input}"

        Determine:
        1. What food item is being described
        2. What information is missing for accurate nutrition calculation
        3. Whether you (the model) have enough information to estimate nutrition now.

        If you have enough info, return hasEnoughInfo: true and include an "estimatedNutrition" object with keys: name, calories, protein, carbs, fat, servingSize, confidence.
        If you need more info, return hasEnoughInfo: false, list missingInfo, and provide a single concise nextQuestion to ask the user.

        Missing information could include:
        - Portion size (small, medium, large, cups, pieces)
        - Weight (grams, ounces)
        - Preparation method (grilled, fried, baked, raw)
        - Brand (if applicable)
        - Additional ingredients or modifications

        Respond in this JSON format (ONLY JSON):
        {
          "foodName": "identified food name",
          "missingInfo": ["list", "of", "missing", "info"],
          "nextQuestion": "specific question to ask the user for clarity",
          "hasEnoughInfo": boolean,
          "estimatedNutrition": { "name": string, "calories": number, "protein": number, "carbs": number, "fat": number, "servingSize": string, "confidence": number }
        }

        Examples:
        - "hamburger" → ask about size, toppings, brand
        - "100g chicken breast" → might have enough info and return estimatedNutrition
        - "apple" → ask about size (small/medium/large)
        - "pasta" → ask about portion, sauce, preparation

        Be concise and either ask one question or return the estimatedNutrition.
      `;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          message: "I'd like to help you log that food! Can you tell me more about the portion size?",
          extractedInfo: { foodName: input },
          hasEnoughInfo: false
        };
      }

      const analysis = JSON.parse(jsonMatch[0]);

      // If model provided estimatedNutrition, pass it through in extractedInfo so final analysis can use it directly
      const extracted: Partial<ConversationState['extractedInfo']> = { foodName: analysis.foodName || input };
      if (analysis.estimatedNutrition) {
        extracted.estimatedNutrition = analysis.estimatedNutrition;
      }

      return {
        message: analysis.hasEnoughInfo ? (analysis.estimatedNutrition ? `Got it — using estimate of ${analysis.estimatedNutrition.calories} cal for ${analysis.estimatedNutrition.name}` : (analysis.nextQuestion || "Thanks — I have enough info.")) : (analysis.nextQuestion || "Can you provide more details about the portion size?"),
        extractedInfo: extracted,
        hasEnoughInfo: analysis.hasEnoughInfo || false
      };

    } catch (error) {
      console.error('Input analysis failed:', error);
      return {
        message: "I'd like to help you log that food! Can you tell me more about the portion size or weight?",
        extractedInfo: { foodName: input },
        hasEnoughInfo: false
      };
    }
  }

  private async processFollowUpResponse(
    messages: ConversationMessage[],
    currentInfo: ConversationState['extractedInfo'],
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): Promise<{
    message: string;
    extractedInfo: Partial<ConversationState['extractedInfo']>;
    hasEnoughInfo: boolean;
  }> {
    if (!this.model || !API_KEY) {
      return {
        message: "Thanks! I think I have enough information now. Let me calculate the nutrition for you.",
        extractedInfo: {},
        hasEnoughInfo: true
      };
    }

    try {
      const conversationHistory = messages
        .map(msg => `${msg.role}: ${msg.content}`)
        .join('\n');

      const prompt = `
        Continue this food logging conversation to gather precise nutrition information.

        Conversation so far:
        ${conversationHistory}

        Current extracted info:
        ${JSON.stringify(currentInfo)}

        Based on the user's latest response, update the extracted information and determine if you need more details.

        Respond in this JSON format:
        {
          "updatedInfo": {
            "foodName": "updated food name if needed",
            "portion": "portion info if provided",
            "weight": "weight info if provided", 
            "preparationMethod": "preparation if mentioned",
            "brand": "brand if mentioned",
            "additionalDetails": "any other relevant details"
          },
          "nextQuestion": "next question if more info needed, or confirmation message",
          "hasEnoughInfo": boolean (true if you have food name + portion/weight info)
        }

        Guidelines:
        - You need at least food name + portion size/weight for accurate calculation
        - If user provides weight (grams, oz), that's usually enough
        - If user provides portion descriptors (small, medium, large, 1 cup, 2 pieces), that can be enough
        - Ask for clarification if their answer was vague
        - Be encouraging and specific in follow-up questions
        - Once you have enough info, confirm what you understood and say you'll calculate nutrition

        Examples of sufficient info:
        - "chicken breast, 150g, grilled"
        - "medium apple"
        - "1 cup cooked rice"
        - "large hamburger with fries"
      `;

      const result = await this.model.generateContent(prompt);
      const text = result.response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        return {
          message: "Thanks! Let me calculate the nutrition based on what you've told me.",
          extractedInfo: {},
          hasEnoughInfo: true
        };
      }

      const analysis = JSON.parse(jsonMatch[0]);

      return {
        message: analysis.nextQuestion || "Perfect! Let me calculate the nutrition for you.",
        extractedInfo: analysis.updatedInfo || {},
        hasEnoughInfo: analysis.hasEnoughInfo || false
      };

    } catch (error) {
      console.error('Follow-up processing failed:', error);
      return {
        message: "Thanks! I think I have enough information now. Let me calculate the nutrition for you.",
        extractedInfo: {},
        hasEnoughInfo: true
      };
    }
  }

  private getGoalSpecificPrompt(goal: 'lose_weight' | 'maintain' | 'gain_weight'): string {
    switch (goal) {
      case 'lose_weight':
        return 'This user is trying to lose weight, so provide slightly higher calorie estimates to help them stay in a deficit.';
      case 'gain_weight':
        return 'This user is trying to gain weight, so provide slightly lower calorie estimates.';
      default:
        return 'Provide accurate, realistic estimates for calories and macros.';
    }
  }

  private applyGoalAdjustment(
    baseCalories: number,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): number {
    switch (goal) {
      case 'lose_weight':
        return Math.round(baseCalories * 1.12);
      case 'gain_weight':
        return Math.round(baseCalories * 0.88);
      default:
        return baseCalories;
    }
  }

  private getFallbackFromConversation(
    conversation: ConversationState,
    goal: 'lose_weight' | 'maintain' | 'gain_weight'
  ): FoodItem {
    const foodName = conversation.extractedInfo.foodName || 'Food Item';
    const portion = conversation.extractedInfo.portion || '1 serving';

    // Basic calorie estimation based on food name
    let calories = 250; // default
    const foodLower = foodName.toLowerCase();

    if (foodLower.includes('salad')) calories = 150;
    else if (foodLower.includes('burger') || foodLower.includes('hamburger')) calories = 550;
    else if (foodLower.includes('chicken')) calories = 200;
    else if (foodLower.includes('fish') || foodLower.includes('salmon')) calories = 180;
    else if (foodLower.includes('pasta')) calories = 300;
    else if (foodLower.includes('rice')) calories = 130;
    else if (foodLower.includes('apple') || foodLower.includes('fruit')) calories = 80;
    else if (foodLower.includes('bread')) calories = 100;

    const adjustedCalories = this.applyGoalAdjustment(calories, goal);

    return {
      id: Date.now().toString(),
      name: `${foodName} (Estimated)`,
      calories: adjustedCalories,
      macros: {
        protein: Math.round(calories * 0.15 / 4), // 15% protein
        carbs: Math.round(calories * 0.50 / 4), // 50% carbs
        fat: Math.round(calories * 0.35 / 9), // 35% fat
      },
      servingSize: portion,
      isCustom: true,
      createdAt: new Date().toISOString(),
    };
  }
}

// Export singleton instance
export const conversationalFoodService = new ConversationalFoodService();
