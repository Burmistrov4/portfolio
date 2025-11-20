import { NextRequest, NextResponse } from 'next/server'
import supabase from '@/lib/supabase'

/**
 * @description API route to get all public projects.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with projects data or error.
 */
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Process projects to generate proper image URLs and handle null values
    const processedProjects = (data || []).map(project => ({
      ...project,
      // Generate public URLs for images stored in project-files bucket
      file_paths: project.file_paths?.map((filePath: string) =>
        supabase.storage.from('project-files').getPublicUrl(filePath).data.publicUrl
      ) || [],
      // Ensure links are properly handled (can be null/empty)
      github_link: project.github_link || null,
      demo_link: project.demo_link || null,
    }))

    console.log('Projects fetched:', processedProjects.length, 'projects')

    return NextResponse.json(processedProjects)
  } catch (error) {
    console.error('Error in projects API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}