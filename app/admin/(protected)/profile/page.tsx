'use client'

import type React from 'react'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, User, FileText } from 'lucide-react'
import Image from 'next/image'

interface ProfileData {
  full_name: string
  professional_title: string
  bio: string
  linkedin_url: string
  github_url: string
  profile_image_url?: string
  cv_pdf_url?: string
}

/**
 * @description Profile management page for admin.
 * @returns {JSX.Element} The profile page.
 */
export default function ProfilePage() {
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    professional_title: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isUploadingCV, setIsUploadingCV] = useState(false)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const response = await fetch('/api/profile/get')
      if (response.ok) {
        const data = await response.json()
        setProfileData(data)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfileData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = async (files: FileList, type: 'image' | 'cv') => {
    if (!files || files.length === 0) return

    const setUploading = type === 'image' ? setIsUploadingImage : setIsUploadingCV
    setUploading(true)

    try {
      const formData = new FormData()
      Array.from(files).forEach(file => {
        formData.append('files', file)
      })

      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()
      if (result.urls && result.urls.length > 0) {
        const url = result.urls[0]
        setProfileData(prev => ({
          ...prev,
          [type === 'image' ? 'profile_image_url' : 'cv_pdf_url']: url
        }))
      } else {
        alert('Error al subir archivo: ' + result.error)
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Error al subir archivo')
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        alert('Perfil guardado exitosamente!')
      } else {
        const error = await response.json()
        alert('Error al guardar: ' + error.error)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error al guardar el perfil')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white text-balance">
          Panel de Perfil
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Gestiona tu información personal y profesional
        </p>
      </div>

      {/* Profile Form */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                Información Personal
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Actualiza tus datos profesionales y de contacto
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Nombre Completo
            </label>
            <Input
              name="full_name"
              value={profileData.full_name}
              onChange={handleInputChange}
              placeholder="Tu nombre completo"
              className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Professional Title */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Título Profesional
            </label>
            <Input
              name="professional_title"
              value={profileData.professional_title}
              onChange={handleInputChange}
              placeholder="Ej: Desarrollador Full Stack"
              className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Biografía
            </label>
            <Textarea
              name="bio"
              value={profileData.bio}
              onChange={handleInputChange}
              placeholder="Describe tu experiencia y especialidades..."
              className="min-h-32 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
            />
          </div>

          {/* LinkedIn URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Enlace de LinkedIn
            </label>
            <Input
              name="linkedin_url"
              value={profileData.linkedin_url}
              onChange={handleInputChange}
              placeholder="https://linkedin.com/in/tu-perfil"
              className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* GitHub URL */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Enlace de GitHub
            </label>
            <Input
              name="github_url"
              value={profileData.github_url}
              onChange={handleInputChange}
              placeholder="https://github.com/tu-usuario"
              className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
            />
          </div>

          {/* Profile Image Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              Foto de Perfil
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'image')}
              disabled={isUploadingImage}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isUploadingImage && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Subiendo imagen...</p>
              </div>
            )}
            {profileData.profile_image_url && (
              <div className="mt-2">
                <Image
                  src={profileData.profile_image_url}
                  alt="Profile"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover"
                />
              </div>
            )}
          </div>

          {/* CV Upload */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900 dark:text-white">
              CV en PDF
            </label>
            <Input
              type="file"
              accept=".pdf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files, 'cv')}
              disabled={isUploadingCV}
              className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {isUploadingCV && (
              <div className="flex items-center gap-2 text-blue-600">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Subiendo CV...</p>
              </div>
            )}
            {profileData.cv_pdf_url && (
              <div className="mt-2">
                <a
                  href={profileData.cv_pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <FileText className="h-4 w-4" />
                  <span>Ver CV</span>
                </a>
              </div>
            )}
          </div>
        </CardContent>

        {/* Footer */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-8 py-6">
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="min-w-28 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}