'use client'

import { useState } from 'react'
import { Project, User } from '@prisma/client'
import axios from 'axios'
import { clsx } from 'clsx'

// 自定义评分类型（DIKI范式6维度）
interface ScoreData {
  dataScore: number
  infoScore: number
  knowScore: number
  insightScore: number
  approvalScore: number
  awardScore: number
}

interface ProjectCardProps {
  project: Project
  currentUser: User
  existingScore?: ScoreData | null
  isScoringOpen: boolean
}

// DIKI范式评分维度配置
const DIMENSIONS = [
  {
    key: 'dataScore',
    label: 'Data',
    subLabel: '数据质量',
    weight: 20,
    category: 'DIKI范式核心评价',
    criteria: [
      { range: '17-20', desc: '核心一手数据占比>60%，时效性强，数据来源稀缺且极具代表性' },
      { range: '13-16', desc: '核心一手数据占比40%-60%，时效性一般，数据来源可靠' },
      { range: '7-12', desc: '核心一手数据占比<40%，主要依赖二手/公开数据' },
    ]
  },
  {
    key: 'infoScore',
    label: 'Information',
    subLabel: '信息处理',
    weight: 15,
    category: 'DIKI范式核心评价',
    criteria: [
      { range: '13-15', desc: '数据清晰明了，与研究结论逻辑严密，可视化程度高' },
      { range: '9-12', desc: '数据较为清晰，能有效支撑结论，可视化展示较好' },
      { range: '4-8', desc: '数据呈现较为混乱，支撑力度一般，可视化程度较低' },
    ]
  },
  {
    key: 'knowScore',
    label: 'Knowledge',
    subLabel: '知识构建',
    weight: 15,
    category: 'DIKI范式核心评价',
    criteria: [
      { range: '13-15', desc: '跨领域多维度交叉分析，理论模型构建完善，理论价值极高' },
      { range: '9-12', desc: '具备多维度分析视角，理论分析较为深入' },
      { range: '4-8', desc: '分析视角单一，缺乏深度' },
    ]
  },
  {
    key: 'insightScore',
    label: 'Insight',
    subLabel: '洞察智慧',
    weight: 20,
    category: 'DIKI范式核心评价',
    criteria: [
      { range: '17-20', desc: '发现了产业发展的重大/潜在问题，对策原创性强' },
      { range: '13-16', desc: '发现了产业发展的主要问题，整体创新性较强' },
      { range: '7-12', desc: '发现了常规问题，对策较为常规' },
    ]
  },
  {
    key: 'approvalScore',
    label: 'Approval',
    subLabel: '决策影响力',
    weight: 15,
    category: '应用与认可',
    criteria: [
      { range: '15', desc: '获得国家级领导批示或转化为国家级政策' },
      { range: '10', desc: '获得省主要领导批示或转化为省/市级政策' },
      { range: '5', desc: '获得市主要领导批示或在部门内部应用' },
    ]
  },
  {
    key: 'awardScore',
    label: 'Award',
    subLabel: '所获荣誉',
    weight: 15,
    category: '应用与认可',
    criteria: [
      { range: '13-15', desc: '国家级奖项：一等奖15、二等奖14、三等奖13' },
      { range: '8-10', desc: '省级奖项：一等奖10、二等奖9、三等奖8' },
      { range: '3-5', desc: '市级奖项：一等奖5、二等奖4、三等奖3' },
    ]
  },
] as const

type DimensionKey = typeof DIMENSIONS[number]['key']

// Tooltip 组件
function DimensionTooltip({ dimension }: { dimension: typeof DIMENSIONS[number] }) {
  return (
    <div className="absolute bottom-full left-0 mb-2 w-72 p-3 bg-[#1a1a2e] border border-[#3a3a5a] rounded-lg shadow-xl z-50 text-left">
      <div className="text-xs font-bold text-white mb-2">
        {dimension.label} ({dimension.subLabel}) - {dimension.weight}%
      </div>
      <div className="space-y-1.5">
        {dimension.criteria.map((c, idx) => (
          <div key={idx} className="text-[11px] leading-tight">
            <span className={clsx(
              "font-bold mr-1",
              idx === 0 ? "text-[#7ec699]" : idx === 1 ? "text-[#5fb3b3]" : "text-[#999]"
            )}>
              [{c.range}分]
            </span>
            <span className="text-gray-300">{c.desc}</span>
          </div>
        ))}
      </div>
      {/* 小三角 */}
      <div className="absolute -bottom-1.5 left-4 w-3 h-3 bg-[#1a1a2e] border-r border-b border-[#3a3a5a] transform rotate-45" />
    </div>
  )
}

export default function ProjectCard({ project, currentUser, existingScore, isScoringOpen }: ProjectCardProps) {
  const hasExistingScore = existingScore !== null && existingScore !== undefined

  const [scores, setScores] = useState<Record<DimensionKey, number>>({
    dataScore: existingScore?.dataScore ?? 10,
    infoScore: existingScore?.infoScore ?? 8,
    knowScore: existingScore?.knowScore ?? 8,
    insightScore: existingScore?.insightScore ?? 10,
    approvalScore: existingScore?.approvalScore ?? 5,
    awardScore: existingScore?.awardScore ?? 5,
  })

  const [savedScores, setSavedScores] = useState<Record<DimensionKey, number> | null>(
    hasExistingScore ? {
      dataScore: existingScore!.dataScore,
      infoScore: existingScore!.infoScore,
      knowScore: existingScore!.knowScore,
      insightScore: existingScore!.insightScore,
      approvalScore: existingScore!.approvalScore,
      awardScore: existingScore!.awardScore,
    } : null
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(hasExistingScore)
  const [error, setError] = useState('')
  const [hoveredDimension, setHoveredDimension] = useState<string | null>(null)

  const hasConflict = project.department === currentUser.department

  // 计算加权总分
  const calculateTotal = (s: Record<DimensionKey, number>) => {
    return DIMENSIONS.reduce((sum, dim) => {
      return sum + (s[dim.key] * dim.weight / 100)
    }, 0)
  }

  const totalScore = calculateTotal(scores)

  // 获取维度的最大分值
  const getMaxScore = (key: DimensionKey) => {
    if (key === 'dataScore' || key === 'insightScore') return 20
    return 15
  }

  const handleScoreChange = (key: DimensionKey, value: number) => {
    const max = getMaxScore(key)
    if (value < 1) value = 1
    if (value > max) value = max
    setScores(prev => ({ ...prev, [key]: value }))
  }

  const hasChanges = () => {
    if (!savedScores) return true
    return DIMENSIONS.some(dim => scores[dim.key] !== savedScores[dim.key])
  }

  const handleSubmit = async () => {
    if (hasConflict || !isScoringOpen) return

    setIsSaving(true)
    setError('')

    try {
      await axios.post('/api/scoring/submit', {
        projectId: project.id,
        ...scores
      })
      setIsSaved(true)
      setSavedScores({ ...scores })
    } catch (err: any) {
      setError(err.response?.data?.error || '保存失败，请重试')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className={clsx(
      "float-card p-5 relative overflow-hidden",
      hasConflict && "opacity-60"
    )}>
      {/* 左侧状态指示条 */}
      <div className={clsx(
        "absolute left-0 top-0 bottom-0 w-1 rounded-l-xl",
        hasConflict ? "bg-[#d4a853]" : isSaved ? "bg-[#7ec699]" : "bg-[var(--color-ink-soft)]"
      )} />

      {/* 项目信息 */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[var(--color-text-primary)] truncate" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-[var(--color-text-muted)]">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{project.presenter}</span>
              <span className="text-[var(--color-ink-soft)]">·</span>
              <span className="truncate">{project.department}</span>
            </div>
          </div>
          {isSaved && !hasConflict && (
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#7ec699]/10 border border-[#7ec699]/20">
              <svg className="w-3.5 h-3.5 text-[#7ec699]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-xs text-[#7ec699] font-medium">已评</span>
            </div>
          )}
        </div>
        {project.description && (
          <p className="text-sm text-[var(--color-text-secondary)] mt-2 line-clamp-2">{project.description}</p>
        )}
      </div>

      {/* 评分区域 */}
      <div className="mt-4">
        {hasConflict ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#d4a853]/10 border border-[#d4a853]/20">
            <svg className="w-5 h-5 text-[#d4a853] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm text-[#d4a853]">利益相关 · 同部门项目无法评分</span>
          </div>
        ) : !isScoringOpen ? (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)]">
            <svg className="w-5 h-5 text-[var(--color-text-muted)] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-[var(--color-text-muted)]">评分已关闭</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 总分显示 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)]">
              <span className="text-sm font-medium text-[var(--color-text-secondary)]">DIKI综合得分</span>
              <span className="text-2xl font-black text-[#d4a853]">{totalScore.toFixed(1)}</span>
            </div>

            {/* DIKI范式核心评价 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">DIKI范式核心评价</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIMENSIONS.filter(d => d.category === 'DIKI范式核心评价').map((dim) => (
                  <div key={dim.key} className="p-3 rounded-lg bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)]">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="relative flex items-center gap-1.5 min-w-0 cursor-help"
                        onMouseEnter={() => setHoveredDimension(dim.key)}
                        onMouseLeave={() => setHoveredDimension(null)}
                      >
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">{dim.label}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">({dim.subLabel})</span>
                        <svg className="w-3 h-3 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {hoveredDimension === dim.key && <DimensionTooltip dimension={dim} />}
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 ml-1">{dim.weight}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max={getMaxScore(dim.key)}
                        value={scores[dim.key]}
                        onChange={(e) => handleScoreChange(dim.key, parseInt(e.target.value))}
                        disabled={isSaving}
                        className="flex-1 h-2 bg-[var(--color-ink-medium)] rounded-full appearance-none cursor-pointer min-w-0"
                        style={{
                          background: `linear-gradient(to right, #7ec699 0%, #7ec699 ${((scores[dim.key] - 1) / (getMaxScore(dim.key) - 1)) * 100}%, var(--color-ink-medium) ${((scores[dim.key] - 1) / (getMaxScore(dim.key) - 1)) * 100}%, var(--color-ink-medium) 100%)`
                        }}
                      />
                      <span className="w-8 text-center text-lg font-bold text-[var(--color-text-primary)] flex-shrink-0">{scores[dim.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 应用与认可 */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wider">应用与认可</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {DIMENSIONS.filter(d => d.category === '应用与认可').map((dim) => (
                  <div key={dim.key} className="p-3 rounded-lg bg-[var(--color-ink-light)] border border-[var(--color-ink-soft)]">
                    <div className="flex items-center justify-between mb-2">
                      <div
                        className="relative flex items-center gap-1.5 min-w-0 cursor-help"
                        onMouseEnter={() => setHoveredDimension(dim.key)}
                        onMouseLeave={() => setHoveredDimension(null)}
                      >
                        <span className="text-xs font-bold text-[var(--color-text-primary)]">{dim.label}</span>
                        <span className="text-[10px] text-[var(--color-text-muted)]">({dim.subLabel})</span>
                        <svg className="w-3 h-3 text-[var(--color-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {hoveredDimension === dim.key && <DimensionTooltip dimension={dim} />}
                      </div>
                      <span className="text-[10px] text-[var(--color-text-muted)] flex-shrink-0 ml-1">{dim.weight}%</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="1"
                        max={getMaxScore(dim.key)}
                        value={scores[dim.key]}
                        onChange={(e) => handleScoreChange(dim.key, parseInt(e.target.value))}
                        disabled={isSaving}
                        className="flex-1 h-2 bg-[var(--color-ink-medium)] rounded-full appearance-none cursor-pointer min-w-0"
                        style={{
                          background: `linear-gradient(to right, #5fb3b3 0%, #5fb3b3 ${((scores[dim.key] - 1) / (getMaxScore(dim.key) - 1)) * 100}%, var(--color-ink-medium) ${((scores[dim.key] - 1) / (getMaxScore(dim.key) - 1)) * 100}%, var(--color-ink-medium) 100%)`
                        }}
                      />
                      <span className="w-8 text-center text-lg font-bold text-[var(--color-text-primary)] flex-shrink-0">{scores[dim.key]}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end items-center gap-3">
              {error && (
                <span className="text-[#e85a5a] text-xs flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </span>
              )}
              <button
                onClick={handleSubmit}
                disabled={isSaving || (isSaved && !hasChanges())}
                className={clsx(
                  "px-5 py-2.5 rounded-lg text-sm font-bold transition-all duration-300 flex items-center gap-2",
                  isSaved && !hasChanges()
                    ? "bg-[var(--color-ink-medium)] text-[var(--color-text-muted)] cursor-not-allowed"
                    : isSaved
                      ? "bg-[var(--color-ink-medium)] text-[var(--color-text-primary)] hover:bg-[var(--color-ink-soft)] border border-[var(--color-ink-soft)] hover:border-[#d4a853]"
                      : "vermilion-gradient text-[var(--color-text-primary)] shadow-lg shadow-[#c53d43]/20 hover:shadow-xl hover:shadow-[#c53d43]/30 hover:scale-[1.02]"
                )}
              >
                {isSaving ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    保存中...
                  </>
                ) : isSaved ? (
                  hasChanges() ? '更新评分' : '已保存'
                ) : (
                  <>
                    提交评分
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
