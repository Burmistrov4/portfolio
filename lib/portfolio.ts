import supabase from '@/lib/supabase'

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

/** Datos de contacto publicos (coherentes con el CV). */
export const CONTACT = {
  email: 'lorenzoroca333@gmail.com',
  phone: '0412-4661379',
  location: 'Valencia, Carabobo, Venezuela',
  linkedin: 'https://www.linkedin.com/in/lorenzo-roca-131391190/',
  github: 'https://github.com/Burmistrov4',
  portfolio: 'https://lorenzoroca.vercel.app',
}

export async function getProfile(): Promise<Profile | null> {
  const { data, error } = await supabase.from('profile').select('*').eq('id', 1).single()
  if (error) return null
  return data as Profile
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return data as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).single()
  if (error || !data) return null
  return data as Project
}

export async function getCertificates(): Promise<Certificate[]> {
  const { data, error } = await supabase
    .from('certificates')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !data) return []
  return (data as Certificate[]).filter((c) => c.is_published !== false)
}

export async function getSkills(): Promise<Skill[]> {
  const { data, error } = await supabase.from('skills').select('*').order('name')
  if (error || !data) return []
  return data as Skill[]
}
