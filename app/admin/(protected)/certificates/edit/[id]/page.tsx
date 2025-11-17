"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Loader2, Save } from "lucide-react"

/**
 * @description Page component for editing a certificate.
 * @returns {JSX.Element} The certificate edit page.
 */
export default function EditCertificatePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: [] as string[],
    cert_url: "",
    is_published: true,
  })
  const [techInput, setTechInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [formErrors, setFormErrors] = useState({ title: '' })

  useEffect(() => {
    fetchCertificate()
  }, [params.id])

  const fetchCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates/${params.id}`)
      const data = await response.json()
      if (response.ok) {
        setFormData({
          title: data.title || "",
          description: data.description || "",
          technologies: data.technologies || [],
          cert_url: data.cert_url || "",
          is_published: data.is_published ?? true,
        })
      } else {
        console.error('Error fetching certificate:', data)
        alert('Error al cargar el certificado: ' + data.error)
        router.push('/admin/certificates')
      }
    } catch (error) {
      console.error('Error fetching certificate:', error)
      alert('Error al cargar el certificado')
      router.push('/admin/certificates')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear error when user starts typing
    if (name === 'title' && formErrors.title) {
      setFormErrors({ title: '' })
    }
  }

  const validateForm = () => {
    if (!formData.title.trim()) {
      setFormErrors({ title: 'El título del certificado es obligatorio' })
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
      const response = await fetch(`/api/certificates/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      if (response.ok) {
        alert('Certificado actualizado exitosamente!')
        router.push('/admin/certificates')
      } else {
        alert('Error al actualizar: ' + data.error)
      }
    } catch (error) {
      console.error('Error updating certificate:', error)
      alert('Error al actualizar el certificado')
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
          Editar Certificado
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Modifica los detalles de tu certificado
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                Detalles del Certificado
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Actualiza la información del certificado
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Título */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Título del Certificado
              </label>
              <Input
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Ej: Certificado en Desarrollo Web Full Stack"
                className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${formErrors.title ? 'border-red-500' : ''}`}
              />
              {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Descripción
              </label>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe el certificado..."
                className="min-h-24 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
              />
            </div>

            {/* Tecnologías */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Tecnologías Relacionadas
              </label>
              <Input
                value={techInput}
                onChange={(e) => setTechInput(e.target.value)}
                onKeyDown={addTechnology}
                placeholder="Escribe una tecnología y presiona Enter (ej: React, Node.js)"
                className="h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
              />
              {formData.technologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.technologies.map((tech) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="gap-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-800 cursor-pointer px-3 py-1"
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

            {/* Archivo actual */}
            {formData.cert_url && (
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Archivo Actual
                </label>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <a
                    href={formData.cert_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Ver certificado actual
                  </a>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Nota: Para cambiar el archivo, elimina este certificado y crea uno nuevo.
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => router.push('/admin/certificates')}
                variant="outline"
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
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