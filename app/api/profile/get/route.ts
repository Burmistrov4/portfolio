import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @description API route to get profile data.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with profile data.
 */
export async function GET(request: NextRequest) {
  const supabaseAuth = createRouteHandlerClient({ cookies })
  const { data: { session } } = await supabaseAuth.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { data, error } = await supabaseAuth
      .from('profile')
      .select('*')
      .eq('id', 1)
      .single()

    if (error) {
      // If no profile exists, return empty data
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          full_name: '',
          professional_title: '',
          bio: '',
          linkedin_url: '',
          github_url: '',
          profile_image_url: '',
          cv_pdf_url: ''
        }, { status: 200 })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}