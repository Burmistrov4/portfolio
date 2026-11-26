import { HomeView } from '@/components/site/home-view'
import { getCertificates, getProfile, getProjects } from '@/lib/portfolio'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const [profile, projects, certificates] = await Promise.all([
    getProfile(),
    getProjects(),
    getCertificates(),
  ])

  return <HomeView profile={profile} projects={projects} certificates={certificates} />
}
