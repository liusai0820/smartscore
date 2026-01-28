import { prisma } from '@/lib/db'
import { getCurrentUser, clearSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ProjectCard from '@/components/ui/ProjectCard'
import AutoRefresher from '@/components/ui/AutoRefresher'

async function LogoutButton() {
  'use server'
  await clearSession()
  redirect('/login')
}

export default async function DashboardPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch system state and current project
  const [stateConfig, projectConfig] = await Promise.all([
    prisma.config.findUnique({ where: { key: 'scoring_state' } }),
    prisma.config.findUnique({ where: { key: 'current_project' } })
  ])

  const isScoringOpen = stateConfig?.value === 'SCORING'
  const currentProjectId = projectConfig?.value || null

  // Fetch current project only (if set)
  const currentProject = currentProjectId
    ? await prisma.project.findUnique({ where: { id: currentProjectId } })
    : null

  // Fetch user's existing scores
  const userScores = await prisma.score.findMany({
    where: { userId: user.id },
    select: {
      projectId: true,
      dataScore: true,
      infoScore: true,
      knowScore: true,
      insightScore: true,
      approvalScore: true,
      awardScore: true
    }
  })

  // Create a map for easier lookup
  type ScoreData = typeof userScores[number]
  const scoreMap = new Map<string, ScoreData>(userScores.map((s: ScoreData) => [s.projectId, s]))

  // Check if current project is from user's own department
  const isOwnDepartment = currentProject?.department === user.department

  // Get existing score for current project
  const existingScore: ScoreData | null = currentProjectId ? (scoreMap.get(currentProjectId) ?? null) : null

  // Get total counts for progress
  const totalProjects = await prisma.project.count()
  const scoredByUser = userScores.length

  return (
    <div className="min-h-screen bg-[var(--color-ink)] pb-24">
      <AutoRefresher
        initialState={stateConfig?.value || 'CLOSED'}
        initialProjectId={currentProjectId}
      />
      {/* 顶部导航栏 */}
      <header className="bg-[var(--color-ink-light)] border-b border-[var(--color-ink-soft)] sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              {/* Logo */}
              <div className="w-10 h-10 rounded-lg vermilion-gradient flex items-center justify-center shadow-lg shadow-[#c53d43]/20">
                <svg className="w-5 h-5 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                  智评
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">
                  {user.name} · {user.department}
                </p>
              </div>
            </div>
            <form action={LogoutButton}>
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-muted)] hover:text-[#e85a5a] transition-colors rounded-lg hover:bg-[#c53d43]/10">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                退出
              </button>
            </form>
          </div>
        </div>

        {/* 状态栏 */}
        <div className={`px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-2 ${isScoringOpen
          ? 'bg-gradient-to-r from-[#7ec699]/10 via-[#7ec699]/20 to-[#7ec699]/10 text-[#7ec699] border-t border-[#7ec699]/20'
          : 'bg-gradient-to-r from-[#c53d43]/10 via-[#c53d43]/20 to-[#c53d43]/10 text-[#e85a5a] border-t border-[#c53d43]/20'
          }`}>
          <span className={`w-2 h-2 rounded-full ${isScoringOpen ? 'bg-[#7ec699] animate-pulse' : 'bg-[#e85a5a]'}`} />
          {isScoringOpen ? '评分进行中' : '评分已关闭'}
        </div>
      </header>

      {/* 主内容区 */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 进度概览 */}
        <div className="float-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-[var(--color-text-secondary)] text-sm font-medium">评分进度</span>
            </div>
            <span className="text-[#d4a853] font-bold">{scoredByUser} / {totalProjects}</span>
          </div>
          <div className="relative h-3 bg-[var(--color-ink-medium)] rounded-full overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full amber-gradient transition-all duration-500 ease-out"
              style={{ width: `${totalProjects > 0 ? (scoredByUser / totalProjects) * 100 : 0}%` }}
            />
          </div>
          <p className="text-xs text-[var(--color-text-muted)] mt-2 text-center">
            {scoredByUser === totalProjects ? '已完成所有评分' : `还有 ${totalProjects - scoredByUser} 个项目待评分`}
          </p>
        </div>

        {/* 当前待评项目 */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2 mb-4">
            <svg className="w-5 h-5 text-[#c53d43]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            当前待评项目
          </h2>

          {!currentProject ? (
            <div className="float-card p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-[var(--color-ink-soft)] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[var(--color-text-primary)] text-lg font-medium mb-2">等待主持人开启项目评分</p>
              <p className="text-[var(--color-text-muted)] text-sm">请耐心等待，当前暂无需要评分的项目</p>
            </div>
          ) : isOwnDepartment ? (
            <div className="float-card p-8 text-center border-2 border-[#d4a853]/30">
              <svg className="w-16 h-16 mx-auto text-[#d4a853] mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-[#d4a853] text-lg font-medium mb-2">本项目需要回避</p>
              <p className="text-[var(--color-text-muted)] text-sm">您与该项目属于同一部门，无需评分</p>
              <div className="mt-4 p-4 rounded-lg bg-[var(--color-ink-medium)]">
                <p className="text-[var(--color-text-primary)] font-medium">{currentProject.name}</p>
                <p className="text-[var(--color-text-muted)] text-sm mt-1">{currentProject.department} · {currentProject.presenter}</p>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in-up">
              <ProjectCard
                project={currentProject}
                currentUser={user}
                existingScore={existingScore}
                isScoringOpen={isScoringOpen}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
