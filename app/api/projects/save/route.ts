import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import supabase from '@/lib/supabase'

/**
 * @description API route to save project data to Supabase.
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
    const { projectTitle, githubLink, demoLink, technologies, aiSummary, aiDescription, filePaths } = await request.json()

    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title: projectTitle,
          github_link: githubLink,
          demo_link: demoLink,
          technologies,
          ai_summary: aiSummary,
          ai_description: aiDescription,
          file_paths: filePaths,
        },
      ])
      .select()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, project: data[0] }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}