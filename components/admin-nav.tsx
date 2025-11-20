'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, User, FileText, Settings, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useTheme } from 'next-themes'

/**
 * @description Navigation component for admin pages.
 * @returns {JSX.Element} The admin navigation.
 */
export function AdminNav() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

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

            <Link href="/admin/projects">
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <FileText className="w-4 h-4 mr-2" />
                Proyectos
              </Button>
            </Link>

            <Link href="/admin/certificates">
              <Button variant="ghost" className="text-white hover:bg-slate-800">
                <FileText className="w-4 h-4 mr-2" />
                Certificados
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

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="text-white hover:bg-slate-800"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

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