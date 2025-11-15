export const dynamic = 'force-dynamic'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import LoginForm from '@/components/LoginForm'

/**
 * @description Renders the admin login page.
 * @returns {JSX.Element} The login page.
 */
export default async function LoginPage() {
  console.log('LoginPage: Checking session...')
  const supabase = createServerComponentClient({ cookies })
  const { data: { session } } = await supabase.auth.getSession()
  console.log('LoginPage: Session found:', !!session)

  if (session) {
    console.log('LoginPage: Redirecting to /admin/setup-wizard')
    redirect('/admin/setup-wizard')
  }
  console.log('LoginPage: No session, rendering login form')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-center mb-6 text-slate-900 dark:text-white">Admin Login</h1>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}