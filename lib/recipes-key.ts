export function buildRecipeKey(
  ingredients: string[],
  style: string,
  difficulty: string
) {
  const normalized = ingredients
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .map((item) => item.replace(/\s+/g, " "))
    .sort();

  return `${normalized.join("-")}__${style}__${difficulty}`;
}