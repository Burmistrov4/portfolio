'use client'

import { useEffect, useState, useRef } from 'react'
import { CertificateCard } from '@/components/certificate-card'
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

  if (loading) {
    return (
      <section
        ref={sectionRef}
        className="relative py-16 px-4 sm:px-8 overflow-hidden cursor-pointer"
        onClick={createSplash}
        style={{
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 50%, rgba(20, 184, 166, 0.1) 100%)',
          border: '2px solid transparent',
          borderImage: 'linear-gradient(45deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3), rgba(20, 184, 166, 0.3)) 1',
          borderRadius: '24px',
          boxShadow: '0 0 40px rgba(16, 185, 129, 0.2), inset 0 0 40px rgba(16, 185, 129, 0.1)',
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
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 150, 105, 0.1) 50%, rgba(20, 184, 166, 0.1) 100%)',
        border: '2px solid transparent',
        borderImage: 'linear-gradient(45deg, rgba(16, 185, 129, 0.3), rgba(5, 150, 105, 0.3), rgba(20, 184, 166, 0.3)) 1',
        borderRadius: '0.5rem',
        boxShadow: '0 0 40px rgba(16, 185, 129, 0.2), inset 0 0 40px rgba(16, 185, 129, 0.1)',
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

      {/* Minimal Water Particles - Only 3 for performance */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
            style={{
              left: `${25 + i * 20}%`,
              top: `${35 + i * 15}%`,
            }}
            animate={{
              y: [-15, 15, -15],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              delay: i * 0.5,
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

        {certificates.length > 0 ? (
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
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              No hay certificados disponibles
            </p>
          </div>
        )}
      </div>
    </section>
  )
}