'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, FileText, Settings } from 'lucide-react'
import Link from 'next/link'

/**
 * @description Navigation component for admin pages.
 * @returns {JSX.Element} The admin navigation.
 */
export function AdminNav() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        router.push('/admin/login')
      } else {
        alert('Error al cerrar sesión')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Error al cerrar sesión')
    }
  }

  return (
    <nav className="bg-slate-900 text-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold">Panel de Administración</h1>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link href="/admin/profile">
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <User className="w-4 h-4 mr-2" />
                Perfil
              </Button>
            </Link>

            <Link href="/admin/setup-wizard">
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <FileText className="w-4 h-4 mr-2" />
                Nuevo Proyecto
              </Button>
            </Link>

            <Link href="/">
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <Settings className="w-4 h-4 mr-2" />
                Ver Sitio
              </Button>
            </Link>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}