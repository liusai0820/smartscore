'use client'

import { useState } from 'react'
import axios from 'axios'

export default function DataUpload() {
  const [jsonInput, setJsonInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' })

  const handleUpload = async () => {
    if (!jsonInput.trim()) return

    setLoading(true)
    setStatus({ type: '', message: '正在上传...' })

    try {
      const data = JSON.parse(jsonInput)
      const res = await axios.post('/api/admin/upload', data)
      setStatus({
        type: 'success',
        message: `上传成功！已创建 ${res.data.details.usersCreated} 个用户，${res.data.details.projectsCreated} 个项目`
      })
      setJsonInput('')
    } catch (error: any) {
      console.error(error)
      setStatus({
        type: 'error',
        message: '错误：' + (error.response?.data?.error || error.message || 'JSON格式无效')
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="float-card p-6">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-5 h-5 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <h2 className="text-lg font-bold text-[var(--color-text-primary)]">数据上传</h2>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] mb-4">
        粘贴包含 <code className="px-1.5 py-0.5 rounded bg-[var(--color-ink-medium)] text-[#d4a853] text-xs">&quot;users&quot;</code> 和{' '}
        <code className="px-1.5 py-0.5 rounded bg-[var(--color-ink-medium)] text-[#d4a853] text-xs">&quot;projects&quot;</code> 数组的 JSON 对象
      </p>

      <div className="relative">
        <textarea
          className="w-full h-48 p-4 rounded-xl bg-[var(--color-ink)] border border-[var(--color-ink-soft)] text-[var(--color-text-primary)] font-mono text-sm resize-none focus:outline-none focus:border-[#d4a853] focus:ring-1 focus:ring-[#d4a853]/50 transition-all placeholder:text-[var(--color-text-muted)]"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder={`{
  "users": [
    { "name": "张三", "department": "技术部", "role": "reviewer", "passcode": "1234" }
  ],
  "projects": [
    { "name": "项目A", "department": "技术部", "presenter": "李四", "description": "项目描述" }
  ]
}`}
        />
        {jsonInput && (
          <button
            onClick={() => setJsonInput('')}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-[var(--color-ink-medium)] text-[var(--color-text-muted)] hover:text-[#e85a5a] hover:bg-[#e85a5a]/10 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleUpload}
          disabled={loading || !jsonInput}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg vermilion-gradient text-[var(--color-text-primary)] font-bold shadow-lg shadow-[#c53d43]/20 hover:shadow-xl hover:shadow-[#c53d43]/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {loading ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              上传中...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              上传数据
            </>
          )}
        </button>

        {status.message && (
          <div className={`flex items-center gap-2 text-sm ${
            status.type === 'success' ? 'text-[#7ec699]' :
            status.type === 'error' ? 'text-[#e85a5a]' :
            'text-[var(--color-text-muted)]'
          }`}>
            {status.type === 'success' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {status.type === 'error' && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* 格式说明 */}
      <div className="mt-6 p-4 rounded-lg bg-[var(--color-ink)] border border-[var(--color-ink-soft)]">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mb-2 flex items-center gap-2">
          <svg className="w-4 h-4 text-[#5fb3b3]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          数据格式说明
        </h3>
        <div className="text-xs text-[var(--color-text-muted)] space-y-1">
          <p><span className="text-[#d4a853]">users</span>: name（姓名）、department（部门）、role（角色）、passcode（密码）</p>
          <p><span className="text-[#d4a853]">projects</span>: name（项目名）、department（所属部门）、presenter（汇报人）、description（描述）</p>
        </div>
      </div>
    </div>
  )
}
