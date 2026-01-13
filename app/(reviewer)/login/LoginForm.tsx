'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import { User } from '@prisma/client'

export default function LoginForm({ users }: { users: Pick<User, 'id' | 'name' | 'department'>[] }) {
  const router = useRouter()
  const [selectedUserId, setSelectedUserId] = useState('')
  const [passcode, setPasscode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = users.find(u => u.id === selectedUserId)
      if (!user) {
        setError('请选择您的姓名')
        setLoading(false)
        return
      }

      await axios.post('/api/auth/login', {
        name: user.name,
        passcode
      })

      router.push('/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.response?.data?.error || '登录失败，请重试')
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md animate-fade-in-up">
      {/* 卡片容器 */}
      <div className="float-card p-8">
        {/* 标题区 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl vermilion-gradient shadow-lg shadow-[#c53d43]/30 mb-4">
            <svg className="w-8 h-8 text-[#f5f1eb]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[#f5f1eb] mb-2" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            评审员登录
          </h1>
          <p className="text-[#6e7681] text-sm">
            请选择您的身份并输入密码
          </p>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 用户选择 */}
          <div>
            <label className="label-text flex items-center gap-2">
              <svg className="w-4 h-4 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              选择姓名
            </label>
            <div className="relative">
              <select
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
                className="input-field w-full appearance-none cursor-pointer pr-10"
                required
              >
                <option value="">-- 请选择 --</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-[#6e7681]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* 密码输入 */}
          <div>
            <label className="label-text flex items-center gap-2">
              <svg className="w-4 h-4 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              登录密码
            </label>
            <input
              type="password"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              className="input-field w-full"
              placeholder="请输入密码"
              required
            />
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-[#c53d43]/10 border border-[#c53d43]/30">
              <svg className="w-5 h-5 text-[#e85a5a] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-[#e85a5a] text-sm">{error}</span>
            </div>
          )}

          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl vermilion-gradient text-[#f5f1eb] font-bold text-lg shadow-lg shadow-[#c53d43]/30 transition-all duration-300 hover:shadow-xl hover:shadow-[#c53d43]/40 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>登录中...</span>
              </>
            ) : (
              <>
                <span>登录系统</span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* 底部提示 */}
        <div className="mt-6 pt-6 border-t border-[#30363d] text-center">
          <p className="text-[#6e7681] text-xs">
            如忘记密码，请联系系统管理员
          </p>
        </div>
      </div>
    </div>
  )
}
