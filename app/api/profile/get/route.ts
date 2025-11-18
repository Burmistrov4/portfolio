import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

/**
 * @description API route to get profile data.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with profile data.
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
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

    // Get public URLs for profile image and CV
    let profileImageUrl = ''
    if (data.profile_image_url) {
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(data.profile_image_url)
      profileImageUrl = publicUrl
    }

    let cvPdfUrl = ''
    if (data.cv_pdf_url) {
      const { data: { publicUrl } } = supabase.storage
        .from('profile')
        .getPublicUrl(data.cv_pdf_url)
      cvPdfUrl = publicUrl
    }

    return NextResponse.json({
      ...data,
      profile_image_url: profileImageUrl,
      cv_pdf_url: cvPdfUrl
    }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}