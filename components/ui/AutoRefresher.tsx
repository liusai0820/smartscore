'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface AutoRefresherProps {
  initialState: string
  initialProjectId: string | null
  intervalMs?: number
}

export default function AutoRefresher({
  initialState,
  initialProjectId,
  intervalMs = 3000
}: AutoRefresherProps) {
  const router = useRouter()

  // Track the current state as rendered by the server
  const [lastKnownState, setLastKnownState] = useState(initialState)
  const [lastKnownProjectId, setLastKnownProjectId] = useState(initialProjectId)

  // If the server passes new props (after a refresh), update our local state
  useEffect(() => {
    setLastKnownState(initialState)
    setLastKnownProjectId(initialProjectId)
  }, [initialState, initialProjectId])

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/admin/state')
        if (!res.ok) return

        const data = await res.json()
        const { state, currentProjectId } = data

        // Compare fetched data with our current known state
        // Note: We use loose equality for null/undefined check safety if needed,
        // but strict equality is better if types are consistent.
        // API returns null for no project, props should match.
        const stateChanged = state !== lastKnownState
        const projectChanged = currentProjectId !== lastKnownProjectId

        if (stateChanged || projectChanged) {
          // Optimistically update local state to prevent multiple refreshes
          // while waiting for the server component to re-render
          setLastKnownState(state)
          setLastKnownProjectId(currentProjectId)

          console.log('State changed, refreshing dashboard...', {
            from: { state: lastKnownState, id: lastKnownProjectId },
            to: { state, id: currentProjectId }
          })

          router.refresh()
        }
      } catch (error) {
        console.error('Auto-refresh polling failed:', error)
      }
    }, intervalMs)

    return () => clearInterval(interval)
  }, [lastKnownState, lastKnownProjectId, router, intervalMs])

  return null
}
