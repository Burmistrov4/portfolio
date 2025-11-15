export const dynamic = 'force-dynamic'

import { ProjectSetupWizard } from "@/components/project-setup-wizard"

/**
 * @description Renders the admin setup wizard page.
 * @returns {JSX.Element} The setup wizard page.
 */
export default function SetupWizardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <ProjectSetupWizard />
      </div>
    </div>
  )
}