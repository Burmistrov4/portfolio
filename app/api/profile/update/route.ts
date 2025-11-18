import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

/**
 * @description API route to update profile data.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with success or error.
 */
export async function POST(request: NextRequest) {
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

    // Get current profile to get old URLs
    const { data: currentProfile } = await supabase
      .from('profile')
      .select('profile_image_url, cv_pdf_url')
      .eq('id', 1)
      .single()

    const oldImageUrl = currentProfile?.profile_image_url
    const oldCvUrl = currentProfile?.cv_pdf_url

    const { data, error } = await supabase
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
    if (oldImageUrl && oldImageUrl !== profile_image_url) {
      const oldImageFilename = decodeURIComponent(oldImageUrl.split('/').pop())
      if (oldImageFilename) {
        await supabase.storage.from('profile').remove([oldImageFilename])
      }
    }

    // Delete old CV file if exists and different from new
    if (oldCvUrl && oldCvUrl !== cv_pdf_url) {
      const oldCvFilename = decodeURIComponent(oldCvUrl.split('/').pop())
      if (oldCvFilename) {
        await supabase.storage.from('profile').remove([oldCvFilename])
      }
    }

    return NextResponse.json({ success: true, profile: data[0] }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}