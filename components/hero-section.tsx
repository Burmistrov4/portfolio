import { Button } from '@/components/ui/button'
import { Github, Linkedin, Download } from 'lucide-react'
import Image from 'next/image'
import { motion } from 'framer-motion'

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
 * @description Hero section component displaying profile information.
 * @param {HeroSectionProps} props The props containing profile data.
 * @returns {JSX.Element} The hero section.
 */
export function HeroSection({ profile }: HeroSectionProps) {
  if (!profile) {
    return (
      <section className="py-16 px-4 sm:px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-4">Bienvenido a Mi Portafolio</h1>
          <p className="text-xl opacity-90">Explora mis proyectos y trabajos</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-20 px-4 sm:px-8 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 text-white">
      <motion.div
        className="max-w-6xl mx-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Profile Image */}
          <div className="flex-shrink-0">
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.full_name}
                width={192}
                height={192}
                className="w-48 h-48 rounded-full object-cover border-4 border-white shadow-xl"
              />
            ) : (
              <div className="w-48 h-48 rounded-full bg-white/20 flex items-center justify-center border-4 border-white shadow-xl">
                <span className="text-6xl font-bold">
                  {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-5xl lg:text-6xl font-bold mb-4">
              {profile.full_name}
            </h1>
            <h2 className="text-2xl lg:text-3xl font-light mb-6 opacity-90">
              {profile.professional_title}
            </h2>
            <p className="text-lg lg:text-xl leading-relaxed mb-8 opacity-90 max-w-2xl">
              {profile.bio}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
              {profile.linkedin_url && (
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-white text-blue-600 hover:bg-gray-100"
                >
                  <a
                    href={profile.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="w-5 h-5" />
                    LinkedIn
                  </a>
                </Button>
              )}

              {profile.github_url && (
                <Button
                  asChild
                  variant="secondary"
                  size="lg"
                  className="bg-white text-gray-900 hover:bg-gray-100"
                >
                  <a
                    href={profile.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Github className="w-5 h-5" />
                    GitHub
                  </a>
                </Button>
              )}

              {profile.cv_pdf_url && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <a
                    href={profile.cv_pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Descargar CV
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  )
}