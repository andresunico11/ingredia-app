"use client";

import { useMemo, useState } from "react";

type RecipeResponse = {
  title: string;
  time_minutes: number;
  ingredients: string[];
  optional: string[];
  steps: string[];
  final_tip: string;
  source?: "cache" | "ai";
};

const exampleSets = [
  "pollo, arroz, cebolla",
  "huevo, papa, cebolla",
  "tomate, queso, pan",
  "atún, arroz, huevo",
  "carne, zanahoria, papa",
  "pepino, tomate, pollo",
];

export default function HomePage() {
  const [ingredients, setIngredients] = useState("");
  const [style, setStyle] = useState("casera");
  const [difficulty, setDifficulty] = useState("principiante");
  const [loading, setLoading] = useState(false);
  const [recipe, setRecipe] = useState<RecipeResponse | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const normalizedIngredients = useMemo(() => {
    return ingredients
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }, [ingredients]);

  async function generateRecipe() {
    setError("");
    setRecipe(null);

    if (!ingredients.trim()) {
      setError("Ingresá al menos un ingrediente.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/generate-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ingredients: ingredients.split(","),
          style,
          difficulty,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Ocurrió un error.");
      }

      setRecipe(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await generateRecipe();
  }

  async function handleRegenerate() {
    await generateRecipe();
  }

  async function handleCopyRecipe() {
    if (!recipe) return;

    const text = [
      recipe.title,
      `Tiempo total: ${recipe.time_minutes} minutos`,
      "",
      "Ingredientes:",
      ...recipe.ingredients.map((item) => `- ${item}`),
      "",
      "Opcionales permitidos:",
      ...recipe.optional.map((item) => `- ${item}`),
      "",
      "Paso a paso:",
      ...recipe.steps.map((step, index) => `${index + 1}. ${step}`),
      "",
      `Sugerencia final: ${recipe.final_tip}`,
    ].join("\n");

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("No se pudo copiar la receta.");
    }
  }

  function applyExample(example: string) {
    setIngredients(example);
    setRecipe(null);
    setError("");
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-6 md:py-14">
        <section className="mb-10">
          <div className="inline-flex rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 shadow-sm">
            IngredAI Beta
          </div>

          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
            IngredIA
          </h1>

          <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-600 md:text-lg">
            Convertí los ingredientes que tenés en una receta real con IA.
          </p>
        </section>

        <section className="mb-8">
          <div className="mb-3 text-sm font-medium text-neutral-700">
            Probá con ejemplos
          </div>

          <div className="flex flex-wrap gap-3">
            {exampleSets.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => applyExample(example)}
                className="rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-700 transition hover:border-neutral-400 hover:bg-neutral-100"
              >
                {example}
              </button>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.05fr_1fr]">
          <form
            onSubmit={handleSubmit}
            className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8"
          >
            <div className="mb-6">
              <h2 className="text-2xl font-semibold tracking-tight">
                Ingredientes disponibles
              </h2>
              <p className="mt-2 text-sm leading-6 text-neutral-600">
                Separalos con comas. La receta respetará únicamente esos
                ingredientes, con sal, pimienta, aceite o agua como opcionales.
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-neutral-700">
                  Lista de ingredientes
                </label>

                <textarea
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  placeholder="Ejemplo: pollo, arroz, cebolla"
                  className="min-h-[180px] w-full rounded-2xl border border-neutral-300 bg-white p-4 outline-none transition focus:border-neutral-400"
                />

                <div className="mt-2 text-sm text-neutral-500">
                  Ingredientes detectados: {normalizedIngredients.length}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Estilo
                  </label>
                  <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-400"
                  >
                    <option value="casera">Casera</option>
                    <option value="rápida">Rápida</option>
                    <option value="saludable">Saludable</option>
                    <option value="económica">Económica</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-neutral-700">
                    Dificultad
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-2xl border border-neutral-300 bg-white p-3 outline-none transition focus:border-neutral-400"
                  >
                    <option value="principiante">Principiante</option>
                    <option value="intermedio">Intermedio</option>
                    <option value="avanzado">Avanzado</option>
                  </select>
                </div>
              </div>

              {error ? (
                <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-2xl bg-neutral-950 px-5 py-3.5 text-sm font-medium text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Generando receta..." : "Generar receta"}
              </button>
            </div>
          </form>

          <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
            {!recipe ? (
              <div className="flex min-h-[520px] items-center justify-center">
                <div className="max-w-md text-center">
                  <h2 className="text-2xl font-semibold tracking-tight">
                    Resultado
                  </h2>
                  <p className="mt-3 leading-7 text-neutral-600">
                    Cuando generes una receta, acá vas a ver el nombre del
                    plato, el tiempo total, los ingredientes utilizados y el
                    paso a paso detallado.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="flex flex-col gap-4 border-b border-neutral-200 pb-6 md:flex-row md:items-start md:justify-between">
                  <div>
                   <div className="mb-2 flex flex-wrap gap-2">
                    <span className="inline-flex rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-600">
                        Receta generada
                     </span>

                      {recipe.source === "cache" ? (
                       <span className="inline-flex rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                         Desde cache
                       </span>
                       ) : recipe.source === "ai" ? (
                        <span className="inline-flex rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                           Generada con IA
                         </span>
                      ) : null}
                   </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                      {recipe.title}
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                      Tiempo total: {recipe.time_minutes} minutos
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={handleCopyRecipe}
                      className="rounded-2xl border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                    >
                      {copied ? "Copiada" : "Copiar receta"}
                    </button>

                    <button
                      type="button"
                      onClick={handleRegenerate}
                      disabled={loading}
                      className="rounded-2xl bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:opacity-95 disabled:opacity-60"
                    >
                      {loading ? "Generando..." : "Otra versión"}
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">Ingredientes</h3>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {recipe.ingredients.map((item) => (
                      <li
                        key={item}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    Opcionales permitidos
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {recipe.optional.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="mb-3 text-lg font-semibold">
                    Paso a paso detallado
                  </h3>
                  <div className="space-y-3">
                    {recipe.steps.map((step, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4"
                      >
                        <div className="mb-2 text-sm font-semibold text-neutral-500">
                          Paso {index + 1}
                        </div>
                        <p className="leading-7 text-neutral-700">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-neutral-200 bg-white p-4">
                  <h3 className="mb-2 text-lg font-semibold">
                    Sugerencia final
                  </h3>
                  <p className="leading-7 text-neutral-700">
                    {recipe.final_tip}
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}