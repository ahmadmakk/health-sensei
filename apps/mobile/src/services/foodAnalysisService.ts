const API_BASE = process.env.EXPO_PUBLIC_API_BASE || '';

function fallbackEstimateFromDescription(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes('burger') || lower.includes('whopper') || lower.includes('big mac')) {
    return { name: text, calories: 550, macros: { protein: 25, carbs: 45, fat: 32 }, servingSize: '1 serving' };
  }
  if (lower.includes('chicken')) {
    return { name: text, calories: 250, macros: { protein: 30, carbs: 0, fat: 12 }, servingSize: '1 serving' };
  }
  // generic
  return { name: text, calories: 375, macros: { protein: 20, carbs: 40, fat: 15 }, servingSize: '1 serving' };
}

export async function analyzeImage(imageBase64: string, goal: 'lose_weight' | 'maintain' | 'gain_weight' = 'maintain') {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/food/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, goal }),
      });
      if (!res.ok) throw new Error('Analysis failed');
      const json = await res.json();
      return json; // expect food item
    } catch (e) {
      console.warn('Remote analysis failed', e);
      // continue to fallback
    }
  }

  // Simple local fallback (not accurate)
  return {
    id: String(Date.now()),
    name: 'Photo (estimated)',
    calories: 400,
    macros: { protein: 20, carbs: 40, fat: 15 },
    servingSize: '1 serving',
    createdAt: new Date().toISOString(),
  };
}

export async function analyzeText(text: string, goal: 'lose_weight' | 'maintain' | 'gain_weight' = 'maintain') {
  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/api/food/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, goal }),
      });
      if (!res.ok) throw new Error('Search failed');
      const json = await res.json();
      return json;
    } catch (e) {
      console.warn('Remote text analysis failed', e);
    }
  }

  // fallback estimate
  const est = fallbackEstimateFromDescription(text);
  return {
    id: String(Date.now()),
    name: est.name,
    calories: est.calories,
    macros: est.macros,
    servingSize: est.servingSize,
    createdAt: new Date().toISOString(),
  };
}

export default { analyzeImage, analyzeText };
