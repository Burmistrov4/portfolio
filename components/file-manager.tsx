'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Trash2, Eye, FileText, Image as ImageIcon, Check, X, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'

interface FileItem {
  name: string
  size: number
  created_at: string
  updated_at: string
  url: string
  type: 'pdf' | 'image'
}

interface FileManagerProps {
  onFileSelect?: (file: FileItem | null) => void
  selectedFile?: FileItem | null
  title?: string
}

/**
 * @description File manager component for selecting and managing uploaded files.
 * @param {FileManagerProps} props The props containing callbacks and selection state.
 * @returns {JSX.Element} The file manager component.
 */
export function FileManager({ onFileSelect, selectedFile, title = "Gestión de Archivos" }: FileManagerProps) {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [deletingFile, setDeletingFile] = useState<string | null>(null)
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      const response = await fetch('/api/profile/files')
      const data = await response.json()
      if (response.ok) {
        setFiles(data.files)
      } else {
        console.error('Error loading files:', data.error)
      }
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const deleteFile = async (filename: string) => {
    setDeletingFile(filename)
    try {
      const response = await fetch('/api/profile/files', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename })
      })

      if (response.ok) {
        setFiles(prev => prev.filter(file => file.name !== filename))
        // If the deleted file was selected, clear selection
        if (selectedFile?.name === filename && onFileSelect) {
          onFileSelect(null as any)
        }
      } else {
        const data = await response.json()
        alert('Error al eliminar archivo: ' + data.error)
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Error al eliminar archivo')
    } finally {
      setDeletingFile(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card className="border-slate-200 dark:border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Cargando archivos...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {files.length} archivo{files.length !== 1 ? 's' : ''}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {files.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No hay archivos subidos aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {files.map((file) => (
                <motion.div
                  key={file.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className={`relative border rounded-lg p-4 transition-all duration-200 ${
                    selectedFile?.name === file.name
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {/* Selection indicator */}
                  {selectedFile?.name === file.name && (
                    <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                      <Check className="w-3 h-3" />
                    </div>
                  )}

                  {/* File preview */}
                  <div className="aspect-square mb-3 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                    {file.type === 'image' ? (
                      <Image
                        src={file.url}
                        alt={file.name}
                        width={100}
                        height={100}
                        className="w-full h-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <FileText className="w-12 h-12 text-slate-400" />
                    )}
                  </div>

                  {/* File info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {file.type === 'image' ? (
                        <ImageIcon className="w-4 h-4 text-green-500" />
                      ) : (
                        <FileText className="w-4 h-4 text-red-500" />
                      )}
                      <Badge variant="outline" className="text-xs">
                        {file.type.toUpperCase()}
                      </Badge>
                    </div>

                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatFileSize(file.size)}
                    </p>

                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatDate(file.created_at)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => setPreviewFile(file)}
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Ver
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{file.name}</DialogTitle>
                        </DialogHeader>
                        <div className="flex flex-col items-center space-y-4">
                          {file.type === 'image' ? (
                            <Image
                              src={file.url}
                              alt={file.name}
                              width={500}
                              height={500}
                              className="max-w-full max-h-96 object-contain rounded-lg"
                              unoptimized
                            />
                          ) : (
                            <div className="flex flex-col items-center space-y-4">
                              <FileText className="w-24 h-24 text-slate-400" />
                              <p className="text-center text-slate-600 dark:text-slate-400">
                                Archivo PDF - {formatFileSize(file.size)}
                              </p>
                              <Button asChild>
                                <a
                                  href={file.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  Abrir PDF
                                </a>
                              </Button>
                            </div>
                          )}
                          <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
                            Subido el {formatDate(file.created_at)}
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {onFileSelect && (
                      <Button
                        variant={selectedFile?.name === file.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => onFileSelect(selectedFile?.name === file.name ? null : file)}
                        className="flex-1"
                      >
                        {selectedFile?.name === file.name ? (
                          <>
                            <X className="w-3 h-3 mr-1" />
                            Quitar
                          </>
                        ) : (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Seleccionar
                          </>
                        )}
                      </Button>
                    )}

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletingFile === file.name}
                        >
                          {deletingFile === file.name ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El archivo {"\""} {file.name} {"\""} será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteFile(file.name)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </CardContent>
    </Card>
  )
}