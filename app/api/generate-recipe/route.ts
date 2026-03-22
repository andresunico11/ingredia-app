import { NextResponse } from "next/server";
import { openai } from "@/lib/openai";
import {
  normalizeDifficulty,
  normalizeIngredients,
  normalizeStyle,
} from "@/lib/validators";
import { buildRecipeKey } from "@/lib/recipe-key";
import { findCachedRecipe, saveCachedRecipe } from "@/lib/local-cache";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const ingredients = normalizeIngredients(body.ingredients);
    const style = normalizeStyle(body.style);
    const difficulty = normalizeDifficulty(body.difficulty);

    if (!ingredients.length) {
      return NextResponse.json(
        { error: "Ingresá al menos un ingrediente válido." },
        { status: 400 }
      );
    }

    const recipeKey = buildRecipeKey(ingredients, style, difficulty);

    const cached = findCachedRecipe(recipeKey);
    if (cached) {
      return NextResponse.json({
        ...cached.recipe,
        source: "cache",
      });
    }

    const prompt = `
Actúa como un chef profesional especializado en cocina práctica y creativa.

Tu tarea es generar una receta utilizando EXCLUSIVAMENTE los ingredientes que el usuario te proporcione.

Ingredientes disponibles: ${ingredients.join(", ")}
Estilo de cocina: ${style}
Nivel de dificultad: ${difficulty}

Reglas estrictas:
- No puedes agregar ingredientes adicionales.
- Solo puedes sugerir opcionalmente: sal, pimienta, aceite o agua.
- No debes incluir ningún ingrediente fuera de la lista dada.
- Debes adaptarte completamente a lo disponible.
- La receta debe ser realista, clara y ejecutable.
- El paso a paso debe ser detallado, no breve.

Debes devolver la respuesta en JSON válido con esta estructura exacta:

{
  "title": "nombre del plato",
  "time_minutes": número,
  "ingredients": ["ingrediente 1", "ingrediente 2"],
  "optional": ["sal", "pimienta", "aceite", "agua"],
  "steps": ["paso 1", "paso 2", "paso 3"],
  "final_tip": "consejo final"
}
`;

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
    });

    const text = response.output_text;

    let jsonString = text;
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");

    if (start !== -1 && end !== -1 && end > start) {
      jsonString = text.substring(start, end + 1);
    }

    let recipe;

    try {
      recipe = JSON.parse(jsonString);
    } catch {
      console.error("Respuesta cruda del modelo:", text);
      return NextResponse.json(
        { error: "La IA devolvió una respuesta inválida. Probá nuevamente." },
        { status: 500 }
      );
    }

    if (
      !recipe.title ||
      !recipe.time_minutes ||
      !Array.isArray(recipe.ingredients) ||
      !Array.isArray(recipe.optional) ||
      !Array.isArray(recipe.steps) ||
      !recipe.final_tip
    ) {
      return NextResponse.json(
        { error: "La receta generada no tiene el formato esperado." },
        { status: 500 }
      );
    }

    saveCachedRecipe(recipeKey, recipe);

    return NextResponse.json({
      ...recipe,
      source: "ai",
    });
  } catch (error) {
    console.error("Error generando receta:", error);
    return NextResponse.json(
      { error: "No se pudo generar la receta." },
      { status: 500 }
    );
  }
}
