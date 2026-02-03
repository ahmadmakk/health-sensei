import create from 'zustand';
import { nanoid } from 'nanoid/non-secure';
import db from '../lib/db';

type Meal = { id: string; date: string; items: any[]; notes?: string };

type MealState = {
  mealsByDate: Record<string, Meal[]>;
  loadMeals: (date?: string) => Promise<void>;
  addMeal: (m: Omit<Meal,'id'>) => Promise<string>;
  updateMeal: (m: Meal) => Promise<void>;
  removeMeal: (id: string) => Promise<void>;
};

export const useMealsStore = create<MealState>((set, get) => ({
  mealsByDate: {},
  loadMeals: async (date) => {
    await db.initDb();
    const res: any = await db.runSql(`SELECT id, date, items, notes FROM meals ORDER BY date DESC`);
    // expo-sqlite returns rows in res.rows._array
    const rows = res.rows && res.rows._array ? res.rows._array : [];
    const grouped = rows.reduce((acc: Record<string, Meal[]>, r: any) => {
      const parsed = { ...r, items: JSON.parse(r.items) } as Meal;
      (acc[r.date] ??= []).push(parsed);
      return acc;
    }, {} as Record<string, Meal[]>);
    set({ mealsByDate: grouped });
  },
  addMeal: async (m) => {
    const id = nanoid();
    await db.runSql(`INSERT INTO meals (id,date,items,notes) VALUES (?,?,?,?)`, [id, m.date, JSON.stringify(m.items), m.notes ?? null]);
    await get().loadMeals();
    return id;
  },
  updateMeal: async (m) => {
    await db.runSql(`UPDATE meals SET date=?, items=?, notes=? WHERE id=?`, [m.date, JSON.stringify(m.items), m.notes ?? null, m.id]);
    await get().loadMeals();
  },
  removeMeal: async (id) => {
    await db.runSql(`DELETE FROM meals WHERE id=?`, [id]);
    await get().loadMeals();
  }
}));
