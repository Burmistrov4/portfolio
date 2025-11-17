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

  const hardSkills = skills.filter(skill => skill.type === 'hard')
  const softSkills = skills.filter(skill => skill.type === 'soft')

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
    <Card className="w-80 border-border bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-primary">
          <Zap className="w-5 h-5" />
          Habilidades Técnicas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hard Skills */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Code className="w-4 h-4 text-cyan-400" />
            Hard Skills
          </h3>
          <div className="space-y-3">
            {hardSkills.map((skill, index) => (
              <motion.div
                key={skill.id}
                className="space-y-2"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-foreground">{skill.name}</span>
                  <span className="text-xs text-muted-foreground">{skill.level}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${skill.level}%` }}
                    transition={{
                      delay: index * 0.1 + 0.2,
                      duration: 1,
                      ease: "easeOut"
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 }
                    }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Soft Skills */}
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
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
                  className="bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border-purple-500/30 text-purple-200 hover:from-purple-500/30 hover:to-cyan-500/30 transition-all duration-300 cursor-pointer"
                >
                  {skill.name}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}