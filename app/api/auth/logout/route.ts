import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

/**
 * @description API route to handle user logout.
 * @param {NextRequest} request The request object.
 * @returns {NextResponse} The response with redirect.
 */
export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}