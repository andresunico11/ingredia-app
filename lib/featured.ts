import fs from "fs";
import path from "path";

const featuredFilePath = path.join(process.cwd(), "data", "featured-recipes.json");

export function getFeaturedRecipes() {
  try {
    if (!fs.existsSync(featuredFilePath)) return [];
    const file = fs.readFileSync(featuredFilePath, "utf-8");
    return JSON.parse(file);
  } catch {
    return [];
  }
}

export function getDailyChefSuggestion() {
  const recipes = getFeaturedRecipes();
  if (!recipes.length) return null;

  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);

  const index = dayOfYear % recipes.length;

  return recipes[index];
}