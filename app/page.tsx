import supabase from '@/lib/supabase'
import { HeroSection } from '@/components/hero-section'
import { ProjectsSection } from '@/components/projects-section'

/**
 * @description Renders the home page with hero section and portfolio projects.
 * @returns {JSX.Element} The home page component.
 */
export default async function Home() {
  // Load profile data
  const { data: profile, error: profileError } = await supabase
    .from('profile')
    .select('*')
    .eq('id', 1)
    .single()

  // Load projects data
  const { data: projects } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  // Handle profile loading error gracefully
  const profileData = profileError ? null : profile

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <HeroSection profile={profileData} />
      <ProjectsSection projects={projects || []} />
    </div>
  )
}
