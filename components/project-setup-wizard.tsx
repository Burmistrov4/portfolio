"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Github, LinkIcon, Zap, FileText, Sparkles, Loader2, Edit, Trash2, Plus } from "lucide-react"

interface Project {
  id: string
  title: string
  github_link: string
  demo_link: string
  technologies: string[]
  ai_summary: string
  ai_description: string
  file_paths: string[]
  created_at: string
}

const STEPS = [
  { id: 1, title: "Detalles", description: "Información básica del proyecto" },
  { id: 2, title: "Archivos", description: "Carga tus archivos" },
  { id: 3, title: "Generación IA", description: "Procesa con IA" },
]

/**
 * @description A wizard component for setting up project details.
 * @returns {JSX.Element} The project setup wizard.
 */
export function ProjectSetupWizard() {
  const [currentStep, setCurrentStep] = useState(1)
  const [projects, setProjects] = useState<Project[]>([])
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [isCreating, setIsCreating] = useState(false)
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
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [formErrors, setFormErrors] = useState({ title: '' })
  const [isLoadingAI, setIsLoadingAI] = useState(false)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const response = await fetch('/api/projects')
      if (response.ok) {
        const data = await response.json()
        setProjects(data)
      }
    } catch (error) {
      console.error('Error loading projects:', error)
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const handleStartCreating = () => {
    setIsCreating(true)
    setEditingProject(null)
    resetForm()
  }

  const handleEditProject = (project: Project) => {
    setEditingProject(project)
    setIsCreating(true)
    setFormData({
      projectTitle: project.title,
      githubUrl: project.github_link,
      demoUrl: project.demo_link,
      technologies: project.technologies,
      aiNotes: "",
      filePaths: project.file_paths,
    })
    setGeneratedData(project.ai_description || project.ai_summary)
    setCurrentStep(1)
  }

  const handleDeleteProject = async (projectId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proyecto?')) return

    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        setProjects(projects.filter(p => p.id !== projectId))
        alert('Proyecto eliminado exitosamente!')
      } else {
        alert('Error al eliminar el proyecto')
      }
    } catch (error) {
      console.error('Error deleting project:', error)
      alert('Error al eliminar el proyecto')
    }
  }

  const resetForm = () => {
    setFormData({
      projectTitle: "",
      githubUrl: "",
      demoUrl: "",
      technologies: [] as string[],
      aiNotes: "",
      filePaths: [] as string[],
    })
    setGeneratedData(null)
    setCurrentStep(1)
    setTechInput("")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (name === 'projectTitle' && formErrors.title) {
      setFormErrors({ title: '' })
    }
  }

  const validateStep1 = () => {
    if (!formData.projectTitle.trim()) {
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

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsTyping(true)

    try {
      const response = await fetch('/api/ai/generateDescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.projectTitle,
          technologies: formData.technologies,
          notes: formData.aiNotes,
          userMessage,
          conversationHistory: chatMessages
        })
      })
      const data = await response.json()
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.description }])
    } catch (error) {
      console.error('Error sending message:', error)
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Lo siento, hubo un error al generar la respuesta.' }])
    } finally {
      setIsTyping(false)
    }
  }

  const handleApplyDescription = () => {
    const lastAssistantMessage = chatMessages.filter(m => m.role === 'assistant').pop()
    if (lastAssistantMessage) {
      setGeneratedData(lastAssistantMessage.content)
    }
  }

  const handleFileUpload = async (files: FileList) => {
    if (!files || files.length === 0) return
    setIsUploading(true)
    try {
      const formDataUpload = new FormData()
      Array.from(files).forEach(file => {
        formDataUpload.append('files', file)
      })

      const response = await fetch('/api/projects/upload', {
        method: 'POST',
        body: formDataUpload
      })

      const result = await response.json()
      if (result.urls) {
        setFormData(prev => ({
          ...prev,
          filePaths: [...prev.filePaths, ...result.urls]
        }))
      } else {
        alert('Error al subir archivos: ' + result.error)
      }
    } catch (error) {
      console.error('Error uploading:', error)
      alert('Error al subir archivos')
    } finally {
      setIsUploading(false)
    }
  }

  const handleComplete = async () => {
    setIsSaving(true)
    try {
      // Determine description with fallback logic: generated > aiNotes > null
      const description = generatedData || formData.aiNotes || null

      const payload = {
        title: formData.projectTitle,
        github_link: formData.githubUrl,
        demo_link: formData.demoUrl,
        technologies: formData.technologies,
        ai_summary: description,
        ai_description: description,
        file_paths: formData.filePaths
      }

      let response
      if (editingProject) {
        response = await fetch(`/api/projects/${editingProject.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        response = await fetch('/api/projects/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      const result = await response.json()
      if (response.ok) {
        alert(`Proyecto ${editingProject ? 'actualizado' : 'guardado'} exitosamente!`)
        setIsCreating(false)
        setEditingProject(null)
        resetForm()
        loadProjects() // Reload projects
      } else {
        alert(`Error al ${editingProject ? 'actualizar' : 'guardar'}: ` + result.error)
      }
    } catch (error) {
      console.error('Error saving:', error)
      alert(`Error al ${editingProject ? 'actualizar' : 'guardar'} el proyecto`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white text-balance">
          Asistente de Carga de Proyectos
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Prepara tu proyecto en 3 sencillos pasos</p>
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
                  <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.role === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white'
                    }`}>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-slate-200 dark:bg-slate-700 px-4 py-2 rounded-lg">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
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
                    if (e.key === 'Enter' && !e.shiftKey) {
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
              {chatMessages.some(m => m.role === 'assistant') && (
                <div className="flex justify-center">
                  <Button
                    onClick={handleApplyDescription}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
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
        </CardContent>

        {/* Footer with Navigation */}
        <div className="border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-8 py-6 flex items-center justify-between gap-4">
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
            {currentStep === STEPS.length ? (isSaving ? 'Guardando...' : 'Completar') : 'Siguiente'}
          </Button>
        </div>
      </Card>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white text-balance">
          Gestión de Proyectos
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-lg">Administra tus proyectos existentes</p>
      </div>

      {/* Create New Project Button */}
      <div className="flex justify-center">
        <Button onClick={handleStartCreating} className="bg-blue-600 hover:bg-blue-700 text-white">
          <Plus className="w-4 h-4 mr-2" />
          Crear Nuevo Proyecto
        </Button>
      </div>

      {/* Projects List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="border-slate-200 dark:border-slate-700 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-slate-900 dark:text-white truncate">
                {project.title}
              </CardTitle>
              <CardDescription className="text-slate-600 dark:text-slate-400">
                {new Date(project.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-1">
                {project.technologies.slice(0, 3).map((tech) => (
                  <Badge key={tech} variant="secondary" className="text-xs">
                    {tech}
                  </Badge>
                ))}
                {project.technologies.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{project.technologies.length - 3}
                  </Badge>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleEditProject(project)}
                  size="sm"
                  variant="outline"
                  className="flex-1"
                >
                  <Edit className="w-3 h-3 mr-1" />
                  Editar
                </Button>
                <Button
                  onClick={() => handleDeleteProject(project.id)}
                  size="sm"
                  variant="destructive"
                  className="flex-1"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  Eliminar
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {projects.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            No hay proyectos aún
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Crea tu primer proyecto para comenzar
          </p>
          <Button onClick={handleStartCreating} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Crear Proyecto
          </Button>
        </div>
      )}
    </div>
  )
}

interface FileUploadStepProps {
  filePaths: string[]
  onFileUpload: (files: FileList) => void
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
  formErrors: { title: string }
}

/**
 * @description Component for uploading files.
 * @param {FileUploadStepProps} props The props for the file upload.
 * @returns {JSX.Element} The file upload component.
 */
function FileUploadStep({ filePaths, onFileUpload, isUploading }: FileUploadStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <Zap className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400 mb-6">
          Sube los archivos relacionados con tu proyecto (imágenes, documentos, etc.)
        </p>
      </div>

      <div className="space-y-4">
        <Input
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.txt,.md"
          onChange={(e) => e.target.files && onFileUpload(e.target.files)}
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
        <div className="space-y-2">
          <h4 className="font-semibold text-slate-900 dark:text-white">Archivos subidos:</h4>
          <ul className="space-y-1">
            {filePaths.map((url, index) => (
              <li key={index} className="text-sm text-slate-600 dark:text-slate-400">
                <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  Archivo {index + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/**
 * @description Form component for entering project details.
 * @param {ProjectDetailsFormProps} props The props for the form.
 * @returns {JSX.Element} The form component.
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
        <label className="block text-sm font-semibold text-slate-900 dark:text-white">Título del Proyecto</label>
        <Input
          name="projectTitle"
          value={formData.projectTitle}
          onChange={onInputChange}
          placeholder="Ej: Mi Aplicación Web Increíble"
          className={`h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 ${formErrors.title ? 'border-red-500' : ''}`}
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
            placeholder="https://github.com/usuario/repositorio o https://gitlab.com/..."
            className="pl-10 h-11 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
          />
        </div>
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
          Proporciona contexto detallado para que la IA entienda mejor tu proyecto
        </p>
      </div>
    </div>
  )
}
