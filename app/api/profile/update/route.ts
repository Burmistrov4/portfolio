import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @description API route to update profile data.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with success or error.
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
    const {
      full_name,
      professional_title,
      bio,
      linkedin_url,
      github_url,
      profile_image_url,
      cv_pdf_url
    } = await request.json()

    const { data, error } = await supabaseAuth
      .from('profile')
      .upsert({
        id: 1,
        full_name,
        professional_title,
        bio,
        linkedin_url,
        github_url,
        profile_image_url,
        cv_pdf_url
      }, {
        onConflict: 'id'
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, profile: data[0] }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}