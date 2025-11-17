'use client'

import { useState, useMemo } from 'react'
import { ProjectCard } from '@/components/project-card'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'

interface Project {
  id: string
  title: string
  ai_summary: string
  file_paths: string[]
  technologies: string[]
}

interface ProjectsSectionProps {
  projects: Project[]
}

/**
 * @description Projects section with filtering capabilities.
 * @param {ProjectsSectionProps} props The props containing projects data.
 * @returns {JSX.Element} The projects section.
 */
export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const [selectedTech, setSelectedTech] = useState<string | null>(null)

  // Get all unique technologies
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>()
    projects.forEach(project => {
      project.technologies?.forEach(tech => techSet.add(tech))
    })
    return Array.from(techSet).sort()
  }, [projects])

  // Filter projects based on selected technology
  const filteredProjects = useMemo(() => {
    if (!selectedTech) return projects
    return projects.filter(project =>
      project.technologies?.includes(selectedTech)
    )
  }, [projects, selectedTech])

  return (
    <section className="py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Mis Proyectos
        </h2>

        {/* Technology Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <Badge
            variant={selectedTech === null ? "default" : "secondary"}
            className="cursor-pointer px-4 py-2 text-sm"
            onClick={() => setSelectedTech(null)}
          >
            Todos
          </Badge>
          {allTechnologies.map(tech => (
            <Badge
              key={tech}
              variant={selectedTech === tech ? "default" : "secondary"}
              className="cursor-pointer px-4 py-2 text-sm"
              onClick={() => setSelectedTech(selectedTech === tech ? null : tech)}
            >
              {tech}
            </Badge>
          ))}
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={{
              hidden: { opacity: 1 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {selectedTech
                ? `No hay proyectos con la tecnología "${selectedTech}"`
                : "No hay proyectos disponibles"
              }
            </p>
          </div>
        )}
      </div>
    </section>
  )
}