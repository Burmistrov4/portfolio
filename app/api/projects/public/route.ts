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

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error in projects API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}