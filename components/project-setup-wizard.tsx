"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Github,
  LinkIcon,
  Zap,
  FileText,
  Sparkles,
  Loader2,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  ImageIcon,
  ExternalLink,
} from "lucide-react"

const STEPS = [
  { id: 1, title: "Detalles", description: "Información básica del proyecto" },
  { id: 2, title: "Archivos", description: "Carga tus archivos" },
  { id: 3, title: "Generación IA", description: "Procesa con IA" },
  { id: 4, title: "Revisión", description: "Revisa y guarda" },
]

/** Acepta vacio (campo opcional) o una URL http/https con dominio. */
const URL_PATTERN = /^https?:\/\/[^\s.]+\.[^\s]+$/i
const MAX_DESCRIPTION = 1500

interface FormErrors {
  title: string
  githubUrl: string
  demoUrl: string
}

const EMPTY_ERRORS: FormErrors = { title: "", githubUrl: "", demoUrl: "" }

/**
 * @description Asistente de carga de proyectos en 4 pasos.
 *
 * El proyecto se crea aqui; la edicion y el borrado de proyectos existentes se
 * hacen desde /admin/projects. Este componente ya no depende de animaciones
 * para mostrar contenido.
 *
 * @returns {JSX.Element} The project setup wizard.
 */
export function ProjectSetupWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    projectTitle: "",
    githubUrl: "",
    demoUrl: "",
    technologies: [] as string[],
    aiNotes: "",
    filePaths: [] as string[],
  })
  const [techInput, setTechInput] = useState("")
  const [generatedData, setGeneratedData] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [formErrors, setFormErrors] = useState<FormErrors>(EMPTY_ERRORS)
  const [chatMessages, setChatMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([])
  const [currentMessage, setCurrentMessage] = useState("")
  const [saveError, setSaveError] = useState<string | null>(null)

  const resetForm = () => {
    setFormData({
      projectTitle: "",
      githubUrl: "",
      demoUrl: "",
      technologies: [],
      aiNotes: "",
      filePaths: [],
    })
    setGeneratedData(null)
    setChatMessages([])
    setCurrentMessage("")
    setFormErrors(EMPTY_ERRORS)
    setSaveError(null)
    setCurrentStep(1)
    setTechInput("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "projectTitle" && formErrors.title) {
      setFormErrors((prev) => ({ ...prev, title: "" }))
    }
    if (name === "githubUrl" && formErrors.githubUrl) {
      setFormErrors((prev) => ({ ...prev, githubUrl: "" }))
    }
    if (name === "demoUrl" && formErrors.demoUrl) {
      setFormErrors((prev) => ({ ...prev, demoUrl: "" }))
    }
  }

  /** Valida el paso 1: titulo obligatorio y enlaces con formato correcto. */
  const validateStep1 = () => {
    const errors: FormErrors = { ...EMPTY_ERRORS }

    if (!formData.projectTitle.trim()) {
      errors.title = "El título del proyecto es obligatorio"
    }

    if (formData.githubUrl.trim() && !URL_PATTERN.test(formData.githubUrl.trim())) {
      errors.githubUrl = "El enlace debe empezar por http:// o https:// y ser una URL válida"
    }

    if (formData.demoUrl.trim() && !URL_PATTERN.test(formData.demoUrl.trim())) {
      errors.demoUrl = "El enlace debe empezar por http:// o https:// y ser una URL válida"
    }

    setFormErrors(errors)
    return !errors.title && !errors.githubUrl && !errors.demoUrl
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

  const removeFile = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      filePaths: prev.filePaths.filter((p) => p !== url),
    }))
  }

  const handleNextStep = () => {
    if (currentStep === 1 && !validateStep1()) {
      return
    }
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  /** Lee la respuesta como JSON sin reventar si el servidor devuelve HTML. */
  const readJson = async (response: Response) => {
    try {
      return await response.json()
    } catch {
      return null
    }
  }

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage.trim()
    setCurrentMessage("")
    setChatMessages((prev) => [...prev, { role: "user", content: userMessage }])
    setIsTyping(true)

    try {
      const response = await fetch("/api/ai/generateDescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.projectTitle,
          technologies: formData.technologies,
          notes: formData.aiNotes,
          userMessage,
          conversationHistory: chatMessages,
        }),
      })
      const data = await readJson(response)
      const content =
        data?.description ??
        "No pude generar la descripción. Revisa que el título y las notas tengan suficiente contexto."
      setChatMessages((prev) => [...prev, { role: "assistant", content }])
    } catch (error) {
      console.error("Error sending message:", error)
      setChatMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Lo siento, hubo un error al generar la respuesta." },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  const handleApplyDescription = () => {
    const lastAssistantMessage = chatMessages.filter((m) => m.role === "assistant").pop()
    if (lastAssistantMessage) {
      setGeneratedData(lastAssistantMessage.content)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      Array.from(files).forEach((file) => {
        formDataUpload.append("files", file)
      })

      const response = await fetch("/api/projects/upload", {
        method: "POST",
        body: formDataUpload,
      })

      const result = await readJson(response)
      if (result?.urls?.length) {
        setFormData((prev) => ({
          ...prev,
          filePaths: [...prev.filePaths, ...result.urls],
        }))
      } else {
        alert("Error al subir archivos: " + (result?.error ?? "respuesta inesperada del servidor"))
      }
    } catch (error) {
      console.error("Error uploading:", error)
      alert("Error al subir archivos")
    } finally {
      setIsUploading(false)
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      // Descripcion: la generada con IA tiene prioridad; si no, las notas.
      const description = generatedData || formData.aiNotes || null

      const payload = {
        title: formData.projectTitle.trim(),
        github_link: formData.githubUrl.trim(),
        demo_link: formData.demoUrl.trim(),
        technologies: formData.technologies,
        ai_summary: description,
        ai_description: description,
        file_paths: formData.filePaths,
      }

      const response = await fetch("/api/projects/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const result = await readJson(response)
      if (response.ok) {
        resetForm()
        // Ir al listado para seguir gestionando, en lugar de saltar al sitio publico.
        router.push("/admin/projects")
        router.refresh()
      } else {
        setSaveError(`Error al guardar: ${result?.error ?? response.statusText}`)
      }
    } catch (error) {
      console.error("Error saving:", error)
      setSaveError("Error de conexión al guardar el proyecto")
    } finally {
      setIsSaving(false)
    }
  }

  const descriptionPreview = generatedData || formData.aiNotes
  const firstImage = formData.filePaths.find((p) => !p.toLowerCase().endsWith(".pdf"))

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/admin/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la lista de proyectos
        </Link>
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white text-balance">
            Asistente de Carga de Proyectos
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-lg">Prepara tu proyecto en 4 sencillos pasos</p>
        </div>
      </div>

      {/* Steps Indicator */}
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex-1 flex items-center">
            {/* Step Circle */}
            <div className="relative flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                  currentStep >= step.id
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                }`}
              >
                {currentStep > step.id ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  step.id
                )}
              </div>

              {/* Step Title */}
              <div className="mt-2 text-center hidden sm:block">
                <p
                  className={`text-sm font-semibold ${
                    currentStep >= step.id ? "text-blue-600 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                  }`}
                >
                  {step.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">{step.description}</p>
              </div>

              {/* Connector Line */}
              {index < STEPS.length - 1 && (
                <div
                  className={`absolute top-6 left-[50%] w-[calc(100%+8px)] h-1 transition-all duration-300 ${
                    currentStep > step.id
                      ? "bg-gradient-to-r from-blue-600 to-blue-500"
                      : "bg-slate-200 dark:bg-slate-700"
                  }`}
                  style={{ marginTop: "-20px", marginLeft: "8px" }}
                />
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Form Card */}
      <Card className="border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-2xl text-slate-900 dark:text-white">
                Paso {currentStep}: {STEPS[currentStep - 1].title}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {STEPS[currentStep - 1].description}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-8 space-y-6">
          {currentStep === 1 && (
            <ProjectDetailsForm
              formData={formData}
              onInputChange={handleInputChange}
              techInput={techInput}
              onTechInputChange={(e) => setTechInput(e.target.value)}
              onAddTechnology={addTechnology}
              onRemoveTechnology={removeTechnology}
              formErrors={formErrors}
            />
          )}

          {currentStep === 2 && (
            <FileUploadStep
              filePaths={formData.filePaths}
              onFileUpload={handleFileUpload}
              onRemoveFile={removeFile}
              isUploading={isUploading}
            />
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <Sparkles className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Chatea con IA para crear la descripción perfecta de tu proyecto
                </p>
              </div>

              {/* Chat Messages */}
              <div className="space-y-4 max-h-96 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800">
                {chatMessages.length === 0 && (
                  <p className="text-center text-slate-500 dark:text-slate-400">
                    Envía un mensaje para comenzar la conversación con IA
                  </p>
                )}
                {chatMessages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        message.role === "user"
                          ? "bg-blue-600 text-white"
                          : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input */}
              <div className="flex gap-2">
                <Textarea
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  placeholder="Describe lo que quieres en la descripción..."
                  className="flex-1 min-h-20 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Enviar
                </Button>
              </div>

              {/* Apply Description Button */}
              {chatMessages.some((m) => m.role === "assistant") && (
                <div className="flex justify-center">
                  <Button onClick={handleApplyDescription} className="bg-green-600 hover:bg-green-700 text-white">
                    Aplicar Descripción
                  </Button>
                </div>
              )}

              {generatedData && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-semibold text-slate-900 dark:text-white">Descripción Aplicada</label>
                    <Button
                      onClick={() => setGeneratedData(null)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Borrar Descripción
                    </Button>
                  </div>
                  <Textarea
                    value={generatedData}
                    readOnly
                    className="min-h-32 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {currentStep === 4 && (
            <ReviewStep
              title={formData.projectTitle}
              technologies={formData.technologies}
              description={descriptionPreview}
              githubUrl={formData.githubUrl}
              demoUrl={formData.demoUrl}
              filePaths={formData.filePaths}
              firstImage={firstImage}
            />
          )}
        </CardContent>

        {/* Footer with Navigation */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-8 py-6 space-y-4">
          {saveError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              {saveError}
            </div>
          )}

          <div className="flex items-center justify-between gap-4">
            <Button
              onClick={handlePreviousStep}
              disabled={currentStep === 1}
              variant="outline"
              className="min-w-28 bg-transparent"
            >
              Anterior
            </Button>

            <div className="flex items-center gap-2">
              {Array.from({ length: STEPS.length }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-2 rounded-full transition-all ${
                    i < currentStep ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={currentStep === STEPS.length ? handleComplete : handleNextStep}
              disabled={currentStep === STEPS.length ? isSaving : false}
              className="min-w-28 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentStep === STEPS.length
                ? isSaving
                  ? "Guardando..."
                  : "Guardar proyecto"
                : "Siguiente"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

interface FileUploadStepProps {
  filePaths: string[]
  onFileUpload: (files: FileList) => void
  onRemoveFile: (url: string) => void
  isUploading: boolean
}

interface ProjectDetailsFormProps {
  formData: {
    projectTitle: string
    githubUrl: string
    demoUrl: string
    technologies: string[]
    aiNotes: string
  }
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  techInput: string
  onTechInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onAddTechnology: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onRemoveTechnology: (tech: string) => void
  formErrors: FormErrors
}

interface ReviewStepProps {
  title: string
  technologies: string[]
  description: string | null
  githubUrl: string
  demoUrl: string
  filePaths: string[]
  firstImage?: string
}

/**
 * @description Paso de carga de archivos, con vista previa y opcion de quitar
 * un archivo antes de guardar.
 */
function FileUploadStep({ filePaths, onFileUpload, onRemoveFile, isUploading }: FileUploadStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Sube capturas del proyecto (la primera imagen será la portada de la tarjeta)
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.txt,.md"
          onChange={(e) => {
            if (e.target.files) onFileUpload(e.target.files)
            e.target.value = ""
          }}
          disabled={isUploading}
          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        {isUploading && (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            <p>Subiendo archivos...</p>
          </div>
        )}
      </div>

      {filePaths.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-semibold text-slate-900 dark:text-white">
            Archivos subidos ({filePaths.length})
          </h4>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filePaths.map((url, index) => {
              const isPdf = url.toLowerCase().endsWith(".pdf")
              return (
                <div
                  key={url}
                  className="relative overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700"
                >
                  <div className="relative flex h-32 items-center justify-center bg-slate-100 dark:bg-slate-800">
                    {isPdf ? (
                      <FileText className="h-10 w-10 text-slate-400" />
                    ) : (
                      <Image src={url} alt={`Archivo ${index + 1}`} fill className="object-cover" unoptimized />
                    )}
                    {index === 0 && !isPdf && (
                      <span className="absolute left-2 top-2 rounded bg-blue-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                        Portada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2 p-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="truncate text-xs text-blue-600 hover:underline"
                    >
                      {isPdf ? `Archivo ${index + 1} (PDF)` : `Imagen ${index + 1}`}
                    </a>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemoveFile(url)}
                      className="shrink-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      aria-label={`Quitar archivo ${index + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * @description Formulario del paso 1: datos basicos y enlaces del proyecto.
 */
function ProjectDetailsForm({
  formData,
  onInputChange,
  techInput,
  onTechInputChange,
  onAddTechnology,
  onRemoveTechnology,
  formErrors,
}: ProjectDetailsFormProps) {
  return (
    <div className="space-y-6">
      {/* Título del Proyecto */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">
          Título del Proyecto <span className="text-red-500">*</span>
        </label>
        <Input
          name="projectTitle"
          value={formData.projectTitle}
          onChange={onInputChange}
          placeholder="Ej: Mi Aplicación Web Increíble"
          required
          className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${formErrors.title ? "border-red-500" : ""}`}
        />
        {formErrors.title && <p className="text-xs text-red-500">{formErrors.title}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">Nombre descriptivo de tu proyecto</p>
      </div>

      {/* Repository URL */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">Enlace del Repositorio/Código</label>
        <div className="relative">
          <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            name="githubUrl"
            value={formData.githubUrl}
            onChange={onInputChange}
            placeholder="https://github.com/usuario/repositorio"
            className={`pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${formErrors.githubUrl ? "border-red-500" : ""}`}
          />
        </div>
        {formErrors.githubUrl && <p className="text-xs text-red-500">{formErrors.githubUrl}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">URL pública de tu repositorio (GitHub, GitLab, etc.)</p>
      </div>

      {/* Demo URL */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">Enlace de Demo</label>
        <div className="relative">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            name="demoUrl"
            value={formData.demoUrl}
            onChange={onInputChange}
            placeholder="https://mi-aplicacion.vercel.app"
            className={`pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${formErrors.demoUrl ? "border-red-500" : ""}`}
          />
        </div>
        {formErrors.demoUrl && <p className="text-xs text-red-500">{formErrors.demoUrl}</p>}
        <p className="text-xs text-slate-500 dark:text-slate-400">URL de la versión desplegada de tu proyecto</p>
      </div>

      {/* Tecnologías */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">Tecnologías Usadas</label>
        <Input
          value={techInput}
          onChange={onTechInputChange}
          onKeyDown={onAddTechnology}
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
                onClick={() => onRemoveTechnology(tech)}
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

      {/* Notas para la IA */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">Notas para la IA</label>
        <Textarea
          name="aiNotes"
          value={formData.aiNotes}
          onChange={onInputChange}
          placeholder="Escribe notas o el README.md aquí... Incluye descripción del proyecto, características, instrucciones de instalación, etc."
          className="min-h-32 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 resize-none"
        />
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Proporciona contexto detallado para que la IA entienda mejor tu proyecto. Si no usas la IA, este texto se
          guarda como descripción del proyecto.
        </p>
      </div>
    </div>
  )
}

/**
 * @description Paso 4: resumen y vista previa de la tarjeta antes de guardar.
 */
function ReviewStep({
  title,
  technologies,
  description,
  githubUrl,
  demoUrl,
  filePaths,
  firstImage,
}: ReviewStepProps) {
  const checks = [
    { ok: Boolean(title.trim()), label: "Título del proyecto" },
    { ok: Boolean(description && description.trim()), label: "Descripción o notas" },
    { ok: Boolean(githubUrl.trim()), label: "Repositorio enlazado" },
    { ok: Boolean(demoUrl.trim()), label: "Demo enlazada" },
    { ok: filePaths.length > 0, label: `Archivos subidos (${filePaths.length})` },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-sm text-blue-800 dark:text-blue-200">
          Revisa la vista previa y la lista de comprobación. Al guardar, el proyecto aparece de inmediato en el sitio
          público.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr]">
        {/* Vista previa de la tarjeta */}
        <div>
          <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Vista previa de la tarjeta</h4>
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="relative flex h-40 items-center justify-center bg-slate-900">
              {firstImage ? (
                <Image src={firstImage} alt={title || "Proyecto"} fill className="object-cover object-top" unoptimized />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <ImageIcon className="h-8 w-8" />
                  <span className="text-xs">Sin captura</span>
                </div>
              )}
            </div>
            <div className="space-y-3 p-5">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {title.trim() || "Título del proyecto"}
              </h3>
              <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {description && description.trim()
                  ? `${description.trim().slice(0, 180)}${description.trim().length > 180 ? "…" : ""}`
                  : "Sin descripción todavía."}
              </p>
              {technologies.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {technologies.slice(0, 4).map((t) => (
                    <span
                      key={t}
                      className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                    >
                      {t}
                    </span>
                  ))}
                  {technologies.length > 4 && (
                    <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500 dark:border-slate-700 dark:bg-slate-800">
                      +{technologies.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lista de comprobación */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-white">Lista de comprobación</h4>
            <ul className="space-y-2">
              {checks.map((c) => (
                <li key={c.label} className="flex items-center gap-2 text-sm">
                  {c.ok ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
                  )}
                  <span className={c.ok ? "text-slate-700 dark:text-slate-300" : "text-slate-500 dark:text-slate-400"}>
                    {c.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {(githubUrl.trim() || demoUrl.trim()) && (
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Enlaces</h4>
              {githubUrl.trim() && (
                <a
                  href={githubUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {githubUrl.trim()}
                </a>
              )}
              {demoUrl.trim() && (
                <a
                  href={demoUrl.trim()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  {demoUrl.trim()}
                </a>
              )}
            </div>
          )}

          {description && description.length > MAX_DESCRIPTION && (
            <p className="text-xs text-amber-600">
              La descripción es muy larga ({description.length} caracteres). La tarjeta mostrará solo el inicio; el
              texto completo aparece en la ficha del proyecto.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
