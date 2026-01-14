'use client'

import { useState } from 'react'
import axios from 'axios'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'
import { Project } from '@prisma/client'

interface AdminControlsProps {
  initialState: string
  initialProjectId: string | null
  projects: Project[]
}

export default function AdminControls({ initialState, initialProjectId, projects }: AdminControlsProps) {
  const [state, setState] = useState(initialState)
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(initialProjectId)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateState = async (newState: string) => {
    setLoading(true)
    try {
      await axios.post('/api/admin/state', { state: newState })
      setState(newState)
      router.refresh()
    } catch (error) {
      alert('状态更新失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const selectProject = async (projectId: string | null) => {
    setLoading(true)
    try {
      await axios.post('/api/admin/state', { currentProjectId: projectId })
      setCurrentProjectId(projectId)
      router.refresh()
    } catch (error) {
      alert('项目切换失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  const getStateInfo = () => {
    switch (state) {
      case 'SCORING':
        return { label: '评分进行中', color: '#7ec699', icon: 'play' }
      case 'REVEALED':
        return { label: '结果已公布', color: '#5fb3b3', icon: 'eye' }
      default:
        return { label: '评分已关闭', color: '#e85a5a', icon: 'lock' }
    }
  }

  const stateInfo = getStateInfo()
  const currentProject = projects.find(p => p.id === currentProjectId)
  const currentIndex = currentProjectId ? projects.findIndex(p => p.id === currentProjectId) : -1

  return (
    <div className="space-y-6">
      {/* 系统状态控制 */}
      <div className="float-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            <h2 className="text-lg font-bold text-[#f5f1eb]">系统状态控制</h2>
          </div>
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium"
            style={{
              backgroundColor: `${stateInfo.color}15`,
              color: stateInfo.color,
              border: `1px solid ${stateInfo.color}30`
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: stateInfo.color }}
            />
            {stateInfo.label}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 关闭评分 */}
          <button
            onClick={() => updateState('CLOSED')}
            disabled={loading || state === 'CLOSED'}
            className={clsx(
              "relative p-5 rounded-xl border-2 transition-all duration-300 text-left group",
              state === 'CLOSED'
                ? "border-[#e85a5a] bg-[#e85a5a]/10"
                : "border-[#30363d] bg-[#161b22] hover:border-[#e85a5a]/50 hover:bg-[#e85a5a]/5"
            )}
          >
            <div className={clsx(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
              state === 'CLOSED' ? "bg-[#e85a5a]/20" : "bg-[#21262d] group-hover:bg-[#e85a5a]/10"
            )}>
              <svg className={clsx("w-5 h-5", state === 'CLOSED' ? "text-[#e85a5a]" : "text-[#6e7681] group-hover:text-[#e85a5a]")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className={clsx("font-bold mb-1", state === 'CLOSED' ? "text-[#e85a5a]" : "text-[#f5f1eb]")}>
              {state === 'CLOSED' ? '当前状态' : '关闭评分'}
            </h3>
            <p className="text-xs text-[#6e7681]">停止接受新的评分提交</p>
            {state === 'CLOSED' && (
              <div className="absolute top-3 right-3">
                <svg className="w-5 h-5 text-[#e85a5a]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* 开始评分 */}
          <button
            onClick={() => updateState('SCORING')}
            disabled={loading || state === 'SCORING'}
            className={clsx(
              "relative p-5 rounded-xl border-2 transition-all duration-300 text-left group",
              state === 'SCORING'
                ? "border-[#7ec699] bg-[#7ec699]/10"
                : "border-[#30363d] bg-[#161b22] hover:border-[#7ec699]/50 hover:bg-[#7ec699]/5"
            )}
          >
            <div className={clsx(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
              state === 'SCORING' ? "bg-[#7ec699]/20" : "bg-[#21262d] group-hover:bg-[#7ec699]/10"
            )}>
              <svg className={clsx("w-5 h-5", state === 'SCORING' ? "text-[#7ec699]" : "text-[#6e7681] group-hover:text-[#7ec699]")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className={clsx("font-bold mb-1", state === 'SCORING' ? "text-[#7ec699]" : "text-[#f5f1eb]")}>
              {state === 'SCORING' ? '当前状态' : '开始评分'}
            </h3>
            <p className="text-xs text-[#6e7681]">允许评审员提交评分</p>
            {state === 'SCORING' && (
              <div className="absolute top-3 right-3">
                <svg className="w-5 h-5 text-[#7ec699]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          {/* 公布结果 */}
          <button
            onClick={() => updateState('REVEALED')}
            disabled={loading || state === 'REVEALED'}
            className={clsx(
              "relative p-5 rounded-xl border-2 transition-all duration-300 text-left group",
              state === 'REVEALED'
                ? "border-[#5fb3b3] bg-[#5fb3b3]/10"
                : "border-[#30363d] bg-[#161b22] hover:border-[#5fb3b3]/50 hover:bg-[#5fb3b3]/5"
            )}
          >
            <div className={clsx(
              "w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-colors",
              state === 'REVEALED' ? "bg-[#5fb3b3]/20" : "bg-[#21262d] group-hover:bg-[#5fb3b3]/10"
            )}>
              <svg className={clsx("w-5 h-5", state === 'REVEALED' ? "text-[#5fb3b3]" : "text-[#6e7681] group-hover:text-[#5fb3b3]")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <h3 className={clsx("font-bold mb-1", state === 'REVEALED' ? "text-[#5fb3b3]" : "text-[#f5f1eb]")}>
              {state === 'REVEALED' ? '当前状态' : '公布结果'}
            </h3>
            <p className="text-xs text-[#6e7681]">在大屏展示最终排名</p>
            {state === 'REVEALED' && (
              <div className="absolute top-3 right-3">
                <svg className="w-5 h-5 text-[#5fb3b3]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center justify-center gap-2 text-[#6e7681] text-sm">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            正在更新状态...
          </div>
        )}
      </div>

      {/* 当前评分项目控制 */}
      <div className="float-card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-[#c53d43]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h2 className="text-lg font-bold text-[#f5f1eb]">当前评分项目</h2>
          </div>
          {currentProject && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[#c53d43]/10 text-[#c53d43] border border-[#c53d43]/30">
              <span className="w-2 h-2 rounded-full bg-[#c53d43] animate-pulse" />
              第 {currentIndex + 1} / {projects.length} 个
            </div>
          )}
        </div>

        {/* 当前项目显示 */}
        {currentProject ? (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-[#c53d43]/10 to-[#d4a853]/10 border border-[#c53d43]/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-[#6e7681] mb-1">正在评分</div>
                <div className="text-xl font-bold text-[#f5f1eb]">{currentProject.name}</div>
                <div className="text-sm text-[#a0a0a0] mt-1">{currentProject.department} · {currentProject.presenter}</div>
              </div>
              <button
                onClick={() => selectProject(null)}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#21262d] border border-[#30363d] text-[#6e7681] hover:text-[#e85a5a] hover:border-[#e85a5a]/50 transition-colors text-sm"
              >
                结束评分
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 rounded-xl bg-[#21262d] border border-[#30363d] text-center">
            <p className="text-[#6e7681]">请选择一个项目开始评分</p>
          </div>
        )}

        {/* 项目列表 */}
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {projects.map((project, index) => (
            <button
              key={project.id}
              onClick={() => selectProject(project.id)}
              disabled={loading || project.id === currentProjectId}
              className={clsx(
                "w-full p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-center gap-4",
                project.id === currentProjectId
                  ? "border-[#c53d43] bg-[#c53d43]/10"
                  : "border-[#30363d] bg-[#161b22] hover:border-[#d4a853]/50 hover:bg-[#d4a853]/5"
              )}
            >
              <div className={clsx(
                "w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0",
                project.id === currentProjectId
                  ? "bg-[#c53d43] text-[#f5f1eb]"
                  : "bg-[#21262d] text-[#6e7681]"
              )}>
                {index + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className={clsx(
                  "font-medium truncate",
                  project.id === currentProjectId ? "text-[#f5f1eb]" : "text-[#a0a0a0]"
                )}>
                  {project.name}
                </div>
                <div className="text-xs text-[#6e7681] truncate">
                  {project.department} · {project.presenter}
                </div>
              </div>
              {project.id === currentProjectId && (
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-[#c53d43]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 危险操作区 */}
      <div className="float-card p-6 border-red-900/30 bg-red-900/5">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="text-lg font-bold text-red-500">危险操作区</h2>
        </div>

        <button
          onClick={async () => {
            if (confirm('确定要重置所有数据吗？此操作将删除所有评分记录且不可恢复！')) {
              setLoading(true)
              try {
                await axios.post('/api/admin/reset')
                alert('数据已重置')
                router.refresh()
                // Reset local state if needed
                setState('CLOSED')
                setCurrentProjectId(null)
              } catch (error) {
                alert('重置失败，请重试')
              } finally {
                setLoading(false)
              }
            }
          }}
          disabled={loading}
          className="w-full p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          <span className="font-bold">重置所有数据</span>
        </button>
        <p className="mt-2 text-xs text-red-400/60 text-center">
          将清空所有评分记录，重置系统状态为关闭，且取消当前选中项目。用户和项目数据将保留。
        </p>
      </div>
    </div>
  )
}
