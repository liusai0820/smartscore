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
  const [showRulesModal, setShowRulesModal] = useState(false)

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
      <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl vermilion-gradient flex items-center justify-center animate-pulse">
            <svg className="w-8 h-8 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-[var(--color-text-muted)] text-xl">正在加载数据...</p>
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
    <div className="min-h-screen bg-[var(--color-ink)] ink-gradient cloud-pattern text-[var(--color-text-primary)] p-8 overflow-hidden">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-48 -left-48 w-[600px] h-[600px] rounded-full bg-gradient-to-br from-[#c53d43]/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-48 -right-48 w-[600px] h-[600px] rounded-full bg-gradient-to-tl from-[#d4a853]/10 to-transparent blur-3xl" />
      </div>

      {/* 头部 */}
      <header className="relative z-10 mb-8 text-center">
        <div className="inline-flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-2xl vermilion-gradient flex items-center justify-center shadow-lg shadow-[#c53d43]/30">
            <svg className="w-7 h-7 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          {/* 评分规则按钮 */}
          <button
            onClick={() => setShowRulesModal(true)}
            className="w-10 h-10 rounded-xl bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[#d4a853] hover:border-[#d4a853]/50 transition-all duration-300 hover:scale-110"
            title="评分规则说明"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        </div>

        <h1 className="text-5xl md:text-6xl font-black tracking-tight mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
          智<span className="text-[#c53d43]">评</span>
          <span className="text-[#d4a853] ml-4">Live</span>
        </h1>

        <div className={clsx(
          "inline-flex items-center gap-3 px-6 py-3 rounded-full text-lg font-bold",
          state === 'SCORING' ? "bg-[#7ec699]/15 text-[#7ec699] border border-[#7ec699]/30" :
            state === 'REVEALED' ? "bg-[#d4a853]/15 text-[#d4a853] border border-[#d4a853]/30" :
              "bg-[var(--color-ink-soft)] text-[var(--color-text-muted)] border border-[var(--color-ink-soft)]"
        )}>
          <span className={clsx(
            "w-3 h-3 rounded-full",
            state === 'SCORING' ? "bg-[#7ec699] animate-pulse" :
              state === 'REVEALED' ? "bg-[#d4a853]" :
                "bg-[var(--color-text-muted)]"
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
            <div className="w-24 h-24 mx-auto mb-8 rounded-2xl bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] flex items-center justify-center">
              <svg className="w-12 h-12 text-[var(--color-ink-soft)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-3xl text-[var(--color-text-muted)] mb-4">请等待管理员开启评分</p>
            <p className="text-lg text-[var(--color-ink-soft)]">评分开始后，此页面将自动更新</p>
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
                  <h2 className="text-4xl md:text-5xl font-black text-[var(--color-text-primary)] mb-4" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                    {currentProject.name}
                  </h2>
                  <div className="flex items-center justify-center gap-4 text-[var(--color-text-muted)]">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {currentProject.department}
                    </span>
                    <span className="text-[var(--color-ink-soft)]">·</span>
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {currentProject.presenter}
                    </span>
                  </div>
                  {currentProject.description && (
                    <p className="mt-4 text-[var(--color-text-muted)] max-w-2xl mx-auto">{currentProject.description}</p>
                  )}
                </div>

                {/* 进度统计 */}
                <div className="mt-8 flex items-center justify-center gap-6">
                  <div className="bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] rounded-2xl px-8 py-4">
                    <div className="text-5xl font-black text-[#7ec699]">{votedCount}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">已评分</div>
                  </div>
                  <div className="text-4xl text-[var(--color-ink-soft)]">/</div>
                  <div className="bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] rounded-2xl px-8 py-4">
                    <div className="text-5xl font-black text-[var(--color-text-muted)]">{totalReviewers}</div>
                    <div className="text-sm text-[var(--color-text-muted)]">总评委</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-[var(--color-text-muted)] text-xl">请在管理端选择当前评审项目</div>
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
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                      中心领导/总工 <span className="text-[var(--color-text-muted)] font-normal text-base ml-2">（权重 60%）</span>
                    </h3>
                    <div className="ml-auto text-sm text-[var(--color-text-muted)]">
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
                    <h3 className="text-xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                      各所/部负责人 <span className="text-[var(--color-text-muted)] font-normal text-base ml-2">（权重 40%）</span>
                    </h3>
                    <div className="ml-auto text-sm text-[var(--color-text-muted)]">
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
                      ? "bg-[#d4a853] text-[var(--color-ink)] shadow-lg shadow-[#d4a853]/20"
                      : "bg-[var(--color-ink-light)] text-[var(--color-text-muted)] border border-[var(--color-ink-soft)] hover:border-[#d4a853]/50 hover:text-[var(--color-text-primary)]"
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
              <div className="space-y-2">
                {results.map((project, index) => {
                  const isTop3 = index < 3

                  return (
                    <div
                      key={project.id}
                      className="relative float-card p-3 flex items-center gap-4 overflow-hidden animate-fade-in-up"
                      style={{ animationDelay: `${index * 0.08}s` }}
                    >
                      {/* 排名奖牌 */}
                      <div className={clsx(
                        "flex-shrink-0 rounded-xl flex items-center justify-center text-center z-10 transition-transform hover:scale-110",
                        isTop3 ? "w-14 h-14" : "w-12 h-12 rounded-lg",
                        index === 0 ? "medal-gold" :
                          index === 1 ? "medal-silver" :
                            index === 2 ? "medal-bronze" :
                              "bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)]"
                      )}>
                        {index < 3 ? (
                          <span className="text-2xl font-black">
                            {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                          </span>
                        ) : (
                          <span className="text-xl font-black text-[var(--color-text-secondary)]">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      {/* 项目信息 */}
                      <div className="flex-grow z-10 min-w-0">
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] truncate mb-0.5" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                          {project.name}
                        </h3>
                        <p className="text-sm text-[var(--color-text-muted)] flex items-center gap-2 truncate">
                          <span>{project.presenter}</span>
                          <span className="text-[var(--color-ink-soft)]">·</span>
                          <span>{project.department}</span>
                          <span className="text-[var(--color-ink-soft)]">·</span>
                          <span className="text-[#7ec699]">{project.scoreCount} 票</span>
                        </p>
                      </div>

                      {/* 最终得分 */}
                      <div className="text-right z-10 flex-shrink-0 min-w-[80px]">
                        <div className={clsx(
                          "font-black",
                          isTop3 ? "text-3xl" : "text-2xl",
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
                            ? 'linear-gradient(90deg, rgba(255,215,0,0.08) 0%, rgba(255,215,0,0.03) 100%)'
                            : index === 1
                              ? 'linear-gradient(90deg, rgba(192,192,192,0.08) 0%, rgba(192,192,192,0.03) 100%)'
                              : index === 2
                                ? 'linear-gradient(90deg, rgba(205,127,50,0.08) 0%, rgba(205,127,50,0.03) 100%)'
                                : 'linear-gradient(90deg, rgba(212,168,83,0.08) 0%, rgba(212,168,83,0.03) 100%)'
                        }}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* 单项最佳视图 */}
            {viewMode === 'DIMENSIONS' && (
              <div className="grid grid-cols-2 gap-6 animate-fade-in-up">
                {[
                  {
                    key: 'avgDataScore',
                    title: 'Data（数据质量）',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    ),
                    color: '#5fb3b3'
                  },
                  {
                    key: 'avgInfoScore',
                    title: 'Information（信息处理）',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ),
                    color: '#7ec699'
                  },
                  {
                    key: 'avgKnowScore',
                    title: 'Knowledge（知识构建）',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    ),
                    color: '#d4a853'
                  },
                  {
                    key: 'avgInsightScore',
                    title: 'Insight（洞察智慧）',
                    icon: (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    ),
                    color: '#c53d43'
                  }
                ].map((dim) => {
                  const sorted = [...results]
                    .sort((a, b) => ((b[dim.key as keyof Result] as number) || 0) - ((a[dim.key as keyof Result] as number) || 0))
                    .slice(0, 3)

                  return (
                    <div key={dim.key} className="bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] rounded-2xl p-6 relative overflow-hidden">
                      <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${dim.color}20`, color: dim.color }}>
                          {dim.icon}
                        </div>
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">{dim.title}</h3>
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
                              <div className="text-[var(--color-text-primary)] font-medium truncate">{p.name}</div>
                              <div className="text-xs text-[var(--color-text-muted)] truncate">{p.presenter}</div>
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
                <div className="bg-[var(--color-ink-light)]/50 p-4 rounded-xl border border-[var(--color-ink-soft)] text-center mb-4 text-[var(--color-text-muted)] text-sm animate-fade-in-up">
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
                      <div className="w-16 h-16 rounded-2xl bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)] flex flex-col items-center justify-center text-[var(--color-text-muted)]">
                        <span className="text-xs">共识</span>
                        <span className="text-xl font-bold text-[var(--color-text-primary)]">{index + 1}</span>
                      </div>

                      <div className="flex-grow z-10">
                        <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-1" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                          {project.name}
                        </h3>
                        <p className="text-[var(--color-text-muted)] flex items-center gap-2">
                          <span>{project.presenter}</span>
                          <span className="text-[var(--color-ink-soft)]">·</span>
                          <span>{project.department}</span>
                        </p>
                      </div>

                      <div className="text-right z-10 min-w-[140px]">
                        <div className="text-xs text-[var(--color-text-muted)] uppercase tracking-widest mb-1">争议指数</div>
                        <div className={clsx(
                          "text-4xl font-black",
                          index < 3 ? "text-[#7ec699]" : "text-[var(--color-text-muted)]"
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
        <div className="flex items-center justify-center gap-3 text-[var(--color-ink-soft)] text-sm">
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--color-ink-soft)] to-transparent" />
          <span>智评 SmartScore</span>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[var(--color-ink-soft)] to-transparent" />
        </div>
      </footer>

      {/* 评分规则说明模态框 */}
      {showRulesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* 背景遮罩 */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRulesModal(false)}
          />

          {/* 模态框内容 */}
          <div className="relative bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)] rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-fade-in-up">
            {/* 头部 */}
            <div className="sticky top-0 bg-[var(--color-ink-light)] border-b border-[var(--color-ink-soft)] px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
                评分规则说明
              </h2>
              <button
                onClick={() => setShowRulesModal(false)}
                className="w-10 h-10 rounded-xl bg-[var(--color-ink-medium)] flex items-center justify-center text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-ink-soft)] transition-all"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* 内容区 */}
            <div className="p-6 space-y-8">
              {/* DIKI范式评分维度 */}
              <section>
                <h3 className="text-lg font-bold text-[#d4a853] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-sm">1</span>
                  DIKI范式评分维度
                </h3>
                <div className="bg-[var(--color-ink-medium)] rounded-xl p-4 overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-[var(--color-text-muted)] border-b border-[var(--color-ink-soft)]">
                        <th className="text-left py-2 px-3">维度</th>
                        <th className="text-center py-2 px-3">权重</th>
                        <th className="text-center py-2 px-3">满分</th>
                        <th className="text-left py-2 px-3">说明</th>
                      </tr>
                    </thead>
                    <tbody className="text-[var(--color-text-primary)]">
                      <tr className="border-b border-[var(--color-ink-soft)]/50">
                        <td className="py-2 px-3 font-medium">Data（数据质量）</td>
                        <td className="text-center py-2 px-3 text-[#7ec699]">20%</td>
                        <td className="text-center py-2 px-3">20分</td>
                        <td className="py-2 px-3 text-[var(--color-text-muted)]">核心一手数据占比、时效性、稀缺性</td>
                      </tr>
                      <tr className="border-b border-[var(--color-ink-soft)]/50">
                        <td className="py-2 px-3 font-medium">Information（信息处理）</td>
                        <td className="text-center py-2 px-3 text-[#7ec699]">15%</td>
                        <td className="text-center py-2 px-3">15分</td>
                        <td className="py-2 px-3 text-[var(--color-text-muted)]">数据清晰度、逻辑严密性、可视化程度</td>
                      </tr>
                      <tr className="border-b border-[var(--color-ink-soft)]/50">
                        <td className="py-2 px-3 font-medium">Knowledge（知识构建）</td>
                        <td className="text-center py-2 px-3 text-[#7ec699]">15%</td>
                        <td className="text-center py-2 px-3">15分</td>
                        <td className="py-2 px-3 text-[var(--color-text-muted)]">跨领域分析、理论模型构建、理论价值</td>
                      </tr>
                      <tr className="border-b border-[var(--color-ink-soft)]/50">
                        <td className="py-2 px-3 font-medium">Insight（洞察智慧）</td>
                        <td className="text-center py-2 px-3 text-[#7ec699]">20%</td>
                        <td className="text-center py-2 px-3">20分</td>
                        <td className="py-2 px-3 text-[var(--color-text-muted)]">问题发现能力、对策原创性</td>
                      </tr>
                      <tr className="border-b border-[var(--color-ink-soft)]/50">
                        <td className="py-2 px-3 font-medium">Approval（决策影响力）</td>
                        <td className="text-center py-2 px-3 text-[#5fb3b3]">15%</td>
                        <td className="text-center py-2 px-3">15分</td>
                        <td className="py-2 px-3 text-[var(--color-text-muted)]">领导批示、政策转化层级</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-medium">Award（所获荣誉）</td>
                        <td className="text-center py-2 px-3 text-[#5fb3b3]">15%</td>
                        <td className="text-center py-2 px-3">15分</td>
                        <td className="py-2 px-3 text-[var(--color-text-muted)]">省/市级奖项</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              {/* 评委权重 */}
              <section>
                <h3 className="text-lg font-bold text-[#d4a853] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-sm">2</span>
                  评委权重
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[var(--color-ink-medium)] rounded-xl p-4 border-l-4 border-[#c53d43]">
                    <div className="text-[#c53d43] font-bold text-lg mb-1">中心领导/总工</div>
                    <div className="text-4xl font-black text-[var(--color-text-primary)]">60%</div>
                    <div className="text-sm text-[var(--color-text-muted)] mt-2">主任、副主任、总工/副总工</div>
                  </div>
                  <div className="bg-[var(--color-ink-medium)] rounded-xl p-4 border-l-4 border-[#d4a853]">
                    <div className="text-[#d4a853] font-bold text-lg mb-1">各所/部负责人</div>
                    <div className="text-4xl font-black text-[var(--color-text-primary)]">40%</div>
                    <div className="text-sm text-[var(--color-text-muted)] mt-2">各研究所、各部门负责人</div>
                  </div>
                </div>
              </section>

              {/* 计算公式 */}
              <section>
                <h3 className="text-lg font-bold text-[#d4a853] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-sm">3</span>
                  计算公式
                </h3>
                <div className="bg-[var(--color-ink-medium)] rounded-xl p-5">
                  <div className="text-center mb-4">
                    <div className="inline-block bg-[var(--color-ink)] px-6 py-3 rounded-lg border border-[var(--color-ink-soft)]">
                      <span className="text-[var(--color-text-primary)] font-mono text-lg">
                        最终得分 = <span className="text-[#c53d43]">领导平均分 × 60%</span> + <span className="text-[#d4a853]">部门平均分 × 40%</span>
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-[var(--color-text-muted)] text-center">
                    * 每位评委的打分先按DIKI六维度加权计算百分制得分，再按评委类型加权汇总
                  </div>
                </div>
              </section>

              {/* 计算案例 */}
              <section>
                <h3 className="text-lg font-bold text-[#d4a853] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-sm">4</span>
                  计算案例
                </h3>
                <div className="bg-[var(--color-ink-medium)] rounded-xl p-5 space-y-5">
                  <div className="text-[var(--color-text-primary)] font-medium">
                    假设某项目收到 <span className="text-[#c53d43]">3位领导</span> 和 <span className="text-[#d4a853]">2位部门负责人</span> 的评分：
                  </div>

                  {/* 两列布局：领导 + 部门 */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* 领导评分 */}
                    <div className="space-y-2">
                      <div className="text-sm text-[#c53d43] font-bold mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#c53d43]/20 flex items-center justify-center text-xs">60%</span>
                        中心领导/总工评分
                      </div>
                      <div className="bg-[var(--color-ink)] rounded-lg p-3 border-l-4 border-[#c53d43]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-text-muted)]">主任1</span>
                          <span className="text-[#7ec699] font-bold">85.0分</span>
                        </div>
                      </div>
                      <div className="bg-[var(--color-ink)] rounded-lg p-3 border-l-4 border-[#c53d43]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-text-muted)]">主任2</span>
                          <span className="text-[#7ec699] font-bold">82.0分</span>
                        </div>
                      </div>
                      <div className="bg-[var(--color-ink)] rounded-lg p-3 border-l-4 border-[#c53d43]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-text-muted)]">总工1</span>
                          <span className="text-[#7ec699] font-bold">80.0分</span>
                        </div>
                      </div>
                      <div className="bg-[#c53d43]/10 rounded-lg p-3 border border-[#c53d43]/30 mt-3">
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">领导平均分</div>
                        <div className="text-sm text-[var(--color-text-primary)]">
                          (85 + 82 + 80) ÷ 3 = <span className="text-[#c53d43] font-bold text-lg">82.3分</span>
                        </div>
                      </div>
                    </div>

                    {/* 部门评分 */}
                    <div className="space-y-2">
                      <div className="text-sm text-[#d4a853] font-bold mb-3 flex items-center gap-2">
                        <span className="w-6 h-6 rounded bg-[#d4a853]/20 flex items-center justify-center text-xs">40%</span>
                        各所/部负责人评分
                      </div>
                      <div className="bg-[var(--color-ink)] rounded-lg p-3 border-l-4 border-[#d4a853]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-text-muted)]">数字经济研究所</span>
                          <span className="text-[#7ec699] font-bold">78.0分</span>
                        </div>
                      </div>
                      <div className="bg-[var(--color-ink)] rounded-lg p-3 border-l-4 border-[#d4a853]">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-[var(--color-text-muted)]">生物经济研究所</span>
                          <span className="text-[#7ec699] font-bold">76.0分</span>
                        </div>
                      </div>
                      <div className="bg-[#d4a853]/10 rounded-lg p-3 border border-[#d4a853]/30 mt-3" style={{ marginTop: '4.5rem' }}>
                        <div className="text-xs text-[var(--color-text-muted)] mb-1">部门平均分</div>
                        <div className="text-sm text-[var(--color-text-primary)]">
                          (78 + 76) ÷ 2 = <span className="text-[#d4a853] font-bold text-lg">77.0分</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 最终计算 */}
                  <div className="bg-gradient-to-r from-[#c53d43]/10 via-[#d4a853]/10 to-[#7ec699]/10 rounded-xl p-5 border border-[#d4a853]/30">
                    <div className="text-center">
                      <div className="text-sm text-[var(--color-text-muted)] mb-3">最终得分 = 领导平均分 × 60% + 部门平均分 × 40%</div>
                      <div className="text-xl text-[var(--color-text-primary)] flex items-center justify-center gap-3 flex-wrap">
                        <span><span className="text-[#c53d43] font-bold">82.3</span> × 60%</span>
                        <span className="text-[var(--color-text-muted)]">+</span>
                        <span><span className="text-[#d4a853] font-bold">77.0</span> × 40%</span>
                        <span className="text-[var(--color-text-muted)]">=</span>
                        <span className="text-[#7ec699] font-black text-3xl">80.2分</span>
                      </div>
                    </div>
                  </div>

                  {/* 补充说明 */}
                  <div className="text-xs text-[var(--color-text-muted)] flex items-start gap-2">
                    <svg className="w-4 h-4 text-[#5fb3b3] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>每位评委的分数是其DIKI六维度打分的加权结果（百分制），再按评委类型分组求平均，最后按60%/40%权重汇总。</span>
                  </div>
                </div>
              </section>

              {/* 回避规则 */}
              <section>
                <h3 className="text-lg font-bold text-[#d4a853] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-sm">5</span>
                  回避规则
                </h3>
                <div className="bg-[var(--color-ink-medium)] rounded-xl p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#e85a5a]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="w-4 h-4 text-[#e85a5a]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <div className="text-[var(--color-text-muted)]">
                    评委<span className="text-[var(--color-text-primary)] font-medium">不能</span>为自己所属部门的项目打分，系统会自动识别并禁止评分。
                  </div>
                </div>
              </section>

              {/* 缺席处理 */}
              <section>
                <h3 className="text-lg font-bold text-[#d4a853] mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-lg bg-[#d4a853]/20 flex items-center justify-center text-sm">6</span>
                  评委缺席处理
                </h3>
                <div className="bg-[var(--color-ink-medium)] rounded-xl p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#7ec699]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#7ec699]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-[var(--color-text-muted)]">
                      <span className="text-[var(--color-text-primary)] font-medium">个别评委临时离席不影响公平性。</span>
                      系统采用<span className="text-[#7ec699] font-medium">平均分机制</span>：无论几人打分，均按实际人数求平均后再按60%/40%权重汇总。
                    </div>
                  </div>
                  <div className="bg-[var(--color-ink)] rounded-lg p-3 text-sm">
                    <div className="text-[var(--color-text-muted)] mb-2">示例：</div>
                    <div className="grid grid-cols-2 gap-4 text-[var(--color-text-primary)]">
                      <div>
                        <span className="text-[#c53d43]">5位领导全勤</span>：(L1+L2+L3+L4+L5) ÷ 5 × 60%
                      </div>
                      <div>
                        <span className="text-[#c53d43]">1位领导缺席</span>：(L1+L2+L3+L4) ÷ 4 × 60%
                      </div>
                    </div>
                    <div className="text-xs text-[var(--color-text-muted)] mt-2">
                      权重恒定，只是参与平均的人数变化，对所有项目一视同仁。
                    </div>
                  </div>
                  <div className="flex items-start gap-3 pt-2 border-t border-[var(--color-ink-soft)]">
                    <div className="w-8 h-8 rounded-lg bg-[#5fb3b3]/20 flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-[#5fb3b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div className="text-[var(--color-text-muted)]">
                      管理员可在后台将离席评委<span className="text-[#5fb3b3] font-medium">临时禁用</span>，该评委将不计入总人数统计，回来后可随时启用。
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
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
      notVoted: 'border-[var(--color-ink-soft)] bg-[var(--color-ink-light)]/80',
      badge: 'bg-[#c53d43]',
      glow: 'shadow-[#7ec699]/40'
    },
    gold: {
      voted: 'border-[#7ec699] bg-gradient-to-br from-[#7ec699]/20 to-[#5fb3b3]/10 shadow-lg shadow-[#7ec699]/20',
      notVoted: 'border-[var(--color-ink-soft)] bg-[var(--color-ink-light)]/80',
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
            ? "bg-[#7ec699] text-[var(--color-ink)]"
            : "bg-[var(--color-ink-medium)] text-[var(--color-text-muted)]"
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
          hasVoted ? "text-[var(--color-text-primary)]" : "text-[var(--color-text-muted)]"
        )}>
          {reviewer.name.length > 6 ? reviewer.name.slice(0, 6) + '...' : reviewer.name}
        </div>

        {/* 状态指示器 */}
        <div className={clsx(
          "absolute top-1 right-1 w-3 h-3 rounded-full transition-all duration-500",
          hasVoted
            ? "bg-[#7ec699] animate-pulse"
            : "bg-[var(--color-ink-soft)]"
        )} />
      </div>
    </div>
  )
}
