import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

/**
 * @description API route to update profile data.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with success or error.
 */
export async function POST(request: NextRequest) {
  try {
    const requestData = await request.json()
    const {
      full_name,
      professional_title,
      bio,
      linkedin_url,
      github_url,
      profile_image_url,
      cv_pdf_url
    } = requestData

    // Get current profile data for merging
    const { data: currentProfile } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 1)
      .single()

    const oldImageUrl = currentProfile?.profile_image_url
    const oldCvUrl = currentProfile?.cv_pdf_url

    // Merge new data with existing data - preserve existing values when new ones are null/undefined or empty
    // Only update file URLs if they contain actual URLs (not empty strings from form initialization)
    const mergedData = {
      id: 1,
      full_name: full_name !== undefined ? full_name : currentProfile?.full_name,
      professional_title: professional_title !== undefined ? professional_title : currentProfile?.professional_title,
      bio: bio !== undefined ? bio : currentProfile?.bio,
      linkedin_url: linkedin_url !== undefined ? linkedin_url : currentProfile?.linkedin_url,
      github_url: github_url !== undefined ? github_url : currentProfile?.github_url,
      profile_image_url: (profile_image_url && profile_image_url.trim() !== '' && profile_image_url.includes('supabase')) ? profile_image_url : currentProfile?.profile_image_url,
      cv_pdf_url: (cv_pdf_url && cv_pdf_url.trim() !== '' && cv_pdf_url.includes('supabase')) ? cv_pdf_url : currentProfile?.cv_pdf_url
    }

    const { data, error } = await supabase
      .from('profile')
      .upsert(mergedData, {
        onConflict: 'id'
      })
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Delete old image file if exists and different from new
    if (oldImageUrl && oldImageUrl !== mergedData.profile_image_url) {
      const oldImageFilename = decodeURIComponent(oldImageUrl.split('/').pop())
      if (oldImageFilename) {
        await supabase.storage.from('profile').remove([oldImageFilename])
      }
    }

    // Delete old CV file if exists and different from new
    if (oldCvUrl && oldCvUrl !== mergedData.cv_pdf_url) {
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