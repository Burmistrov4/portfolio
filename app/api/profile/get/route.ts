import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'
import { resolveProfileUrl } from '@/lib/storage'

/**
 * @description API route to get profile data.
 * Las URLs de los archivos se normalizan a una sola URL publica: antes esta
 * ruta trataba la URL completa como nombre de archivo y la duplicaba, lo que
 * dejaba la vista previa rota en el panel y corrompia el dato al guardar.
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

    const profileData = {
      ...data,
      profile_image_url: resolveProfileUrl(data.profile_image_url) ?? '',
      cv_pdf_url: resolveProfileUrl(data.cv_pdf_url) ?? '',
    }

    return NextResponse.json(profileData, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
