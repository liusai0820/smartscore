'use client'

import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { clsx } from 'clsx'

interface User {
  id: string
  name: string
  role: string
  department: string
  isActive: boolean
}

interface ReviewerManagerProps {
  users: User[]
}

export default function ReviewerManager({ users }: ReviewerManagerProps) {
  const [localUsers, setLocalUsers] = useState(users)
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  // 分组: 领导 (LEADER) 和 部门负责人 (DEPT_HEAD)
  const leaders = localUsers.filter(u => u.role === 'LEADER')
  const deptHeads = localUsers.filter(u => u.role === 'DEPT_HEAD')

  const handleToggle = async (userId: string) => {
    setLoading(userId)
    try {
      const res = await axios.post(`/api/admin/users/${userId}/toggle`)
      setLocalUsers(prev => prev.map(u =>
        u.id === userId ? { ...u, isActive: res.data.user.isActive } : u
      ))
      router.refresh()
    } catch (error: any) {
      if (error.response?.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      alert('操作失败，请重试')
    } finally {
      setLoading(null)
    }
  }

  const renderUserCard = (user: User) => (
    <div
      key={user.id}
      className={clsx(
        "flex items-center justify-between p-3 rounded-lg border transition-all",
        user.isActive
          ? "bg-[var(--color-ink-light)] border-[var(--color-ink-soft)]"
          : "bg-[#e85a5a]/5 border-[#e85a5a]/20 opacity-60"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={clsx(
          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          user.isActive
            ? "bg-[#7ec699]/20 text-[#7ec699]"
            : "bg-[#e85a5a]/20 text-[#e85a5a]"
        )}>
          {user.isActive ? '✓' : '✗'}
        </div>
        <div className="min-w-0">
          <div className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {user.name}
          </div>
          <div className="text-xs text-[var(--color-text-muted)] truncate">
            {user.department}
          </div>
        </div>
      </div>
      <button
        onClick={() => handleToggle(user.id)}
        disabled={loading === user.id}
        className={clsx(
          "px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex-shrink-0",
          user.isActive
            ? "bg-[#e85a5a]/10 text-[#e85a5a] hover:bg-[#e85a5a]/20 border border-[#e85a5a]/20"
            : "bg-[#7ec699]/10 text-[#7ec699] hover:bg-[#7ec699]/20 border border-[#7ec699]/20",
          loading === user.id && "opacity-50 cursor-not-allowed"
        )}
      >
        {loading === user.id ? (
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        ) : user.isActive ? '禁用' : '启用'}
      </button>
    </div>
  )

  const activeCount = localUsers.filter(u => u.isActive).length
  const leaderActiveCount = leaders.filter(u => u.isActive).length
  const deptHeadActiveCount = deptHeads.filter(u => u.isActive).length

  return (
    <div className="float-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#5fb3b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">评审员管理</h2>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[#7ec699]/10 text-[#7ec699] border border-[#7ec699]/20">
          <span className="w-2 h-2 rounded-full bg-[#7ec699]" />
          {activeCount} / {localUsers.length} 在线
        </div>
      </div>

      {/* 领导组 (3+2) */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">领导层</span>
          <span className="text-xs text-[var(--color-text-muted)]">({leaderActiveCount}/{leaders.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {leaders.map(renderUserCard)}
        </div>
      </div>

      {/* 部门负责人组 */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">部门负责人</span>
          <span className="text-xs text-[var(--color-text-muted)]">({deptHeadActiveCount}/{deptHeads.length})</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {deptHeads.map(renderUserCard)}
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--color-text-muted)] text-center">
        禁用的评审员无法登录系统，其已提交的评分仍然有效
      </p>
    </div>
  )
}
