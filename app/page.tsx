export const dynamic = 'force-dynamic';
export const revalidate = 0;
// Force redeploy 3
import supabase from '@/lib/supabase'
import { HeroSection } from '@/components/hero-section'
import { ProjectsSection } from '@/components/projects-section'
import { CertificatesSection } from '@/components/certificates-section'
import { SkillsSidebar } from '@/components/skills-sidebar'

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

    console.log('Fetched profile data:', profile, 'error:', profileError)
    profileData = profileError ? null : profile
  } catch (err) {
    console.error('Error fetching profile:', err)
  }

  // Load projects data
  let projects = []
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    console.log('Projects fetched in Home - Raw data:', data)
    console.log('Projects fetched in Home - Error:', error)

    if (error) {
      console.error('Error fetching projects:', error)
    } else {
      // Process projects to generate proper image URLs
      projects = (data || []).map(project => ({
        ...project,
        // Generate public URLs for images stored in project-files bucket
        file_paths: project.file_paths?.map((filePath: string) =>
          supabase.storage.from('project-files').getPublicUrl(filePath).data.publicUrl
        ) || [],
        // Ensure links are properly handled
        github_link: project.github_link || null,
        demo_link: project.demo_link || null,
      }))
    }

    console.log('Projects fetched in Home - Processed:', projects)
  } catch (err) {
    console.error('Error fetching projects:', err)
  }

  return (
    <div className="min-h-screen">
      <HeroSection profile={profileData} />
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Skills Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SkillsSidebar />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-16">
            <ProjectsSection projects={projects} />
            <CertificatesSection />
          </div>
        </div>
      </div>
    </div>
  )
}
