'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

/**
 * @description Client component for Supabase Auth UI.
 * @returns {JSX.Element} The auth form.
 */
export default function LoginForm() {
  const supabase = createBrowserSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        router.push('/admin/setup-wizard')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={[]}
      redirectTo={`${window.location.origin}/admin/setup-wizard`}
    />
  )
}