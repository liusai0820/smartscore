import { prisma } from '@/lib/db'
import { getCurrentUser, logoutUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProjectCard from '@/components/ui/ProjectCard'
import { headers } from 'next/headers'

async function LogoutButton() {
  'use server'
  await logoutUser()
  redirect('/login')
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch system state
  const config = await prisma.config.findUnique({
    where: { key: 'scoring_state' }
  })
  const isScoringOpen = config?.value === 'SCORING'

  // Fetch projects
  const projects = await prisma.project.findMany({
    orderBy: { createdAt: 'asc' } // Or by some other order
  })

  // Fetch user's existing scores
  const userScores = await prisma.score.findMany({
    where: { userId: user.id }
  })

  // Create a map for easier lookup
  const scoreMap = new Map(userScores.map(s => [s.projectId, s.value]))

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold text-gray-900">SmartScore</h1>
            <p className="text-xs text-gray-500">
              {user.name} ({user.department})
            </p>
          </div>
          <form action={LogoutButton}>
            <button className="text-sm text-red-600 hover:text-red-800">
              Logout
            </button>
          </form>
        </div>
        {/* Status Bar */}
        <div className={`px-4 py-2 text-center text-sm font-medium ${
          isScoringOpen ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {isScoringOpen ? '🟢 Scoring is OPEN' : '🔴 Scoring is CLOSED'}
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="space-y-6">
          {projects.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No projects found.</p>
          ) : (
            projects.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                currentUser={user}
                initialScore={scoreMap.get(project.id)}
                isScoringOpen={isScoringOpen}
              />
            ))
          )}
        </div>
      </main>
    </div>
  )
}
