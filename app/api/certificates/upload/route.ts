import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import supabase from '@/lib/supabase'

/**
 * @description API route to upload certificate PDF files to Supabase Storage.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with uploaded file URL.
 */
export async function POST(request: NextRequest) {
  const supabaseAuth = createRouteHandlerClient(
    { cookies },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  )
  const { data: { session } } = await supabaseAuth.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 })
    }

    const fileName = `${crypto.randomUUID()}-${file.name}`

    // Ensure the 'certificates' bucket exists and is public in Supabase Storage dashboard
    const { data, error } = await supabase.storage
      .from('certificates')
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false
      })

    if (error) {
      console.error('Upload error:', error)
      return NextResponse.json({ error: `Failed to upload file: ${error.message}` }, { status: 500 })
    }

    const { data: { publicUrl } } = supabase.storage
      .from('certificates')
      .getPublicUrl(fileName)

    return NextResponse.json({ url: publicUrl }, { status: 200 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}