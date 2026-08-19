import { useCallback, useEffect, useState } from 'react'
import { getAllProfiles, replaceAllProfiles } from '../utils/db'

const LEGACY_STORAGE_KEY = 'tinder-clone:profiles'

function loadLegacyProfiles() {
  try {
    const raw = localStorage.getItem(LEGACY_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// Rewrites `order` to match the list's current array position — for use
// once a list is already in the desired order (after a move or delete).
function reindexOrder(list) {
  return list.map((p, i) => (p.order === i ? p : { ...p, order: i }))
}

// IndexedDB's getAll() returns records sorted by key (a random UUID), not
// insertion order, so display order has to be tracked explicitly. This also
// backfills `order` for profiles saved before this field existed. Only used
// on load, where `order` is the sole source of truth for the correct order.
function withNormalizedOrder(list) {
  const sorted = [...list].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  return reindexOrder(sorted)
}

export function useProfiles() {
  const [profiles, setProfiles] = useState([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [saveError, setSaveError] = useState(null)

  // One-time load: read from IndexedDB, migrating any pre-existing
  // localStorage profiles in on first run (they used to be capped at ~5MB).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        let loaded = await getAllProfiles()
        const legacy = loadLegacyProfiles()
        if (legacy && legacy.length > 0 && loaded.length === 0) {
          loaded = legacy
        }
        if (legacy !== null) localStorage.removeItem(LEGACY_STORAGE_KEY)
        if (!cancelled) setProfiles(withNormalizedOrder(loaded))
      } catch (err) {
        console.error('Failed to load profiles', err)
      } finally {
        if (!cancelled) setIsLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!isLoaded) return
    replaceAllProfiles(profiles)
      .then(() => setSaveError(null))
      .catch((err) => {
        console.error('Failed to save profiles', err)
        setSaveError(
          "Couldn't save — you're out of storage space. Try removing a profile or a few photos."
        )
      })
  }, [profiles, isLoaded])

  const addProfile = useCallback((profile) => {
    setProfiles((prev) => [
      ...prev,
      { ...profile, id: crypto.randomUUID(), order: prev.length },
    ])
  }, [])

  const updateProfile = useCallback((id, updates) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  const deleteProfile = useCallback((id) => {
    setProfiles((prev) => reindexOrder(prev.filter((p) => p.id !== id)))
  }, [])

  const moveProfile = useCallback((id, direction) => {
    setProfiles((prev) => {
      const index = prev.findIndex((p) => p.id === id)
      const targetIndex = direction === 'up' ? index - 1 : index + 1
      if (index === -1 || targetIndex < 0 || targetIndex >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[targetIndex]] = [next[targetIndex], next[index]]
      return reindexOrder(next)
    })
  }, [])

  return { profiles, addProfile, updateProfile, deleteProfile, moveProfile, saveError, isLoaded }
}
