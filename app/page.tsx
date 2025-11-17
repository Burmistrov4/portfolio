export const dynamic = 'force-dynamic';
import supabase from '@/lib/supabase'
import { HeroSection } from '@/components/hero-section'
import { ProjectsSection } from '@/components/projects-section'
import { CertificatesSection } from '@/components/certificates-section'

/**
 * @description Renders the home page with hero section and portfolio projects.
 * @returns {JSX.Element} The home page component.
 */
export default async function Home() {
  // Load profile data
  let profileData = null
  try {
    const { data: profile, error: profileError } = await supabase
      .from('profile')
      .select('*')
      .eq('id', 1)
      .single()

    profileData = profileError ? null : profile
  } catch (err) {
    console.error('Error fetching profile:', err)
  }

  // Load projects data
  let projects = []
  try {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    projects = data || []
  } catch (err) {
    console.error('Error fetching projects:', err)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <HeroSection profile={profileData} />
      <ProjectsSection projects={projects} />
      <CertificatesSection />
    </div>
  )
}
