import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import supabase from '@/lib/supabase'

/**
 * @description API route to get, update, or delete a certificate by ID.
 * @param {NextRequest} request The request object.
 * @param {Object} context The context object containing params.
 * @returns {NextResponse} The response with certificate data or success/error.
 */
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * @description API route to update a certificate by ID.
 * @param {NextRequest} request The request object.
 * @param {Object} context The context object containing params.
 * @returns {NextResponse} The response with updated certificate data or error.
 */
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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
    const { title, description, technologies, cert_url, is_published } = await request.json()

    const { data, error } = await supabase
      .from('certificates')
      .update({
        title,
        description,
        technologies,
        cert_url,
        is_published,
      })
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * @description API route to delete a certificate by ID.
 * @param {NextRequest} request The request object.
 * @param {Object} context The context object containing params.
 * @returns {NextResponse} The response with success or error.
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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
    // First, get the certificate to get the file path
    const { data: certificate, error: fetchError } = await supabase
      .from('certificates')
      .select('cert_url')
      .eq('id', params.id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 404 })
    }

    // Extract file path from URL
    const filePath = certificate.cert_url.split('/').pop()

    if (filePath) {
      // Remove file from storage
      await supabase.storage.from('certificates').remove([filePath])
    }

    // Delete the record
    const { error } = await supabase
      .from('certificates')
      .delete()
      .eq('id', params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}