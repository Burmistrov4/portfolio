"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { FileText, Sparkles, Loader2, Upload } from "lucide-react"

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
    } else if (formData.file.type !== "application/pdf") {
      errors.file = "El archivo debe ser un PDF"
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
      setFormData((prev) => ({ ...prev, description: data.summary || data.detailedDescription || "" }))
    } catch (error) {
      console.error('Error generating description:', error)
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
    </div>
  )
}