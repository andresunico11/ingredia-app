import fs from "fs";
import path from "path";

const cacheFilePath = path.join(process.cwd(), "data", "cached-recipes.json");

export function getCachedRecipes() {
  try {
    if (!fs.existsSync(cacheFilePath)) return [];
    const file = fs.readFileSync(cacheFilePath, "utf-8");
    return JSON.parse(file);
  } catch {
    return [];
  }
}

export function findCachedRecipe(key: string) {
  const recipes = getCachedRecipes();
  return recipes.find((item: any) => item.key === key) || null;
}

export function saveCachedRecipe(key: string, recipe: any) {
  const recipes = getCachedRecipes();

  const existingIndex = recipes.findIndex((item: any) => item.key === key);

  if (existingIndex >= 0) {
    recipes[existingIndex] = { key, recipe };
  } else {
    recipes.push({ key, recipe });
  }

  fs.writeFileSync(cacheFilePath, JSON.stringify(recipes, null, 2), "utf-8");
}