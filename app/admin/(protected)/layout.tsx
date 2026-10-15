export const dynamic = 'force-dynamic';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { AdminNav } from '@/components/admin-nav'

/**
 * @description Layout for admin routes with authentication check.
 *
 * Usa `getUser()` en lugar de `getSession()`: `getSession()` se limita a leer y
 * decodificar la cookie sin validar la firma contra el servidor de Supabase, por
 * lo que una cookie fabricada podia pasar el control. `getUser()` valida el JWT
 * con el servidor de autenticacion.
 *
 * @param {Object} props The props containing children.
 * @returns {JSX.Element} The layout.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createServerComponentClient(
    { cookies },
    {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <AdminNav />
      <main className="p-4 sm:p-8">
        {children}
      </main>
    </div>
  )
}
