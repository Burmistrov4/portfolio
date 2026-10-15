'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createBrowserSupabaseClient } from '@supabase/auth-helpers-nextjs'

/**
 * @description Password recovery landing page.
 *
 * The recovery email (type=recovery, PKCE) lands here via `redirectTo`.
 * The browser client exchanges the ?code automatically on mount, which
 * establishes the recovery session, and the Auth UI renders the
 * update-password form.  After the password is updated (USER_UPDATED),
 * the user is sent into the admin panel.
 *
 * NOTE: this route MUST live outside the (protected) group — the
 * protected layout redirects session-less requests to /admin/login,
 * which would break the recovery flow (the session only exists after
 * the client-side exchange, so the server never sees it in time).
 */
export default function UpdatePasswordPage() {
  const supabase = createBrowserSupabaseClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'USER_UPDATED') {
        router.push('/admin/setup-wizard')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">
            Nueva contraseña
          </h1>
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={[]}
            view="update_password"
          />
        </div>
      </div>
    </div>
  )
}
