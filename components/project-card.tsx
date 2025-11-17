import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
  return (
    <motion.div variants={cardVariants}>
      <Link href={`/projects/${project.id}`}>
        <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader>
          {project.file_paths && project.file_paths.length > 0 && (
            <div className="relative w-full h-48">
              <Image
                src={project.file_paths[0]}
                alt={project.title}
                fill
                className="object-cover rounded-t-lg"
              />
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