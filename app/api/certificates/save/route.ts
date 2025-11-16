import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import supabase from '@/lib/supabase'

/**
 * @description API route to save certificate data to Supabase.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with success or error.
 */
export async function POST(request: NextRequest) {
  const supabaseAuth = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabaseAuth.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { title, description, technologies, certUrl } = await request.json()

    const { data, error } = await supabase
      .from('certificates')
      .insert([
        {
          title,
          description,
          technologies,
          cert_url: certUrl,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, certificate: data[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}