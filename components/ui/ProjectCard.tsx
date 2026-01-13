'use client'

import { useState } from 'react'
import { Project, User, Score } from '@prisma/client'
import axios from 'axios'
import { clsx } from 'clsx'

interface ProjectCardProps {
  project: Project
  currentUser: User
  existingScore?: Pick<Score, 'valueScore' | 'innovScore' | 'feasiScore' | 'outputScore'> | null
  isScoringOpen: boolean
}

// 评分维度配置
const DIMENSIONS = [
  { key: 'valueScore', label: '研究价值', weight: 30, icon: '📊' },
  { key: 'innovScore', label: '创新性', weight: 25, icon: '💡' },
  { key: 'feasiScore', label: '可行性', weight: 25, icon: '🎯' },
  { key: 'outputScore', label: '预期成果', weight: 20, icon: '🏆' },
] as const

type DimensionKey = typeof DIMENSIONS[number]['key']

export default function ProjectCard({ project, currentUser, existingScore, isScoringOpen }: ProjectCardProps) {
  const hasExistingScore = existingScore !== null && existingScore !== undefined

  const [scores, setScores] = useState<Record<DimensionKey, number>>({
    valueScore: existingScore?.valueScore ?? 7,
    innovScore: existingScore?.innovScore ?? 7,
    feasiScore: existingScore?.feasiScore ?? 7,
    outputScore: existingScore?.outputScore ?? 7,
  })

  const [savedScores, setSavedScores] = useState<Record<DimensionKey, number> | null>(
    hasExistingScore ? {
      valueScore: existingScore!.valueScore,
      innovScore: existingScore!.innovScore,
      feasiScore: existingScore!.feasiScore,
      outputScore: existingScore!.outputScore,
    } : null
  )

  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(hasExistingScore)
  const [error, setError] = useState('')

  const hasConflict = project.department === currentUser.department

  // 计算加权总分
  const calculateTotal = (s: Record<DimensionKey, number>) => {
    return DIMENSIONS.reduce((sum, dim) => {
      return sum + (s[dim.key] * dim.weight / 10)
    }, 0)
  }

  const totalScore = calculateTotal(scores)

  const handleScoreChange = (key: DimensionKey, value: number) => {
    if (value < 1) value = 1
    if (value > 10) value = 10
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
        hasConflict ? "bg-[#d4a853]" : isSaved ? "bg-[#7ec699]" : "bg-[#30363d]"
      )} />

      {/* 项目信息 */}
      <div className="mb-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-[#f5f1eb] truncate" style={{ fontFamily: 'var(--font-noto-serif)' }}>
              {project.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-[#6e7681]">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="truncate">{project.presenter}</span>
              <span className="text-[#30363d]">·</span>
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
          <p className="text-sm text-[#a0a0a0] mt-2 line-clamp-2">{project.description}</p>
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
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
            <svg className="w-5 h-5 text-[#6e7681] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-sm text-[#6e7681]">评分已关闭</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 总分显示 */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
              <span className="text-sm font-medium text-[#a0a0a0]">加权总分</span>
              <span className="text-2xl font-black text-[#d4a853]">{totalScore.toFixed(1)}</span>
            </div>

            {/* 4维度评分 */}
            <div className="grid grid-cols-2 gap-3">
              {DIMENSIONS.map((dim) => (
                <div key={dim.key} className="p-3 rounded-lg bg-[#161b22] border border-[#30363d]">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base">{dim.icon}</span>
                      <span className="text-xs font-medium text-[#a0a0a0]">{dim.label}</span>
                    </div>
                    <span className="text-[10px] text-[#6e7681]">{dim.weight}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={scores[dim.key]}
                      onChange={(e) => handleScoreChange(dim.key, parseInt(e.target.value))}
                      disabled={isSaving}
                      className="flex-1 h-2 bg-[#21262d] rounded-full appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, #7ec699 0%, #7ec699 ${(scores[dim.key] - 1) * 11.11}%, #21262d ${(scores[dim.key] - 1) * 11.11}%, #21262d 100%)`
                      }}
                    />
                    <span className="w-8 text-center text-lg font-bold text-[#f5f1eb]">{scores[dim.key]}</span>
                  </div>
                </div>
              ))}
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
                    ? "bg-[#21262d] text-[#6e7681] cursor-not-allowed"
                    : isSaved
                    ? "bg-[#21262d] text-[#f5f1eb] hover:bg-[#30363d] border border-[#30363d] hover:border-[#d4a853]"
                    : "vermilion-gradient text-[#f5f1eb] shadow-lg shadow-[#c53d43]/20 hover:shadow-xl hover:shadow-[#c53d43]/30 hover:scale-[1.02]"
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
