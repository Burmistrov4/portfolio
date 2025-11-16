import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import supabase from '@/lib/supabase'

/**
 * @description API route to upload files to Supabase Storage.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with uploaded file URLs.
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
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const uploadedUrls: string[] = []

    for (const file of files) {
      const fileName = `${crypto.randomUUID()}-${file.name}`

      const { data, error } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, {
          contentType: file.type,
          upsert: false
        })

      if (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: `Failed to upload ${file.name}: ${error.message}` }, { status: 500 })
      }

      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName)

      uploadedUrls.push(publicUrl)
    }

    return NextResponse.json({ urls: uploadedUrls }, { status: 200 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}