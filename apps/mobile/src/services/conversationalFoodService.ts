// Minimal mobile wrapper for conversational food service.
// It delegates to the same logic used by web when possible (via REST endpoint) or falls back.

const API_BASE = process.env.EXPO_PUBLIC_API_BASE || '';

export async function startFoodConversation(input: string, goal: string) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/conversation/start`, { method: 'POST', body: JSON.stringify({ input, goal }), headers: { 'Content-Type': 'application/json' } });
    return res.json();
  }

  // fallback simple response
  return {
    status: 'ready_to_analyze',
    messages: [ { id: '1', role: 'assistant', content: `Estimating nutrition for ${input}` } ],
    extractedInfo: { foodName: input }
  };
}

export async function continueConversation(conversation: any, userInput: string, goal: string) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/conversation/continue`, { method: 'POST', body: JSON.stringify({ conversation, userInput, goal }), headers: { 'Content-Type': 'application/json' } });
    return res.json();
  }

  return { ...conversation, messages: [...conversation.messages, { id: String(Date.now()), role: 'user', content: userInput }], status: 'ready_to_analyze' };
}

export async function generateFinalAnalysis(conversation: any, goal: string) {
  if (API_BASE) {
    const res = await fetch(`${API_BASE}/api/conversation/analyze`, { method: 'POST', body: JSON.stringify({ conversation, goal }), headers: { 'Content-Type': 'application/json' } });
    return res.json();
  }

  // Fallback: return estimated simple item
  return {
    id: String(Date.now()),
    name: conversation.extractedInfo?.foodName || 'Unknown',
    calories: 400,
    macros: { protein: 20, carbs: 40, fat: 15 },
    servingSize: '1 serving',
    createdAt: new Date().toISOString()
  };
}
