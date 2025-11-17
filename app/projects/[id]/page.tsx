import supabase from '@/lib/supabase'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'

interface Project {
  id: string
  title: string
  github_link: string | null
  demo_link: string | null
  technologies: string[]
  ai_description: string
  file_paths: string[]
}

/**
 * @description Renders the project detail page.
 * @param {Object} params The route parameters.
 * @returns {JSX.Element} The project detail page.
 */
export default async function ProjectDetail({ params }: { params: { id: string } }) {
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', params.id)
    .single()

  if (!project) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold">Proyecto no encontrado</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">{project.title}</h1>

        <div className="mb-6">
          {project.technologies.map((tech: string) => (
            <span key={tech} className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full mr-2 mb-2">
              {tech}
            </span>
          ))}
        </div>

        <div className="mb-6 prose dark:prose-invert max-w-none">
          <ReactMarkdown>{project.ai_description}</ReactMarkdown>
        </div>

        {project.file_paths && project.file_paths.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {project.file_paths.map((path: string, index: number) => (
              <div key={index} className="relative w-full h-64">
                <Image
                  src={path}
                  alt={`Imagen ${index + 1} del proyecto ${project.title}`}
                  fill
                  className="object-cover rounded-lg shadow-md"
                />
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-4">
          {project.github_link && (
            <a
              href={project.github_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver en GitHub
            </a>
          )}
          {project.demo_link && (
            <a
              href={project.demo_link}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Ver Demo
            </a>
          )}
        </div>
      </div>
    </div>
  )
}