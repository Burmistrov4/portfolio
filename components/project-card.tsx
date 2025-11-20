import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface Project {
  id: string
  title: string
  ai_summary: string
  file_paths: string[]
  technologies?: string[]
}

interface ProjectCardProps {
  project: Project
}

/**
 * @description Component to display a project card.
 * @param {ProjectCardProps} props The props containing the project.
 * @returns {JSX.Element} The project card.
 */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/projects/${project.id}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          {project.file_paths && project.file_paths.length > 0 && !imageError && (
            <div className="relative w-full h-48">
              <Image
                src={project.file_paths[0]}
                alt={project.title}
                fill
                className="object-cover rounded-t-lg"
                onError={() => setImageError(true)}
              />
            </div>
          )}
          {(imageError || !project.file_paths || project.file_paths.length === 0) && (
            <div className="relative w-full h-48 bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 rounded-t-lg flex items-center justify-center">
              <div className="text-center text-slate-500 dark:text-slate-400">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">Sin imagen</p>
              </div>
            </div>
          )}
          <CardTitle className="text-xl">{project.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
            {project.ai_summary}
          </CardDescription>
        </CardContent>
      </Card>
    </Link>
    </motion.div>
  )
}