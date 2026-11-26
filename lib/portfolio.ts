import supabase from '@/lib/supabase'
import type { Certificate, Profile, Project, Skill } from '@/lib/portfolio-types'

export { CONTACT, type Certificate, type Profile, type Project, type Skill } from '@/lib/portfolio-types'

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
