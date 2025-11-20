'use client'

import { Button } from '@/components/ui/button'
import { FileText, Github, Linkedin, Download, Sparkles, Sun, Moon } from 'lucide-react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useMemo } from 'react'
import { useTheme } from 'next-themes'

interface Profile {
  full_name: string
  professional_title: string
  bio: string
  linkedin_url: string
  github_url: string
  profile_image_url?: string
  cv_pdf_url?: string
}

interface HeroSectionProps {
  profile: Profile | null
}

/**
 * @description Modern hero section with intro animation and profile display.
 * @param {HeroSectionProps} props The props containing profile data.
 * @returns {JSX.Element} The hero section.
 */
export function HeroSection({ profile }: HeroSectionProps) {
  const [showIntro, setShowIntro] = useState(true)
  const [showMain, setShowMain] = useState(false)
  const [bgClicked, setBgClicked] = useState({ radial: false, blue: false, purple: false, cyan: false })
  const [ripples, setRipples] = useState<{id: number, x: number, y: number}[]>([])
  const [scatterParticles, setScatterParticles] = useState(false)
  const [typedText, setTypedText] = useState('')
  const [isTyping, setIsTyping] = useState(true)
  const { theme, setTheme } = useTheme()

  // Typing effect for professional title
  const fullText = useMemo(() => profile?.professional_title || 'Analista de Sistemas', [profile])

  // Generate stable particle positions
  const particlePositions = useMemo(() => {
    return [...Array(20)].map(() => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: Math.random() * 2,
      duration: 3 + Math.random() * 2,
    }))
  }, [])

  // Temporary hardcoded URLs for testing
  const testImageUrl = 'https://vnxplxyexntbcikjuxhg.supabase.co/storage/v1/object/public/profile/151fba6b-d3ae-470b-af73-29bba50d42e3-IMG_20240728_212519-removebg-preview.png'
  const testCvUrl = 'https://vnxplxyexntbcikjuxhg.supabase.co/storage/v1/object/public/profile/f02df04c-cd23-4547-a715-da47b42adced-Curriculum-Vitae-CV-Profesional-Beige_2.pdf'

  const displayImageUrl = profile?.profile_image_url || testImageUrl
  const displayCvUrl = profile?.cv_pdf_url || testCvUrl

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowIntro(false)
      setTimeout(() => setShowMain(true), 500)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  // Typing effect
  useEffect(() => {
    if (!showMain) return

    let index = 0
    const typeWriter = () => {
      if (index < fullText.length) {
        setTypedText(fullText.slice(0, index + 1))
        index++
        setTimeout(typeWriter, 100) // Typing speed
      } else {
        setIsTyping(false)
      }
    }

    const startTyping = setTimeout(() => {
      typeWriter()
    }, 1200) // Delay before starting typing

    return () => clearTimeout(startTyping)
  }, [showMain, fullText])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-transparent">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-20">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="bg-background/80 border-border hover:bg-accent/20 text-foreground"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>

      {/* Animated Background */}
      <div className="absolute inset-0" onClick={(e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setRipples(prev => [...prev, {id: Date.now(), x, y}])
        setScatterParticles(true)
        setTimeout(() => setScatterParticles(false), 2000)
      }}>
        <motion.div
          className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(var(--primary)/0.1),transparent_50%)] animate-pulse cursor-pointer"
          whileTap={{ scale: 1.05 }}
          transition={{ duration: 0.2 }}
        ></motion.div>
        <motion.div
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-bounce cursor-pointer"
          whileTap={{ scale: 1.2, rotate: 10 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-bounce cursor-pointer"
          style={{ animationDelay: '1s' }}
          whileTap={{ scale: 1.2, rotate: -10 }}
          transition={{ duration: 0.3 }}
        ></motion.div>
        <motion.div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-secondary/5 rounded-full blur-2xl animate-pulse cursor-pointer"
          whileTap={{ scale: 1.3 }}
          transition={{ duration: 0.4 }}
        ></motion.div>
      </div>

      {/* Floating Particles */}
      <div className="absolute inset-0">
        {particlePositions.map((pos, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-primary/20 rounded-full"
            style={{
              left: pos.left,
              top: pos.top,
            }}
            animate={scatterParticles ? {
              x: [0, (Math.random() - 0.5) * 200],
              y: [0, (Math.random() - 0.5) * 200],
              opacity: [0.8, 0],
              scale: [1, 0.5],
            } : {
              y: [-20, 20, -20],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={scatterParticles ? {
              duration: 2,
              ease: "easeOut",
            } : {
              duration: pos.duration,
              repeat: Infinity,
              delay: pos.delay,
            }}
          />
        ))}
      </div>

      {/* Ripples */}
      {ripples.map(ripple => (
        <motion.div
          key={ripple.id}
          className="absolute rounded-full bg-primary/30 pointer-events-none"
          style={{
            left: ripple.x - 50,
            top: ripple.y - 50,
            width: 100,
            height: 100,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 4, opacity: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          onAnimationComplete={() => setRipples(prev => prev.filter(r => r.id !== ripple.id))}
        />
      ))}

      {/* Intro Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <motion.h1
                className="text-6xl lg:text-8xl font-bold mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "linear",
                }}
                style={{
                  backgroundSize: "200% 200%",
                }}
              >
                Bienvenidos
              </motion.h1>
              <motion.p
                className="text-2xl lg:text-3xl text-blue-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.5 }}
              >
                a mi Resumen Curricular
              </motion.p>
              <motion.div
                className="mt-12 flex justify-center space-x-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-3 h-3 bg-blue-400 rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <AnimatePresence>
        {showMain && (
          <motion.div
            className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              {/* Profile Image */}
              <motion.div
                className="flex-shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-accent to-secondary p-1 animate-spin"
                    style={{ animationDuration: '8s' }}
                  >
                    <div className="w-full h-full rounded-full bg-background"></div>
                  </motion.div>
                  <div className="relative p-1 rounded-full bg-gradient-to-r from-accent via-primary to-secondary">
                    <Image
                      src={displayImageUrl}
                      alt={profile?.full_name || 'Profile'}
                      width={240}
                      height={240}
                      className="w-60 h-60 rounded-full object-cover border-4 border-background shadow-2xl"
                      unoptimized={true}
                    />
                  </div>
                  <motion.div
                    className="absolute -top-2 -right-2 bg-primary rounded-full p-2 cursor-pointer"
                    whileHover={{
                      rotate: 360,
                      scale: 1.2,
                      transition: { duration: 0.3 }
                    }}
                    whileTap={{
                      rotate: 720,
                      scale: 1.3,
                      transition: { duration: 0.2 }
                    }}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="w-6 h-6 text-primary-foreground" />
                  </motion.div>
                </div>
              </motion.div>

              {/* Profile Info */}
              <motion.div
                className="flex-1 text-foreground"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <motion.h1
                  className="text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary/80 to-accent bg-clip-text text-transparent"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  {profile?.full_name || 'Lorenzo Roca'}
                </motion.h1>

                <motion.h2
                  className="text-2xl lg:text-3xl font-light mb-8 text-accent relative"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  {typedText}
                  {isTyping && (
                    <span className="inline-block w-0.5 h-8 bg-accent ml-1 animate-pulse"></span>
                  )}
                </motion.h2>

                <motion.p
                  className="text-lg lg:text-xl leading-relaxed mb-12 text-muted-foreground max-w-3xl mx-auto lg:mx-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 1 }}
                >
                  {profile?.bio || 'Me especializo en el análisis, diseño e implementación de sistemas web full-stack modernos, con experiencia directa en la orquestación de servicios de Inteligencia Artificial (IA) y la arquitectura sin servidor (serverless).'}
                </motion.p>

                {/* CTA Buttons */}
                <motion.div
                  className="flex flex-wrap gap-6 justify-center lg:justify-start"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 1.2 }}
                >
                  {profile?.linkedin_url && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        asChild
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-primary-foreground border border-primary shadow-lg hover:shadow-primary/25 px-8 py-4 text-lg font-medium transition-all duration-300"
                      >
                        <a
                          href={profile.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3"
                        >
                          <Linkedin className="w-6 h-6" />
                          LinkedIn
                        </a>
                      </Button>
                    </motion.div>
                  )}

                  {profile?.github_url && (
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="relative"
                    >
                      <Button
                        asChild
                        size="lg"
                        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground border border-border shadow-lg hover:shadow-border/25 px-8 py-4 text-lg font-medium transition-all duration-300"
                      >
                        <a
                          href={profile.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3"
                        >
                          <Github className="w-6 h-6" />
                          GitHub
                        </a>
                      </Button>
                    </motion.div>
                  )}

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      asChild
                      size="lg"
                      className="bg-accent hover:bg-accent/90 text-accent-foreground border border-accent shadow-lg hover:shadow-accent/25 px-8 py-4 text-lg font-medium transition-all duration-300"
                    >
                      <a
                        href={displayCvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3"
                      >
                        <Download className="w-6 h-6" />
                        Curriculum Vitae
                      </a>
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <div className="w-6 h-10 border-2 border-border/30 rounded-full flex justify-center">
                <motion.div
                  className="w-1 h-3 bg-foreground/60 rounded-full mt-2"
                  animate={{ y: [0, 12, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}