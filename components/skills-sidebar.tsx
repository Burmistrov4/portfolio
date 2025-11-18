"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Code, Users, Zap } from "lucide-react"

interface Skill {
  id: string
  name: string
  type: 'hard' | 'soft'
  level: number
}

/**
 * @description Skills sidebar component displaying hard and soft skills.
 * @returns {JSX.Element} The skills sidebar.
 */
export function SkillsSidebar() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSkills()
  }, [])

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/skills')
      const data = await response.json()
      if (response.ok) {
        setSkills(data)
      } else {
        console.error('Error fetching skills:', data)
      }
    } catch (error) {
      console.error('Error fetching skills:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const hardSkills = [
    { id: '1', name: 'Python', description: 'Lenguaje de programación versátil para desarrollo backend y análisis de datos' },
    { id: '2', name: 'VB.NET', description: 'Desarrollo de aplicaciones Windows y sistemas empresariales' },
    { id: '3', name: 'HTML/CSS/JavaScript', description: 'Tecnologías fundamentales para desarrollo web frontend' },
    { id: '4', name: 'Microsoft Excel', description: 'Análisis de datos, automatización y reporting avanzado' }
  ]

  const softSkills = [
    ...skills.filter(skill => skill.type === 'soft'),
    { id: 'custom-1', name: 'Trabajo bajo presión', type: 'soft' as const }
  ]

  if (isLoading) {
    return (
      <div className="w-80 h-96 bg-card rounded-lg border animate-pulse">
        <div className="p-6 space-y-4">
          <div className="h-6 bg-muted rounded w-3/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
            <div className="h-4 bg-muted rounded w-4/5"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="w-80 relative"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Neon Border Animation */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-0.5 animate-pulse">
        <div className="w-full h-full rounded-lg bg-slate-900"></div>
      </div>

      <Card className="relative w-full border-0 bg-slate-900/90 backdrop-blur-sm text-white">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-cyan-400">
            <Zap className="w-5 h-5" />
            Habilidades Técnicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Hard Skills */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-cyan-300">
              <Code className="w-4 h-4 text-cyan-400" />
              Hard Skills
            </h3>
            <div className="space-y-3">
              {hardSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  className="p-3 rounded-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-cyan-500/20 hover:border-cyan-400/40 transition-all duration-300"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 0 20px rgba(34, 211, 238, 0.3)",
                    transition: { duration: 0.3 }
                  }}
                >
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-cyan-200 block">{skill.name}</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{skill.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-purple-300">
              <Users className="w-4 h-4 text-purple-400" />
              Soft Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {softSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    delay: index * 0.05 + 0.5,
                    type: "spring",
                    stiffness: 200
                  }}
                  whileHover={{
                    scale: 1.1,
                    rotate: [0, -2, 2, 0],
                    transition: { duration: 0.3 }
                  }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-purple-200 hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-purple-500/25"
                  >
                    {skill.name}
                  </Badge>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}