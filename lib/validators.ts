const MAX_INGREDIENTS = 15;
const MAX_INGREDIENT_LENGTH = 40;

export function normalizeIngredients(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((item) => String(item).trim().toLowerCase())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, " "))
    .filter((item) => item.length <= MAX_INGREDIENT_LENGTH)
    .slice(0, MAX_INGREDIENTS);
}

export function normalizeStyle(raw: unknown): string {
  const allowed = ["casera", "rápida", "saludable", "económica"];
  return allowed.includes(String(raw)) ? String(raw) : "casera";
}

export function normalizeDifficulty(raw: unknown): string {
  const allowed = ["principiante", "intermedio", "avanzado"];
  return allowed.includes(String(raw)) ? String(raw) : "principiante";
}