'use client'

import { useState } from 'react'
import { Project, User, Score } from '@prisma/client'
import ScoreInput from './ScoreInput'
import axios from 'axios'
import { clsx } from 'clsx'

interface ProjectCardProps {
  project: Project
  currentUser: User
  initialScore?: number
  isScoringOpen: boolean
}

export default function ProjectCard({ project, currentUser, initialScore = 0, isScoringOpen }: ProjectCardProps) {
  const [score, setScore] = useState(initialScore)
  const [isSaving, setIsSaving] = useState(false)
  const [isSaved, setIsSaved] = useState(!!initialScore)
  const [error, setError] = useState('')

  const hasConflict = project.department === currentUser.department

  const handleScoreChange = async (newVal: number) => {
    setScore(newVal)
    setIsSaved(false)
    // Debounce save or save on separate button?
    // For mobile, maybe auto-save with debounce is better, but explicit submit is safer.
    // Let's do explicit save button for now, or auto-save after 1s.
  }

  const handleSubmit = async () => {
    if (hasConflict || !isScoringOpen) return

    setIsSaving(true)
    setError('')

    try {
      await axios.post('/api/scoring/submit', {
        projectId: project.id,
        value: score
      })
      setIsSaved(true)
    } catch (err: any) {
      setError('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }

  // Debounced auto-save effect
  /*
  useEffect(() => {
    const timer = setTimeout(() => {
      if (score !== initialScore && !isSaved) {
        handleSubmit()
      }
    }, 1000)
    return () => clearTimeout(timer)
  }, [score])
  */

  // Let's stick to a manual "Save" button for clarity/feedback on mobile,
  // or maybe "Update" if already saved.

  return (
    <div className={clsx(
      "bg-white rounded-lg shadow-md p-4 mb-4 border-l-4",
      hasConflict ? "border-yellow-400" : isSaved ? "border-green-500" : "border-gray-200"
    )}>
      <div className="mb-2">
        <h3 className="text-lg font-bold">{project.name}</h3>
        <p className="text-sm text-gray-600">Presenter: {project.presenter} | Dept: {project.department}</p>
        {project.description && (
          <p className="text-sm text-gray-500 mt-1">{project.description}</p>
        )}
      </div>

      <div className="mt-4">
        {hasConflict ? (
          <div className="bg-yellow-50 text-yellow-800 p-2 rounded text-sm text-center">
            Conflict of Interest (Same Department)
          </div>
        ) : !isScoringOpen ? (
          <div className="bg-gray-100 text-gray-600 p-2 rounded text-sm text-center">
            Scoring is closed
          </div>
        ) : (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Score
            </label>
            <ScoreInput
              value={score}
              onChange={handleScoreChange}
              disabled={isSaving}
            />

            <div className="mt-3 flex justify-end items-center gap-2">
              {error && <span className="text-red-500 text-xs">{error}</span>}
              {isSaved && <span className="text-green-600 text-xs font-medium">Saved</span>}
              <button
                onClick={handleSubmit}
                disabled={isSaving || (isSaved && score === initialScore)}
                className={clsx(
                  "px-4 py-2 rounded text-sm font-medium transition-colors",
                  isSaved
                    ? "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                )}
              >
                {isSaving ? 'Saving...' : isSaved ? 'Update' : 'Submit Score'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
