"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Sparkles, Loader2, Upload, Edit, Trash2, Plus } from "lucide-react"
import Link from "next/link"

/**
 * @description Page component for uploading certificates to the portfolio.
 * @returns {JSX.Element} The certificate upload page.
 */
export default function CertificateUploadPage() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    technologies: [] as string[],
    file: null as File | null,
  })
  const [techInput, setTechInput] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formErrors, setFormErrors] = useState({ title: "", file: "" })
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoadingCerts, setIsLoadingCerts] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setIsLoadingCerts(true)
    try {
      const response = await fetch('/api/certificates')
      const data = await response.json()
      if (response.ok) {
        setCertificates(data)
      } else {
        console.error('Error fetching certificates:', data)
      }
    } catch (error) {
      console.error('Error fetching certificates:', error)
    } finally {
      setIsLoadingCerts(false)
    }
  }

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este certificado?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/certificates/${id}`, {
        method: 'DELETE'
      })
      const data = await response.json()
      if (response.ok) {
        setCertificates(certificates.filter(c => c.id !== id))
        alert('Certificado eliminado exitosamente')
      } else {
        alert('Error al eliminar: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting certificate:', error)
      alert('Error al eliminar el certificado')
    } finally {
      setDeletingId(null)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (name === 'title' && formErrors.title) {
      setFormErrors((prev) => ({ ...prev, title: '' }))
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))
    if (formErrors.file) {
      setFormErrors((prev) => ({ ...prev, file: '' }))
    }
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

  const validateForm = () => {
    const errors = { title: "", file: "" }
    if (!formData.title.trim()) {
      errors.title = "El título del certificado es obligatorio"
    }
    if (!formData.file) {
      errors.file = "Debe seleccionar un archivo PDF"
    } else {
      if (formData.file.type !== "application/pdf") {
        errors.file = "El archivo debe ser un PDF"
      } else if (formData.file.size > 10 * 1024 * 1024) { // 10MB limit
        errors.file = "El archivo no debe superar los 10MB"
      }
    }
    setFormErrors(errors)
    return !errors.title && !errors.file
  }

  const handleGenerateDescription = async () => {
    if (!formData.title.trim()) return
    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/generateDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: formData.title, notes: "" })
      })
      const data = await response.json()

      if (response.ok && data) {
        setFormData((prev) => ({ ...prev, description: data }))
      } else {
        console.error('Error in AI response:', data)
        // Show specific error details from API
        const errorMessage = data?.error ? `${data.error}: ${data.details || 'Unknown error'}` : 'Error al generar la descripción con IA'
        alert(errorMessage)
      }
    } catch (error) {
      console.error('Error generating description:', error)
      alert('Error de conexión al generar descripción con IA')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsUploading(true)
    try {
      // First, upload the PDF
      const formDataUpload = new FormData()
      formDataUpload.append('file', formData.file!)

      const uploadResponse = await fetch('/api/certificates/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const uploadResult = await uploadResponse.json()
      if (!uploadResult.url) {
        alert('Error al subir el archivo: ' + uploadResult.error)
        return
      }

      // Then, save to database
      const saveResponse = await fetch('/api/certificates/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          technologies: formData.technologies,
          certUrl: uploadResult.url
        })
      })

      const saveResult = await saveResponse.json()
      if (saveResult.success) {
        alert('Certificado subido exitosamente!')
        // Reset form
        setFormData({
          title: "",
          description: "",
          technologies: [],
          file: null,
        })
        setTechInput("")
        // Clear file input manually since HTML file inputs can't be reset programmatically
        if (fileInputRef.current) {
          fileInputRef.current.value = ""
        }
        // Refresh certificates list
        fetchCertificates()
      } else {
        alert('Error al guardar: ' + saveResult.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al procesar la solicitud')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="text-center space-y-2 mb-8">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
          Subir Certificado
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">
          Añade certificados a tu portafolio
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
                Detalles del Certificado
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                Completa la información del certificado
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
              <div className="flex items-center justify-between">
                <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                  Descripción
                </label>
                <Button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating || !formData.title.trim()}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  {isGenerating && <Loader2 className="h-4 w-4 animate-spin" />}
                  <Sparkles className="h-4 w-4" />
                  Generar con IA
                </Button>
              </div>
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
                      className="gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 cursor-pointer px-3 py-1"
                      onClick={() => removeTechnology(tech)}
                    >
                      {tech}
                      <span className="text-lg leading-none">×</span>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Archivo PDF */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900 dark:text-white">
                Archivo PDF del Certificado
              </label>
              <Input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className={`file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${formErrors.file ? 'border-red-500' : ''}`}
              />
              {formErrors.file && <p className="text-xs text-red-500">{formErrors.file}</p>}
              {formData.file && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Archivo seleccionado: {formData.file.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isUploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Certificado
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Certificates List */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-lg mt-8">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-green-50 to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <FileText className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                Lista de Certificados
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {certificates.length} certificado{certificates.length !== 1 ? 's' : ''} encontrado{certificates.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8">
          {isLoadingCerts ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : certificates.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                No tienes certificados aún
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-500">
                Usa el formulario de arriba para subir tu primer certificado
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <div
                  key={certificate.id}
                  className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-2">
                      {certificate.title}
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
                      {certificate.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {certificate.technologies?.slice(0, 3).map((tech: string) => (
                        <Badge key={tech} variant="secondary" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {certificate.technologies?.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{certificate.technologies.length - 3} más
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Link href={`/admin/certificates/edit/${certificate.id}`}>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteCertificate(certificate.id)}
                      disabled={deletingId === certificate.id}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === certificate.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}