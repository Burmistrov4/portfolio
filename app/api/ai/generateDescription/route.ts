import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * @description API route to generate project description using Google Gemini AI.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with AI-generated description.
 */
export async function POST(request: NextRequest) {
  let title = 'Proyecto sin título'

  try {
    const body = await request.json()
    title = body.title || title
    const notes = body.notes

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Genera una descripción detallada en español para un proyecto titulado "${title}".
${notes ? `Información adicional: ${notes}` : ''}

La descripción debe incluir:
1. Un resumen breve del proyecto
2. Las tecnologías o herramientas utilizadas
3. Las funcionalidades principales
4. El impacto o valor que aporta

Formato la respuesta como JSON con estas claves:
- summary: resumen breve (2-3 oraciones)
- detailedDescription: descripción detallada con viñetas o párrafos

Responde únicamente con el JSON válido, sin texto adicional.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    // Try to parse as JSON first
    try {
      const parsedResponse = JSON.parse(text)
      return NextResponse.json(parsedResponse)
    } catch (parseError) {
      // If not valid JSON, create structured response from text
      console.warn('AI response not valid JSON, creating fallback structure')
      const structuredResponse = {
        summary: text.split('\n')[0] || `Proyecto: ${title}`,
        detailedDescription: text
      }
      return NextResponse.json(structuredResponse)
    }

  } catch (error) {
    console.error('Error generating AI description:', error)

    // Return fallback response instead of error
    const fallbackResponse = {
      summary: `Proyecto: ${title}`,
      detailedDescription: `Este proyecto utiliza tecnologías modernas para resolver problemas específicos. Incluye funcionalidades avanzadas y una interfaz intuitiva.`
    }

    return NextResponse.json(fallbackResponse)
  }
}