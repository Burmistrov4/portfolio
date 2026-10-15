import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import supabase from '@/lib/supabase'
import { profileFileName, resolveProfileUrl } from '@/lib/storage'

/**
 * @description API route to update profile data.
 *
 * SEGURIDAD: esta ruta escribe con la service-role key (que ignora RLS), asi
 * que necesita validar la sesion por si misma. Sin la comprobacion de sesion
 * cualquier visitante anonimo podia sobrescribir el perfil publico.
 *
 * INTEGRIDAD: las URLs de los archivos se normalizan antes de guardar para
 * evitar que un valor duplicado (…/public/profile/https://…) corrompa la foto
 * o el CV. Los archivos antiguos solo se borran cuando el archivo es distinto.
 *
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

    const oldImageUrl = currentProfile?.profile_image_url ?? null
    const oldCvUrl = currentProfile?.cv_pdf_url ?? null

    // Normaliza la entrada: '' o null significan "no cambiar".
    const nextImageUrl = profile_image_url ? resolveProfileUrl(profile_image_url) : null
    const nextCvUrl = cv_pdf_url ? resolveProfileUrl(cv_pdf_url) : null

    const mergedData = {
      id: 1,
      full_name: full_name !== undefined ? full_name : currentProfile?.full_name,
      professional_title: professional_title !== undefined ? professional_title : currentProfile?.professional_title,
      bio: bio !== undefined ? bio : currentProfile?.bio,
      linkedin_url: linkedin_url !== undefined ? linkedin_url : currentProfile?.linkedin_url,
      github_url: github_url !== undefined ? github_url : currentProfile?.github_url,
      profile_image_url: nextImageUrl ?? oldImageUrl,
      cv_pdf_url: nextCvUrl ?? oldCvUrl,
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

    // Borrar el archivo antiguo SOLO si es un archivo distinto al nuevo.
    // Comparar por nombre evita borrar el archivo que sigue en uso cuando el
    // valor previo venia duplicado.
    const oldImageName = profileFileName(oldImageUrl)
    const newImageName = profileFileName(mergedData.profile_image_url)
    if (oldImageName && newImageName && oldImageName !== newImageName) {
      await supabase.storage.from('profile').remove([oldImageName])
    }

    const oldCvName = profileFileName(oldCvUrl)
    const newCvName = profileFileName(mergedData.cv_pdf_url)
    if (oldCvName && newCvName && oldCvName !== newCvName) {
      await supabase.storage.from('profile').remove([oldCvName])
    }

    return NextResponse.json({ success: true, profile: data[0] }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
