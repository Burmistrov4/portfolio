import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import supabase from '@/lib/supabase'

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

    // Get current profile to get old filenames
    const { data: currentProfile } = await supabaseAuth
      .from('profile')
      .select('profile_image_url, cv_pdf_url')
      .eq('id', 1)
      .single()

    const oldImageFilename = currentProfile?.profile_image_url
    const oldCvUrl = currentProfile?.cv_pdf_url

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

    // Delete old image file if exists and different from new
    if (oldImageFilename && oldImageFilename !== profile_image_url) {
      await supabase.storage.from('profile').remove([oldImageFilename])
    }

    // Delete old CV file if exists and different from new
    if (oldCvUrl && oldCvUrl !== cv_pdf_url) {
      const oldCvFilename = oldCvUrl.split('/').pop()
      if (oldCvFilename) {
        await supabase.storage.from('profile').remove([oldCvFilename])
      }
    }

    return NextResponse.json({ success: true, profile: data[0] }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}