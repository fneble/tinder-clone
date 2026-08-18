import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'tinder-clone:decisions'

function loadDecisions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function useSwipeState() {
  const [decisions, setDecisions] = useState(loadDecisions)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decisions))
    } catch (err) {
      console.error('Failed to save swipe decisions', err)
    }
  }, [decisions])

  const decide = useCallback((id, decision) => {
    setDecisions((prev) => ({ ...prev, [id]: decision }))
  }, [])

  const reset = useCallback(() => setDecisions({}), [])

  return { decisions, decide, reset }
}
