'use client'

import { useEffect, useState } from 'react'
import { CertificateCard } from '@/components/certificate-card'
import supabase from '@/lib/supabase'

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

  useEffect(() => {
    const fetchCertificates = async () => {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching certificates:', error)
      } else {
        setCertificates(data || [])
      }
      setLoading(false)
    }

    fetchCertificates()
  }, [])

  if (loading) {
    return (
      <section className="py-16 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
            Mis Certificados
          </h2>
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400 text-lg">Cargando certificados...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 px-4 sm:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-center mb-12 text-slate-900 dark:text-white">
          Mis Certificados
        </h2>

        {certificates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {certificates.map((certificate) => (
              <CertificateCard key={certificate.id} certificate={certificate} />
            ))}
          </div>
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