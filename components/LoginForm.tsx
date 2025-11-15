'use client'

import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

/**
 * @description Client component for Supabase Auth UI.
 * @returns {JSX.Element} The auth form.
 */
export default function LoginForm() {
  const supabase = createBrowserSupabaseClient()

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={[]}
      redirectTo={`${window.location.origin}/admin/setup-wizard`}
    />
  )
}