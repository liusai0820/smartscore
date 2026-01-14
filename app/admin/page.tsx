import { prisma } from '@/lib/db'
import AdminControls from '@/components/admin/AdminControls'
import DataUpload from '@/components/admin/DataUpload'
import Link from 'next/link'

export default async function AdminPage() {
  const [stateConfig, projectConfig] = await Promise.all([
    prisma.config.findUnique({ where: { key: 'scoring_state' } }),
    prisma.config.findUnique({ where: { key: 'current_project' } })
  ])

  // Quick stats
  const userCount = await prisma.user.count()
  const projectCount = await prisma.project.count()
  const scoreCount = await prisma.score.count()

  // Get all projects for selection
  const projects = await prisma.project.findMany({
    orderBy: { id: 'asc' }
  })

  return (
    <div className="min-h-screen bg-[var(--color-ink)] cloud-pattern">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* 顶部导航 */}
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span className="text-sm">返回</span>
            </Link>
            <div className="w-px h-6 bg-[var(--color-ink-soft)]" />
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)] flex items-center justify-center">
                <svg className="w-5 h-5 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                  管理控制台
                </h1>
                <p className="text-xs text-[var(--color-text-muted)]">系统配置与数据管理</p>
              </div>
            </div>
          </div>
          <Link
            href="/display"
            target="_blank"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] text-[var(--color-text-primary)] hover:border-[#d4a853] transition-colors"
          >
            <svg className="w-4 h-4 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium">打开大屏</span>
            <svg className="w-3 h-3 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </Link>
        </header>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="float-card p-5 text-center group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#c53d43]/10 border border-[#c53d43]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#c53d43]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div className="text-3xl font-black text-[var(--color-text-primary)] mb-1">{userCount}</div>
            <div className="text-[var(--color-text-muted)] text-sm">评审员</div>
          </div>
          <div className="float-card p-5 text-center group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#d4a853]/10 border border-[#d4a853]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <div className="text-3xl font-black text-[var(--color-text-primary)] mb-1">{projectCount}</div>
            <div className="text-[var(--color-text-muted)] text-sm">参评项目</div>
          </div>
          <div className="float-card p-5 text-center group">
            <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-[#7ec699]/10 border border-[#7ec699]/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-[#7ec699]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-3xl font-black text-[var(--color-text-primary)] mb-1">{scoreCount}</div>
            <div className="text-[var(--color-text-muted)] text-sm">已提交评分</div>
          </div>
        </div>

        {/* 系统控制 */}
        <AdminControls
          initialState={stateConfig?.value || 'CLOSED'}
          initialProjectId={projectConfig?.value || null}
          projects={projects}
        />

        {/* 数据上传 */}
        <div className="mt-8">
          <DataUpload />
        </div>
      </div>
    </div>
  )
}

