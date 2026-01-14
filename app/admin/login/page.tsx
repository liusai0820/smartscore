'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      router.push('/admin')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-ink)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl vermilion-gradient mx-auto flex items-center justify-center shadow-lg shadow-[#c53d43]/20 mb-4">
            <svg className="w-8 h-8 text-[var(--color-text-primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)]" style={{ fontFamily: 'var(--font-noto-serif)' }}>
            管理员登录
          </h1>
          <p className="text-[var(--color-text-muted)] mt-2">
            请输入管理员密码以继续
          </p>
        </div>

        <div className="float-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text-secondary)] mb-2">
                密码
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)] rounded-lg px-4 py-3 text-[var(--color-text-primary)] focus:outline-none focus:border-[#c53d43] transition-colors"
                placeholder="请输入密码"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[#c53d43]/10 border border-[#c53d43]/20 text-[#e85a5a] text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg vermilion-gradient text-[var(--color-text-primary)] font-medium shadow-lg shadow-[#c53d43]/20 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '登录中...' : '进入控制台'}
            </button>
          </form>
        </div>

        <div className="mt-8 text-center">
             <a href="/" className="text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)] text-sm transition-colors">
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}
