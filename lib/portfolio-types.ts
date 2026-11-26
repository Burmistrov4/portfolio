export interface Profile {
  id?: number
  full_name: string | null
  professional_title: string | null
  bio: string | null
  profile_image_url: string | null
  cv_pdf_url: string | null
  linkedin_url: string | null
  github_url: string | null
}

export interface Project {
  id: string
  created_at: string | null
  title: string
  github_link: string | null
  demo_link: string | null
  technologies: string[] | null
  ai_summary: string | null
  ai_description: string | null
  file_paths: string[] | null
}

export interface Certificate {
  id: string
  title: string
  description: string | null
  cert_url: string | null
  technologies: string[] | null
  is_published: boolean | null
}

export interface Skill {
  id?: number
  name: string
  type: string | null
  level: string | null
}

/** Datos de contacto públicos (seguros para cliente y servidor). */
export const CONTACT = {
  email: 'lorenzoroca333@gmail.com',
  phone: '0412-4661379',
  location: 'Flor Amarillo, Valencia, Carabobo',
  linkedin: 'https://www.linkedin.com/in/lorenzo-roca-131391190/',
  github: 'https://github.com/Burmistrov4',
  portfolio: 'https://lorenzoroca.vercel.app',
}
