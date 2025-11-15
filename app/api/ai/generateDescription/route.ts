import { NextRequest, NextResponse } from 'next/server'

/**
 * @description API route to generate project description using AI (mock).
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with mock data.
 */
export async function POST(request: NextRequest) {
  const { title, notes } = await request.json()

  // Mock AI response
  const response = {
    summary: "Este es un resumen ficticio generado por la API.",
    detailedDescription: "Paso 1: El proyecto hace esto.\nPaso 2: Luego utiliza aquello."
  }

  return NextResponse.json(response)
}