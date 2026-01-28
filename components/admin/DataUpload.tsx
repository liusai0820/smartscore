'use client'

import { useState, useRef } from 'react'
import axios from 'axios'

interface Project {
  name: string
  department: string
  presenter: string
  description: string
}

export default function DataUpload() {
  const [activeTab, setActiveTab] = useState<'json' | 'file'>('json')

  // JSON State
  const [jsonInput, setJsonInput] = useState('')

  // File Upload State
  const [file, setFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [parsedProjects, setParsedProjects] = useState<Project[]>([])
  const [hasAnalyzed, setHasAnalyzed] = useState(false)

  // Shared State
  const [loading, setLoading] = useState(false)
  const [loadingMock, setLoadingMock] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error' | ''; message: string }>({ type: '', message: '' })

  const fileInputRef = useRef<HTMLInputElement>(null)

  // 加载模拟数据
  const handleLoadMockData = async () => {
    if (!confirm('确定要加载模拟数据吗？这将清空现有的所有项目和评分数据。')) return

    setLoadingMock(true)
    setStatus({ type: '', message: '正在加载模拟数据...' })

    try {
      const res = await axios.post('/api/admin/load-mock')
      setStatus({
        type: 'success',
        message: `模拟数据加载成功！已创建 ${res.data.projectsCreated} 个项目`
      })
    } catch (error: any) {
      console.error(error)
      if (error.response?.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      setStatus({
        type: 'error',
        message: '加载失败：' + (error.response?.data?.error || error.message)
      })
    } finally {
      setLoadingMock(false)
    }
  }

  const handleJsonUpload = async () => {
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
      if (error.response?.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      setStatus({
        type: 'error',
        message: '错误：' + (error.response?.data?.error || error.message || 'JSON格式无效')
      })
    } finally {
      setLoading(false)
    }
  }

  const handleAiAnalyze = async () => {
    if (!file) return

    setIsAnalyzing(true)
    setStatus({ type: '', message: '正在进行AI分析...' })
    setParsedProjects([])
    setHasAnalyzed(false)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await axios.post('/api/admin/ai-parse', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      const projects = res.data.projects || []
      setParsedProjects(projects.map((p: any) => ({
        name: p.name || '',
        department: p.department || '',
        presenter: p.presenter || '',
        description: p.description || ''
      })))
      setHasAnalyzed(true)
      setStatus({ type: 'success', message: 'AI分析完成，请确认数据并导入' })
    } catch (error: any) {
      console.error(error)
      if (error.response?.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      setStatus({
        type: 'error',
        message: '分析失败：' + (error.response?.data?.error || error.message || '未知错误')
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleFileImport = async () => {
    if (parsedProjects.length === 0) return

    setLoading(true)
    setStatus({ type: '', message: '正在导入...' })

    try {
      const data = {
        users: [],
        projects: parsedProjects
      }
      const res = await axios.post('/api/admin/upload', data)
      setStatus({
        type: 'success',
        message: `导入成功！已创建 ${res.data.details.projectsCreated} 个项目`
      })
      // Clear after success
      setParsedProjects([])
      setHasAnalyzed(false)
      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    } catch (error: any) {
      console.error(error)
      if (error.response?.status === 401) {
        window.location.href = '/admin/login'
        return
      }
      setStatus({
        type: 'error',
        message: '导入失败：' + (error.response?.data?.error || error.message)
      })
    } finally {
      setLoading(false)
    }
  }

  const updateProject = (index: number, field: keyof Project, value: string) => {
    const newProjects = [...parsedProjects]
    newProjects[index] = { ...newProjects[index], [field]: value }
    setParsedProjects(newProjects)
  }

  const removeProject = (index: number) => {
    setParsedProjects(parsedProjects.filter((_, i) => i !== index))
  }

  const addRow = () => {
    setParsedProjects([...parsedProjects, { name: '', department: '', presenter: '', description: '' }])
  }

  return (
    <div className="float-card p-6">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <h2 className="text-lg font-bold text-[var(--color-text-primary)]">数据上传</h2>
        </div>
        <button
          onClick={handleLoadMockData}
          disabled={loadingMock}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-ink-medium)] text-[var(--color-text-secondary)] text-xs font-medium hover:bg-[var(--color-ink-soft)] hover:text-[var(--color-text-primary)] transition-all disabled:opacity-50"
        >
          {loadingMock ? (
            <>
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              加载中...
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              加载模拟数据
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-6 border-b border-[var(--color-ink-soft)]">
        <button
          onClick={() => { setActiveTab('json'); setStatus({ type: '', message: '' }) }}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'json'
            ? 'text-[#d4a853]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
        >
          JSON 粘贴
          {activeTab === 'json' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4a853]" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('file'); setStatus({ type: '', message: '' }) }}
          className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'file'
            ? 'text-[#d4a853]'
            : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]'
            }`}
        >
          AI 文件上传
          {activeTab === 'file' && (
            <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#d4a853]" />
          )}
        </button>
      </div>

      {activeTab === 'json' ? (
        <>
          {/* Existing JSON UI */}
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
              onClick={handleJsonUpload}
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
          </div>
        </>
      ) : (
        <div className="space-y-6">
          {/* File Input Area */}
          <div className="p-6 rounded-xl bg-[var(--color-ink)] border border-dashed border-[var(--color-ink-soft)] hover:border-[#d4a853] transition-colors text-center">
            <input
              type="file"
              ref={fileInputRef}
              accept=".xlsx,.xls,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer block">
              <div className="mx-auto w-12 h-12 rounded-full bg-[var(--color-ink-medium)] flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-[#d4a853]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm font-medium text-[var(--color-text-primary)] mb-1">
                {file ? file.name : '点击选择文件'}
              </p>
              <p className="text-xs text-[var(--color-text-muted)]">
                支持 .xlsx, .xls, .docx
              </p>
            </label>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-end">
            <button
              onClick={handleAiAnalyze}
              disabled={isAnalyzing || !file}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[var(--color-ink-medium)] text-[var(--color-text-primary)] font-bold hover:bg-[var(--color-ink-soft)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  分析中...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  开始 AI 分析
                </>
              )}
            </button>
          </div>

          {/* Preview Table */}
          {(hasAnalyzed || parsedProjects.length > 0) && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
                  解析结果预览 ({parsedProjects.length} 个项目)
                </h3>
                <button onClick={addRow} className="text-xs text-[#d4a853] hover:underline">
                  + 添加一行
                </button>
              </div>
              <div className="overflow-x-auto rounded-lg border border-[var(--color-ink-soft)]">
                <table className="w-full text-sm text-left">
                  <thead className="bg-[var(--color-ink-medium)] text-[var(--color-text-muted)]">
                    <tr>
                      <th className="px-4 py-2 whitespace-nowrap">项目名称</th>
                      <th className="px-4 py-2 whitespace-nowrap">部门</th>
                      <th className="px-4 py-2 whitespace-nowrap">汇报人</th>
                      <th className="px-4 py-2 whitespace-nowrap">描述</th>
                      <th className="px-4 py-2 w-16">操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-ink-soft)]">
                    {parsedProjects.map((project, index) => (
                      <tr key={index} className="bg-[var(--color-ink)]">
                        <td className="p-2">
                          <input
                            type="text"
                            value={project.name}
                            onChange={e => updateProject(index, 'name', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 p-1 text-[var(--color-text-primary)]"
                            placeholder="项目名称"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={project.department}
                            onChange={e => updateProject(index, 'department', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 p-1 text-[var(--color-text-primary)]"
                            placeholder="部门"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={project.presenter}
                            onChange={e => updateProject(index, 'presenter', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 p-1 text-[var(--color-text-primary)]"
                            placeholder="汇报人"
                          />
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={project.description}
                            onChange={e => updateProject(index, 'description', e.target.value)}
                            className="w-full bg-transparent border-none focus:ring-0 p-1 text-[var(--color-text-primary)]"
                            placeholder="描述"
                          />
                        </td>
                        <td className="p-2 text-center">
                          <button
                            onClick={() => removeProject(index)}
                            className="text-[#e85a5a] hover:bg-[#e85a5a]/10 p-1 rounded"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {parsedProjects.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-4 py-8 text-center text-[var(--color-text-muted)]">
                          暂无数据
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleFileImport}
                  disabled={loading || parsedProjects.length === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-lg vermilion-gradient text-[var(--color-text-primary)] font-bold shadow-lg shadow-[#c53d43]/20 hover:shadow-xl hover:shadow-[#c53d43]/30 hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      导入项目
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                      确认导入
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Shared Status Message */}
      {status.message && (
        <div className={`mt-4 flex items-center gap-2 text-sm ${status.type === 'success' ? 'text-[#7ec699]' :
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

      {/* Format Help (only show for JSON tab) */}
      {activeTab === 'json' && (
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
      )}
    </div>
  )
}
