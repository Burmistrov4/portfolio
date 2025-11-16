import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin-nav'

/**
 * @description Layout for admin routes with authentication check.
 * @param {Object} props The props containing children.
 * @returns {JSX.Element} The layout.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  console.log('ProtectedLayout: Checking session...')
  const supabase = createServerComponentClient(
    { cookies },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  )

  const { data: { session } } = await supabase.auth.getSession()
  console.log('ProtectedLayout: Session found:', !!session)

  if (!session) {
    console.log('ProtectedLayout: No session, redirecting to /admin/login')
    redirect('/admin/login')
  }
  console.log('ProtectedLayout: Session valid, rendering children')

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminNav />
      <main className="p-4 sm:p-8">
        {children}
      </main>
    </div>
  )
}