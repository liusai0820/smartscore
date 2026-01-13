'use client'

import { useState } from 'react'
import axios from 'axios'
import { clsx } from 'clsx'
import { useRouter } from 'next/navigation'

export default function AdminControls({ initialState }: { initialState: string }) {
  const [state, setState] = useState(initialState)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const updateState = async (newState: string) => {
    setLoading(true)
    try {
      await axios.post('/api/admin/state', { state: newState })
      setState(newState)
      router.refresh()
    } catch (error) {
      alert('Failed to update state')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-xl font-bold mb-4">System State Controls</h2>
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => updateState('CLOSED')}
          disabled={loading || state === 'CLOSED'}
          className={clsx(
            "px-6 py-3 rounded-lg font-bold text-white transition-colors",
            state === 'CLOSED' ? "bg-red-800 cursor-default" : "bg-red-500 hover:bg-red-600"
          )}
        >
          {state === 'CLOSED' ? 'Currently CLOSED' : 'CLOSE SCORING'}
        </button>

        <button
          onClick={() => updateState('SCORING')}
          disabled={loading || state === 'SCORING'}
          className={clsx(
            "px-6 py-3 rounded-lg font-bold text-white transition-colors",
            state === 'SCORING' ? "bg-green-800 cursor-default" : "bg-green-500 hover:bg-green-600"
          )}
        >
          {state === 'SCORING' ? 'Currently SCORING' : 'START SCORING'}
        </button>

        <button
          onClick={() => updateState('REVEALED')}
          disabled={loading || state === 'REVEALED'}
          className={clsx(
            "px-6 py-3 rounded-lg font-bold text-white transition-colors",
            state === 'REVEALED' ? "bg-blue-800 cursor-default" : "bg-blue-500 hover:bg-blue-600"
          )}
        >
          {state === 'REVEALED' ? 'Results REVEALED' : 'REVEAL RESULTS'}
        </button>
      </div>
      <p className="mt-4 text-sm text-gray-600">
        Current Status: <span className="font-mono font-bold">{state}</span>
      </p>
    </div>
  )
}
