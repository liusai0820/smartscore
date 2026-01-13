import { prisma } from '@/lib/db'
import AdminControls from '@/components/admin/AdminControls'
import DataUpload from '@/components/admin/DataUpload'
import Link from 'next/link'

// We should protect this page, but for MVP we assume it's "hidden" or protected by auth middleware later.
// For now, let's just render it.

export default async function AdminPage() {
  const config = await prisma.config.findUnique({
    where: { key: 'scoring_state' }
  })

  // Quick stats
  const userCount = await prisma.user.count()
  const projectCount = await prisma.project.count()
  const scoreCount = await prisma.score.count()

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <Link href="/display" className="text-blue-600 hover:underline" target="_blank">
            Open Display View ↗
          </Link>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-2xl font-bold">{userCount}</div>
            <div className="text-gray-500 text-sm">Users</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-2xl font-bold">{projectCount}</div>
            <div className="text-gray-500 text-sm">Projects</div>
          </div>
          <div className="bg-white p-4 rounded shadow text-center">
            <div className="text-2xl font-bold">{scoreCount}</div>
            <div className="text-gray-500 text-sm">Total Scores</div>
          </div>
        </div>

        <AdminControls initialState={config?.value || 'CLOSED'} />

        <div className="mt-8">
          <DataUpload />
        </div>
      </div>
    </div>
  )
}
