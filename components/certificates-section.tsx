'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { CertificateCard } from '@/components/certificate-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import supabase from '@/lib/supabase-client'
import { motion } from 'framer-motion'

interface Certificate {
  id: string
  title: string
  description: string
  technologies: string[]
  cert_url: string
}

/**
 * @description Section component to display published certificates.
 * @returns {JSX.Element} The certificates section.
 */
export function CertificatesSection() {
   const [certificates, setCertificates] = useState<Certificate[]>([])
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   const [selectedTech, setSelectedTech] = useState<string | null>(null)
   const [showTags, setShowTags] = useState(true)
   const [ripples, setRipples] = useState<Array<{
     id: number,
     x: number,
     y: number
   }>>([])
   const sectionRef = useRef<HTMLElement>(null)

  const createSplash = (event: React.MouseEvent) => {
    if (!sectionRef.current) return

    const rect = sectionRef.current.getBoundingClientRect()
    const clickX = event.clientX - rect.left
    const clickY = event.clientY - rect.top

    // Simple ripple effect - just create expanding circles
    const rippleId = Date.now()
    const newRipple = {
      id: rippleId,
      x: clickX,
      y: clickY
    }

    setRipples(prev => [...prev, newRipple])

    // Remove after animation completes
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== rippleId))
    }, 800)
  }

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const { data, error } = await supabase
          .from('certificates')
          .select('*')
          .eq('is_published', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching certificates:', error)
          setError('Error al cargar los certificados. Por favor, intenta de nuevo más tarde.')
        } else {
          setCertificates(data || [])
          setError(null)
        }
      } catch (err) {
        console.error('Unexpected error fetching certificates:', err)
        setError('Error de conexión. Verifica tu conexión a internet.')
      } finally {
        setLoading(false)
      }
    }

    fetchCertificates()
  }, [])

  // Get all unique technologies
  const allTechnologies = useMemo(() => {
    const techSet = new Set<string>()
    certificates.forEach(certificate => {
      certificate.technologies?.forEach(tech => techSet.add(tech))
    })
    return Array.from(techSet).sort()
  }, [certificates])

  // Filter certificates based on selected technology
  const filteredCertificates = useMemo(() => {
    if (!selectedTech) return certificates
    return certificates.filter(certificate =>
      certificate.technologies?.includes(selectedTech)
    )
  }, [certificates, selectedTech])

  if (loading) {
    return (
      <section
        ref={sectionRef}
        className="relative py-16 px-4 sm:px-8 overflow-hidden cursor-pointer"
        onClick={createSplash}
        style={{
          background: 'hsl(var(--background))',
          border: '2px solid transparent',
          borderImage: 'linear-gradient(45deg, hsl(var(--accent) / 0.3), hsl(var(--primary) / 0.2)) 1',
          borderRadius: '0.5rem',
          boxShadow: '0 0 40px hsl(var(--accent) / 0.1), inset 0 0 40px hsl(var(--accent) / 0.05)',
          backdropFilter: 'blur(10px)',
          position: 'relative'
        }}
      >
        {/* Water Ripple Effects - Simple expanding circles */}
        {ripples.map((ripple) => (
          <motion.div
            key={ripple.id}
            className="absolute pointer-events-none"
            style={{
              left: ripple.x - 20,
              top: ripple.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.2) 50%, transparent 70%)',
              zIndex: 1,
            }}
            initial={{ scale: 0, opacity: 0.8 }}
            animate={{ scale: 2, opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        ))}
  
        {/* Animated Water Background */}
        <div className="absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-green-50/30 to-teal-50/40 dark:from-emerald-950/40 dark:via-green-950/30 dark:to-teal-950/40"></div>
  
          {/* Water-like flowing elements */}
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-200/15 rounded-full blur-3xl"
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 30, 0],
              y: [0, -20, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-green-200/15 rounded-full blur-3xl"
            animate={{
              scale: [1.2, 1, 1.2],
              x: [0, -25, 0],
              y: [0, 15, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2
            }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-teal-200/10 rounded-full blur-2xl"
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        </div>
  
        {/* Enhanced Light Particles */}
        <div className="absolute inset-0">
          {[...Array(18)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-300/40 rounded-full shadow-lg"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: '0 0 10px rgba(16, 185, 129, 0.6), 0 0 20px rgba(16, 185, 129, 0.4)',
              }}
              animate={{
                y: [-35, 35, -35],
                x: [-15, 15, -15],
                opacity: [0.2, 0.9, 0.2],
                scale: [0.8, 1.3, 0.8],
              }}
              transition={{
                duration: 5 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 3,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
  
        {/* Additional water surface effect */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-100/5 to-emerald-200/10 dark:from-transparent dark:via-emerald-900/5 dark:to-emerald-800/10 rounded-3xl"></div>
  
        <div className="relative z-10 max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-12 text-foreground"
            style={{
              textShadow: '0 0 20px hsl(var(--accent) / 0.5), 0 0 40px hsl(var(--accent) / 0.3)',
            }}
            animate={{
              textShadow: [
                '0 0 20px hsl(var(--accent) / 0.5), 0 0 40px hsl(var(--accent) / 0.3)',
                '0 0 25px hsl(var(--primary) / 0.6), 0 0 50px hsl(var(--primary) / 0.4)',
                '0 0 20px hsl(var(--accent) / 0.5), 0 0 40px hsl(var(--accent) / 0.3)'
              ]
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            Mis Certificados
          </motion.h2>
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">Cargando certificados...</p>
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Mis Certificados
          </h2>
          <div className="text-center py-12">
            <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      className="relative py-16 px-4 sm:px-8 overflow-hidden cursor-pointer"
      onClick={createSplash}
      style={{
        background: '#161B22',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(45deg, #0078FF 0.3, #0078FF 0.2) 1',
        borderRadius: '0.5rem',
        boxShadow: '0 0 40px rgba(0, 120, 255, 0.1), inset 0 0 40px rgba(0, 120, 255, 0.05)',
        backdropFilter: 'blur(10px)',
        position: 'relative'
      }}
    >
      {/* Water Ripple Effects - Simple expanding circles */}
      {ripples.map((ripple) => (
        <motion.div
          key={ripple.id}
          className="absolute pointer-events-none"
          style={{
            left: ripple.x - 20,
            top: ripple.y - 20,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.4) 0%, rgba(5, 150, 105, 0.2) 50%, transparent 70%)',
            zIndex: 1,
          }}
          initial={{ scale: 0, opacity: 0.8 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      ))}

      {/* Subtle Water Surface Effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-50/10 to-emerald-100/15 dark:from-transparent dark:via-emerald-950/10 dark:to-emerald-900/15 rounded-lg"></div>

      {/* Enhanced Water Particles - Increased count with luminosity */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              left: `${10 + (i * 12) % 80}%`,
              top: `${20 + (i * 15) % 60}%`,
              width: `${2 + (i % 3)}px`,
              height: `${2 + (i % 3)}px`,
              background: `radial-gradient(circle, hsl(var(--accent) / ${0.4 + (i % 3) * 0.2}), transparent)`,
              boxShadow: `0 0 ${4 + (i % 3) * 2}px hsl(var(--accent) / ${0.6 + (i % 3) * 0.2})`,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.1, 0.8, 0.1],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 8 + (i % 3) * 2,
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Subtle Light Bursts */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={`burst-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${20 + i * 30}%`,
              top: `${30 + i * 20}%`,
              width: '120px',
              height: '120px',
              background: `radial-gradient(circle, hsl(var(--primary) / 0.1), transparent 70%)`,
            }}
            animate={{
              scale: [0.8, 1.2, 0.8],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.h2
          className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white"
          style={{
            textShadow: '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
          }}
          animate={{
            textShadow: [
              '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)',
              '0 0 25px rgba(5, 150, 105, 0.6), 0 0 50px rgba(5, 150, 105, 0.4)',
              '0 0 20px rgba(16, 185, 129, 0.5), 0 0 40px rgba(16, 185, 129, 0.3)'
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Mis Certificados
        </motion.h2>

        {/* Technology Filter */}
        {allTechnologies.length > 0 && (
           <div className="flex flex-wrap justify-center gap-2 mb-8">
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
         )}

         {/* Toggle Tags Button */}
         <div className="flex justify-center mb-8">
           <Button
             variant="outline"
             size="sm"
             onClick={() => setShowTags(!showTags)}
             className="flex items-center gap-2"
           >
             {showTags ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
             {showTags ? 'Ocultar Etiquetas' : 'Mostrar Etiquetas'}
           </Button>
         </div>

        {filteredCertificates.length > 0 ? (
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
            {filteredCertificates.map((certificate) => (
               <CertificateCard key={certificate.id} certificate={certificate} showTags={showTags} />
             ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              {selectedTech
                ? `No hay certificados con la tecnología "${selectedTech}"`
                : "No hay certificados disponibles"
              }
            </p>
          </div>
        )}
      </div>
    </section>
  )
}