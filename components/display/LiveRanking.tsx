'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { clsx } from 'clsx'

type ReviewerStatus = {
  id: string
  name: string
  role: string
  department: string
  hasVoted: boolean
}

type Project = {
  id: string
  name: string
  department: string
  presenter: string
  description?: string
}

type Result = {
  id: string
  name: string
  department: string
  presenter: string
  scoreCount: number
  leaderAvg: number | null
  deptHeadAvg: number | null
  finalScore: number | null
  avgValueScore: number | null
  avgInnovScore: number | null
  avgFeasiScore: number | null
  avgOutputScore: number | null
  standardDeviation: number | null
}

type ApiResponse = {
  state: string
  currentProject: Project | null
  reviewerStatuses: ReviewerStatus[]
  totalReviewers: number
  votedCount: number
  results: Result[]
}

export default function LiveRanking() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'OVERALL' | 'DIMENSIONS' | 'CONSISTENCY'>('OVERALL')

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/display/stats')
      setData(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch stats', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 2000)
    return () => clearInterval(interval)
  }, [])

  // Cycle view modes when in REVEALED state - REMOVED per user request
  // Manual control only
  useEffect(() => {
    if (data?.state !== 'REVEALED') {
      setViewMode('OVERALL')
    }
  }, [data?.state])

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl vermilion-gradient flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-[#f5f1eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[#6e7681] text-xl">正在加载数据...</p>
        </div>
      </div>
    )
  }

  const state = data?.state || 'CLOSED'
  const currentProject = data?.currentProject
  const reviewerStatuses = data?.reviewerStatuses || []
  const results = data?.results || []
  const totalReviewers = data?.totalReviewers || 0
  const votedCount = data?.votedCount || 0

  // Separate reviewers by role
  const leaders = reviewerStatuses.filter(r => r.role === 'LEADER')
  const deptHeads = reviewerStatuses.filter(r => r.role === 'DEPT_HEAD')

  return (
    <div className="min-h-screen bg-[#0d1117] ink-gradient cloud-pattern text-[#f5f1eb] p-8 overflow-hidden">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#c53d43]/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#d4a853]/10 to-transparent blur-3xl" />
      </div>

      {/* 头部 */}
      <header className="relative z-10 mb-8 text-center">
        <div className="inline-flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl vermilion-gradient flex items-center justify-center shadow-lg shadow-[#c53d43]/30">
            <svg className="w-7 h-7 text-[#f5f1eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
          智<span className="text-[#c53d43]">评</span>
          <span className="text-[#d4a853] ml-4">Live</span>
        </h1>

        <div className={clsx(
          "inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-bold",
          state === 'SCORING' ? "bg-[#7ec699]/15 text-[#7ec699] border border-[#7ec699]/30" :
          state === 'REVEALED' ? "bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/30" :
          "bg-[#30363d] text-[#6e7681] border border-[#30363d]"
        )}>
          <span className={clsx(
            "w-3 h-3 rounded-full",
            state === 'SCORING' ? "bg-[#7ec699] animate-pulse" :
            state === 'REVEALED' ? "bg-[#d4a853]" :
            "bg-[#6e7681]"
          )} />
          {state === 'SCORING' ? '评分进行中' :
           state === 'REVEALED' ? '最终排名' :
           '等待开始'}
        </div>
      </header>

      {/* 主内容区 */}
      <main className="relative z-10 max-w-7xl mx-auto">
        {/* 等待状态 */}
        {state === 'CLOSED' && (
          <div className="text-center py-24">
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-[#161b22] border border-[#30363d] flex items-center justify-center">
              <svg className="w-12 h-12 text-[#30363d]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl text-[#6e7681] mb-4">请等待管理员开启评分</p>
            <p className="text-lg text-[#30363d]">评分开始后，此页面将自动更新</p>
          </div>
        )}

        {/* 评分进行中 - 新的扑克牌样式 */}
        {state === 'SCORING' && (
          <div className="space-y-8">
            {/* 当前项目展示 */}
            {currentProject ? (
              <div className="text-center mb-12 animate-fade-in-up">
                <div className="inline-block">
                  <div className="text-sm text-[#7ec699] uppercase tracking-widest mb-2 font-medium">
                    当前评审项目
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-[#f5f1eb] mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                    {currentProject.name}
                  </h2>
                  <div className="flex items-center justify-center gap-4 text-[#6e7681]">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {currentProject.department}
                    </span>
                    <span className="text-[#30363d]">·</span>
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {currentProject.presenter}
                    </span>
                  </div>
                  {currentProject.description && (
                    <p className="mt-4 text-[#6e7681] max-w-2xl mx-auto">{currentProject.description}</p>
                  )}
                </div>

                {/* 进度统计 */}
                <div className="mt-8 flex items-center justify-center gap-6">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-2xl px-8 py-4">
                    <div className="text-5xl font-black text-[#7ec699]">{votedCount}</div>
                    <div className="text-sm text-[#6e7681]">已评分</div>
                  </div>
                  <div className="text-4xl text-[#30363d]">/</div>
                  <div className="bg-[#161b22] border border-[#30363d] rounded-2xl px-8 py-4">
                    <div className="text-5xl font-black text-[#6e7681]">{totalReviewers}</div>
                    <div className="text-sm text-[#6e7681]">总评委</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-[#6e7681] text-xl">请在管理端选择当前评审项目</div>
              </div>
            )}

            {/* 评委卡片区域 */}
            {reviewerStatuses.length > 0 && (
              <div className="space-y-10">
                {/* 领导层评委 */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#c53d43]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#c53d43]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#f5f1eb]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                      中心领导/总工 <span className="text-[#6e7681] font-normal text-base ml-2">（权重 60%）</span>
                    </h3>
                    <div className="ml-auto text-sm text-[#6e7681]">
                      {leaders.filter(l => l.hasVoted).length} / {leaders.length}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4">
                    {leaders.map((reviewer, index) => (
                      <ReviewerCard key={reviewer.id} reviewer={reviewer} index={index} color="vermilion" />
                    ))}
                  </div>
                </div>

                {/* 部门负责人评委 */}
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-8 h-8 rounded-lg bg-[#d4a853]/20 flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-[#f5f1eb]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                      各所/部负责人 <span className="text-[#6e7681] font-normal text-base ml-2">（权重 40%）</span>
                    </h3>
                    <div className="ml-auto text-sm text-[#6e7681]">
                      {deptHeads.filter(d => d.hasVoted).length} / {deptHeads.length}
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-center gap-3">
                    {deptHeads.map((reviewer, index) => (
                      <ReviewerCard key={reviewer.id} reviewer={reviewer} index={index} color="gold" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 结果公布 */}
        {state === 'REVEALED' && (
          <div className="space-y-6">
            {/* 视图切换指示器 */}
            <div className="flex justify-center items-center gap-4 mb-8">
              {(['OVERALL', 'DIMENSIONS', 'CONSISTENCY'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={clsx(
                    "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 hover:scale-105 active:scale-95",
                    viewMode === mode
                      ? "bg-[#d4a853] text-[#0d1117] shadow-lg shadow-[#d4a853]/20"
                      : "bg-[#161b22] text-[#6e7681] border border-[#30363d] hover:border-[#d4a853]/50 hover:text-[#f5f1eb]"
                  )}
                >
                  {mode === 'OVERALL' && '总榜单'}
                  {mode === 'DIMENSIONS' && '单项最佳'}
                  {mode === 'CONSISTENCY' && '共识度排名'}
                </button>
              ))}
            </div>

            {/* 总榜单视图 */}
            {viewMode === 'OVERALL' && (
              <div className="space-y-4">
                {results.map((project, index) => (
                  <div
                    key={project.id}
                    className="relative float-card p-6 flex items-center gap-6 overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    {/* 排名奖牌 */}
                    <div className={clsx(
                      "flex-shrink-0 w-20 h-20 rounded-2xl flex flex-col items-center justify-center text-center z-10 transition-transform hover:scale-110",
                      index === 0 ? "medal-gold" :
                      index === 1 ? "medal-silver" :
                      index === 2 ? "medal-bronze" :
                      "bg-[#21262d] border border-[#30363d]"
                    )}>
                      {index < 3 ? (
                        <>
                          <span className="text-xs font-medium opacity-80">
                            {index === 0 ? '冠军' : index === 1 ? '亚军' : '季军'}
                          </span>
                          <span className="text-2xl font-black">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-xs text-[#6e7681]">第</span>
                          <span className="text-2xl font-black text-[#a0a0a0]">{index + 1}</span>
                          <span className="text-xs text-[#6e7681]">名</span>
                        </>
                      )}
                    </div>

                    {/* 项目信息 */}
                    <div className="flex-grow z-10">
                      <h3 className="text-2xl font-bold text-[#f5f1eb] mb-1" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                        {project.name}
                      </h3>
                      <p className="text-[#6e7681] flex items-center gap-2">
                        <span>{project.presenter}</span>
                        <span className="text-[#30363d]">·</span>
                        <span>{project.department}</span>
                        <span className="text-[#30363d]">·</span>
                        <span className="text-[#7ec699]">{project.scoreCount} 票</span>
                      </p>
                    </div>

                    {/* 最终得分 */}
                    <div className="text-right z-10 min-w-[140px]">
                      <div className="text-xs text-[#6e7681] uppercase tracking-widest mb-1">最终得分</div>
                      <div className={clsx(
                        "text-5xl font-black",
                        index === 0 ? "text-[#ffd700]" :
                        index === 1 ? "text-[#c0c0c0]" :
                        index === 2 ? "text-[#cd7f32]" :
                        "text-[#d4a853]"
                      )}>
                        {project.finalScore?.toFixed(1) || '-'}
                      </div>
                    </div>

                    {/* 背景进度条 */}
                    <div
                      className="absolute left-0 top-0 bottom-0 transition-all duration-1000 z-0"
                      style={{
                        width: `${project.finalScore || 0}%`,
                        background: index === 0
                          ? 'linear-gradient(90deg, rgba(255,215,0,0.1) 0%, rgba(255,215,0,0.05) 100%)'
                          : index === 1
                          ? 'linear-gradient(90deg, rgba(192,192,192,0.1) 0%, rgba(192,192,192,0.05) 100%)'
                          : index === 2
                          ? 'linear-gradient(90deg, rgba(205,127,50,0.1) 0%, rgba(205,127,50,0.05) 100%)'
                          : 'linear-gradient(90deg, rgba(212,168,83,0.1) 0%, rgba(212,168,83,0.05) 100%)'
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* 单项最佳视图 */}
            {viewMode === 'DIMENSIONS' && (
              <div className="grid grid-cols-2 gap-6 animate-fade-in-up">
                {[
                  { key: 'avgValueScore', title: '研究价值', icon: '💎' },
                  { key: 'avgInnovScore', title: '创新性', icon: '💡' },
                  { key: 'avgFeasiScore', title: '可行性', icon: '🔧' },
                  { key: 'avgOutputScore', title: '预期成果', icon: '📈' }
                ].map((dim) => {
                  const sorted = [...results]
                    .sort((a, b) => ((b[dim.key as keyof Result] as number) || 0) - ((a[dim.key as keyof Result] as number) || 0))
                    .slice(0, 3)

                  return (
                    <div key={dim.key} className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <span className="text-3xl">{dim.icon}</span>
                        <h3 className="text-xl font-bold text-[#f5f1eb]">{dim.title}</h3>
                      </div>

                      <div className="space-y-4 relative z-10">
                        {sorted.map((p, i) => (
                          <div key={p.id} className="flex items-center gap-4">
                            <div className={clsx(
                              "w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm",
                              i === 0 ? "bg-[#ffd700] text-black" :
                              i === 1 ? "bg-[#c0c0c0] text-black" :
                              "bg-[#cd7f32] text-black"
                            )}>
                              {i + 1}
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="text-[#f5f1eb] font-medium truncate">{p.name}</div>
                              <div className="text-xs text-[#6e7681] truncate">{p.presenter}</div>
                            </div>
                            <div className="text-[#7ec699] font-mono font-bold">
                              {(p[dim.key as keyof Result] as number)?.toFixed(1)}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 装饰背景 */}
                      <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
                    </div>
                  )
                })}
              </div>
            )}

            {/* 共识度排名视图 */}
            {viewMode === 'CONSISTENCY' && (
              <div className="space-y-4">
                <div className="bg-[#161b22]/50 p-4 rounded-xl border border-[#30363d] text-center mb-4 text-[#6e7681] text-sm animate-fade-in-up">
                  * 争议度越低（标准差越小），说明评委意见越统一，共识度越高
                </div>
                {[...results]
                  .sort((a, b) => ((a.standardDeviation || 0) - (b.standardDeviation || 0))) // 升序排列，越小越一致
                  .map((project, index) => (
                  <div
                    key={project.id}
                    className="relative float-card p-6 flex items-center gap-6 overflow-hidden animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.15}s` }}
                  >
                    <div className="w-16 h-16 rounded-2xl bg-[#21262d] border border-[#30363d] flex flex-col items-center justify-center text-[#6e7681]">
                      <span className="text-xs">共识</span>
                      <span className="text-xl font-bold text-[#f5f1eb]">{index + 1}</span>
                    </div>

                    <div className="flex-grow z-10">
                      <h3 className="text-2xl font-bold text-[#f5f1eb] mb-1" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                        {project.name}
                      </h3>
                      <p className="text-[#6e7681] flex items-center gap-2">
                        <span>{project.presenter}</span>
                        <span className="text-[#30363d]">·</span>
                        <span>{project.department}</span>
                      </p>
                    </div>

                    <div className="text-right z-10 min-w-[140px]">
                      <div className="text-xs text-[#6e7681] uppercase tracking-widest mb-1">争议指数</div>
                      <div className={clsx(
                        "text-4xl font-black",
                        index < 3 ? "text-[#7ec699]" : "text-[#6e7681]"
                      )}>
                        {project.standardDeviation?.toFixed(2) || '-'}
                      </div>
                    </div>

                    {/* 背景条 - 争议指数越低（一致性高），背景越亮 */}
                     <div
                      className="absolute left-0 top-0 bottom-0 transition-all duration-1000 z-0 bg-[#7ec699]/5"
                      style={{
                        width: `${Math.max(0, 100 - (project.standardDeviation || 0) * 5)}%`, // 简单的可视化映射
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* 底部装饰 */}
      <footer className="relative z-10 mt-12 text-center">
        <div className="flex items-center justify-center gap-3 text-[#30363d] text-sm">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#30363d] to-transparent" />
          <span>智评 SmartScore</span>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#30363d] to-transparent" />
        </div>
      </footer>
    </div>
  )
}

// 评委卡片组件 - 扑克牌风格
function ReviewerCard({
  reviewer,
  index,
  color
}: {
  reviewer: ReviewerStatus
  index: number
  color: 'vermilion' | 'gold'
}) {
  const hasVoted = reviewer.hasVoted
  const colorClasses = {
    vermilion: {
      voted: 'border-[#7ec699] bg-gradient-to-br from-[#7ec699]/20 to-[#5fb3b3]/10 shadow-lg shadow-[#7ec699]/20',
      notVoted: 'border-[#30363d] bg-[#161b22]/80',
      badge: 'bg-[#c53d43]',
      glow: 'shadow-[#7ec699]/40'
    },
    gold: {
      voted: 'border-[#7ec699] bg-gradient-to-br from-[#7ec699]/20 to-[#5fb3b3]/10 shadow-lg shadow-[#7ec699]/20',
      notVoted: 'border-[#30363d] bg-[#161b22]/80',
      badge: 'bg-[#d4a853]',
      glow: 'shadow-[#7ec699]/40'
    }
  }

  const colors = colorClasses[color]

  // Get initials or first character
  const initial = reviewer.name.charAt(0)

  return (
    <div
      className={clsx(
        "relative w-24 h-32 rounded-xl border-2 transition-all duration-500 transform",
        hasVoted ? colors.voted : colors.notVoted,
        hasVoted && "scale-105",
        "hover:scale-110"
      )}
      style={{
        animationDelay: `${index * 0.05}s`,
        transform: `rotate(${(index % 5 - 2) * 2}deg)`
      }}
    >
      {/* 亮灯效果 */}
      {hasVoted && (
        <div className={clsx(
          "absolute -inset-1 rounded-xl blur-md opacity-50",
          "bg-gradient-to-br from-[#7ec699] to-[#5fb3b3]"
        )} />
      )}

      <div className="relative h-full flex flex-col items-center justify-center p-2">
        {/* 头像 */}
        <div className={clsx(
          "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold mb-2 transition-all duration-500",
          hasVoted
            ? "bg-[#7ec699] text-[#0d1117]"
            : "bg-[#21262d] text-[#6e7681]"
        )}>
          {hasVoted ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            initial
          )}
        </div>

        {/* 名称 */}
        <div className={clsx(
          "text-xs font-medium text-center truncate w-full px-1 transition-colors duration-500",
          hasVoted ? "text-[#f5f1eb]" : "text-[#6e7681]"
        )}>
          {reviewer.name.length > 6 ? reviewer.name.slice(0, 6) + '...' : reviewer.name}
        </div>

        {/* 状态指示器 */}
        <div className={clsx(
          "absolute top-1 right-1 w-3 h-3 rounded-full transition-all duration-500",
          hasVoted
            ? "bg-[#7ec699] animate-pulse"
            : "bg-[#30363d]"
        )} />
      </div>
    </div>
  )
}
