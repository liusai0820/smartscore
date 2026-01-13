'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { clsx } from 'clsx'

type Result = {
  id: string
  name: string
  department: string
  presenter: string
  scoreCount: number
  leaderAvg: number | null
  deptHeadAvg: number | null
  finalScore: number | null
  progress: number
}

type ApiResponse = {
  state: string
  results: Result[]
}

export default function LiveRanking() {
  const [data, setData] = useState<ApiResponse | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/scoring/stats')
      setData(res.data)
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch stats', error)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000) // Poll every 3 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-screen text-2xl text-gray-500">
        Loading...
      </div>
    )
  }

  const state = data?.state || 'CLOSED'
  const results = data?.results || []

  // Calculate max votes to show progress bars properly (optional, or just show count)
  // For now, just showing count is fine.

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600">
          Project Scoring Live
        </h1>
        <div className="inline-block px-6 py-2 rounded-full bg-slate-800 border border-slate-700">
          <span className={clsx(
            "text-xl font-bold",
            state === 'SCORING' ? "text-green-400 animate-pulse" :
            state === 'REVEALED' ? "text-blue-400" :
            "text-gray-400"
          )}>
            {state === 'SCORING' ? '● VOTING IN PROGRESS' :
             state === 'REVEALED' ? '★ FINAL RESULTS' :
             'WAITING TO START'}
          </span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto">
        {state === 'CLOSED' && (
          <div className="text-center py-20">
            <p className="text-3xl text-gray-500">Please wait for the administrator to open scoring.</p>
          </div>
        )}

        {state === 'SCORING' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((project) => (
              <div key={project.id} className="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg transform transition-all hover:scale-105">
                <h3 className="text-xl font-bold mb-2 truncate" title={project.name}>{project.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{project.presenter}</p>

                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-300">Votes Received</span>
                    <span className="font-bold text-green-400">{project.scoreCount}</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    {/* Animated progress bar purely for visual activity */}
                    <div
                      className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(project.scoreCount * 5, 100)}%` }} // Assumes ~20 voters for full bar visual
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {state === 'REVEALED' && (
          <div className="space-y-4">
            {results.map((project, index) => (
              <div key={project.id} className="relative bg-slate-800 rounded-xl p-6 border border-slate-700 flex items-center shadow-xl overflow-hidden">
                {/* Rank Number */}
                <div className={clsx(
                  "flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold mr-6 z-10",
                  index === 0 ? "bg-yellow-500 text-yellow-900" :
                  index === 1 ? "bg-gray-400 text-gray-900" :
                  index === 2 ? "bg-amber-700 text-amber-100" :
                  "bg-slate-700 text-slate-300"
                )}>
                  #{index + 1}
                </div>

                <div className="flex-grow z-10">
                  <h3 className="text-2xl font-bold text-white mb-1">{project.name}</h3>
                  <p className="text-slate-400">{project.presenter} • {project.department}</p>
                </div>

                <div className="text-right z-10 min-w-[120px]">
                  <div className="text-sm text-slate-400 uppercase tracking-wider">Final Score</div>
                  <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                    {project.finalScore?.toFixed(1)}
                  </div>
                </div>

                {/* Background Bar based on score */}
                <div
                  className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 transition-all duration-1000"
                  style={{ width: `${project.finalScore}%`, zIndex: 0 }}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
