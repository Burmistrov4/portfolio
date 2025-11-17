"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Github, LinkIcon, FileText, Loader2, Save } from "lucide-react"

/**
 * @description Page component for editing a project.
 * @returns {JSX.Element} The project edit page.
 */
export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    github_link: "",
    demo_link: "",
    technologies: [] as string[],
    ai_summary: "",
    ai_description: "",
    file_paths: [] as string[],
  })
  const [techInput, setTechInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({ title: '' })

  const fetchProject = useCallback(async () => {
    try {
      const response = await fetch(`/api/projects/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setFormData({
          title: data.title || "",
          github_link: data.github_link || "",
          demo_link: data.demo_link || "",
          technologies: data.technologies || [],
          ai_summary: data.ai_summary || "",
          ai_description: data.ai_description || "",
          file_paths: data.file_paths || [],
        })
      } else {
        console.error('Error fetching project:', data)
        alert('Error al cargar el proyecto: ' + data.error)
        router.push('/admin/projects')
      }
    } catch (error) {
      console.error('Error fetching project:', error)
      alert('Error al cargar el proyecto')
      router.push('/admin/projects')
    } finally {
      setIsLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchProject()
  }, [fetchProject])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (name === 'title' && formErrors.title) {
      setFormErrors({ title: '' })
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormErrors({ title: 'El título del proyecto es obligatorio' })
      return false
    }
    setFormErrors({ title: '' })
    return true
  }

  const addTechnology = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      const tech = techInput.trim()
      if (tech && !formData.technologies.includes(tech)) {
        setFormData((prev) => ({
          ...prev,
          technologies: [...prev.technologies, tech],
        }))
        setTechInput("")
      }
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData((prev) => ({
      ...prev,
      technologies: prev.technologies.filter((t) => t !== tech),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        alert('Proyecto actualizado exitosamente!')
        router.push('/admin/projects')
      } else {
        alert('Error al actualizar: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating project:', error)
      alert('Error al actualizar el proyecto')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center justify-center min-h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Editar Proyecto
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Modifica los detalles de tu proyecto
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                Detalles del Proyecto
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Actualiza la información del proyecto
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título del Proyecto */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Título del Proyecto</label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Mi Aplicación Web Increíble"
                className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${formErrors.title ? 'border-red-500' : ''}`}
              />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
              <p className="text-xs text-slate-500 dark:text-slate-400">Nombre descriptivo de tu proyecto</p>
            </div>

            {/* GitHub URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Enlace a GitHub</label>
              <div className="relative">
                <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  name="github_link"
                  value={formData.github_link}
                  onChange={handleInputChange}
                  placeholder="https://github.com/usuario/repositorio"
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">URL pública de tu repositorio de GitHub</p>
            </div>

            {/* Demo URL */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Enlace de Demo</label>
              <div className="relative">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <Input
                  name="demo_link"
                  value={formData.demo_link}
                  onChange={handleInputChange}
                  placeholder="https://mi-aplicacion.vercel.app"
                  className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">URL de la versión desplegada de tu proyecto</p>
            </div>

            {/* Tecnologías */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Tecnologías Usadas</label>
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={addTechnology}
                placeholder="Escribe una tecnología y presiona Enter (ej: React, Next.js, TypeScript)"
                className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              {formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer px-3 py-1"
                      onClick={() => removeTechnology(tech)}
                    >
                      {tech}
                      <span className="text-lg leading-none">×</span>
                    </Badge>
                  ))}
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Presiona Enter o coma para agregar. Haz clic en un tag para eliminarlo.
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">Descripción</label>
              <Textarea
                name="ai_summary"
                value={formData.ai_summary}
                onChange={handleInputChange}
                placeholder="Describe tu proyecto..."
                className="min-h-24 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">Breve descripción del proyecto</p>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => router.push('/admin/projects')}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}