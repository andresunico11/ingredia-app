import { NextResponse } from "next/server";
import { getDailyChefSuggestion } from "@/lib/featured";

export async function GET() {
  try {
    const suggestion = getDailyChefSuggestion();

    if (!suggestion) {
      return NextResponse.json(
        { error: "No hay sugerencias disponibles." },
        { status: 404 }
      );
    }

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("Error obteniendo sugerencia del chef:", error);

    return NextResponse.json(
      { error: "No se pudo obtener la sugerencia del chef." },
      { status: 500 }
    );
  }
}