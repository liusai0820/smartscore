'use client'

import { useState } from 'react'
import axios from 'axios'

export default function DataUpload() {
  const [jsonInput, setJsonInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState('')

  const handleUpload = async () => {
    if (!jsonInput.trim()) return

    setLoading(true)
    setStatus('Uploading...')

    try {
      const data = JSON.parse(jsonInput)
      const res = await axios.post('/api/admin/upload', data)
      setStatus(`Success! Users: ${res.data.details.usersCreated}, Projects: ${res.data.details.projectsCreated}`)
      setJsonInput('')
    } catch (error: any) {
      console.error(error)
      setStatus('Error: ' + (error.response?.data?.error || error.message || 'Invalid JSON'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Upload Data</h2>
      <p className="text-sm text-gray-500 mb-2">
        Paste JSON object with "users" and "projects" arrays.
      </p>
      <textarea
        className="w-full h-48 p-2 border border-gray-300 rounded font-mono text-sm mb-4"
        value={jsonInput}
        onChange={(e) => setJsonInput(e.target.value)}
        placeholder='{ "users": [...], "projects": [...] }'
      />
      <div className="flex items-center justify-between">
        <button
          onClick={handleUpload}
          disabled={loading || !jsonInput}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Upload Data'}
        </button>
        {status && <span className="text-sm font-medium">{status}</span>}
      </div>
    </div>
  )
}
