'use client'

import { useState } from 'react'
import { Project } from '@prisma/client'
import axios from 'axios'
import { clsx } from 'clsx'

interface ProjectEditorProps {
  project?: Project
  onSave: () => void
  onCancel: () => void
}

export default function ProjectEditor({ project, onSave, onCancel }: ProjectEditorProps) {
  const [formData, setFormData] = useState({
    name: project?.name || '',
    department: project?.department || '',
    presenter: project?.presenter || '',
    description: project?.description || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (project) {
        // Edit existing project
        await axios.patch(`/api/projects/${project.id}`, formData)
      } else {
        // Create new project (not implemented yet in this iteration, but structure allows it)
        // await axios.post('/api/projects', formData)
      }
      onSave()
    } catch (err) {
      setError('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          项目名称
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[#58a6ff]"
          placeholder="请输入项目名称"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            所属部门
          </label>
          <input
            type="text"
            required
            value={formData.department}
            onChange={e => setFormData({ ...formData, department: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[#58a6ff]"
            placeholder="例如：技术部"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
            汇报人
          </label>
          <input
            type="text"
            required
            value={formData.presenter}
            onChange={e => setFormData({ ...formData, presenter: e.target.value })}
            className="w-full px-3 py-2 bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[#58a6ff]"
            placeholder="例如：张三"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1">
          项目描述
        </label>
        <textarea
          rows={3}
          value={formData.description || ''}
          onChange={e => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 bg-[var(--color-ink-medium)] border border-[var(--color-ink-soft)] rounded-lg text-[var(--color-text-primary)] focus:outline-none focus:border-[#58a6ff] resize-none"
          placeholder="可选：输入项目简要描述"
        />
      </div>

      {error && (
        <div className="text-red-400 text-sm">{error}</div>
      )}

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--color-ink-soft)]">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-2 text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-ink-soft)] rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "px-4 py-2 text-sm font-bold text-white bg-[#238636] hover:bg-[#2ea043] rounded-lg transition-colors shadow-sm",
            loading && "opacity-50 cursor-not-allowed"
          )}
        >
          {loading ? '保存中...' : '保存更改'}
        </button>
      </div>
    </form>
  )
}
