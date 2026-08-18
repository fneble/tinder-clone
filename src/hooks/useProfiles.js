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
          await replaceAllProfiles(legacy)
          loaded = legacy
        }
        if (legacy !== null) localStorage.removeItem(LEGACY_STORAGE_KEY)
        if (!cancelled) setProfiles(loaded)
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
    setProfiles((prev) => [...prev, { ...profile, id: crypto.randomUUID() }])
  }, [])

  const updateProfile = useCallback((id, updates) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  const deleteProfile = useCallback((id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { profiles, addProfile, updateProfile, deleteProfile, saveError, isLoaded }
}
