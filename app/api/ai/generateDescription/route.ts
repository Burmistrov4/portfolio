import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

/**
 * @description API route to generate project description using Google Gemini AI.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with AI-generated description.
 */
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, technologies, notes, userMessage, conversationHistory } = body

  try {

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
      return NextResponse.json({ error: 'AI service not configured' }, { status: 500 })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

    let prompt = `Actúa como un Escritor de Contenido Profesional para Portafolios de Desarrollo.

Contexto del proyecto:
- Título: ${title}
- Tecnologías: ${technologies?.join(', ') || 'No especificadas'}
- Notas del desarrollador: ${notes || 'No hay notas adicionales'}

`

    if (conversationHistory && conversationHistory.length > 0) {
      prompt += `Historial de conversación:
${conversationHistory.map((msg: any) => `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`).join('\n')}

`
    }

    if (userMessage) {
      prompt += `Mensaje del usuario: ${userMessage}

`
    }

    prompt += `Instrucciones:
- Utiliza EXPLÍCITAMENTE la información proporcionada (Título, Tecnologías, Notas del desarrollador) para crear el contenido
- Crea una descripción profesional de al menos 3 párrafos estructurada así:
  * Párrafo 1: Introducción al proyecto usando el título y una visión general basada en las notas
  * Párrafo 2: Características técnicas y tecnologías utilizadas
  * Párrafo 3: Valor, impacto y conclusión del proyecto
- Usa un tono profesional pero accesible
- Incluye detalles técnicos relevantes de las tecnologías especificadas
- Enfatiza el valor y impacto del proyecto basado en las notas proporcionadas
- Si es una conversación continua, mejora la descripción basada en el historial y el mensaje actual

Responde ÚNICAMENTE con la descripción completa en español, sin formato JSON ni explicaciones adicionales.`

    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()

    return NextResponse.json({ description: text.trim() })

  } catch (error) {
    console.error('Error generating AI description:', error)
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error('Error details:', {
      message: errorMessage,
      type: typeof error
    })

    // Return fallback response instead of error
    const fallbackResponse = `Proyecto: ${body.title || 'Sin título'}. Descripción generada automáticamente.`
    return NextResponse.json({ description: fallbackResponse })
  }
}