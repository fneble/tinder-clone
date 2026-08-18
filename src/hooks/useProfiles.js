import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEY = 'tinder-clone:profiles'

function loadProfiles() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function useProfiles() {
  const [profiles, setProfiles] = useState(loadProfiles)
  const [saveError, setSaveError] = useState(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
      setSaveError(null)
    } catch (err) {
      console.error('Failed to save profiles', err)
      setSaveError(
        "Couldn't save — you're out of storage space. Try removing a profile or a few photos."
      )
    }
  }, [profiles])

  const addProfile = useCallback((profile) => {
    setProfiles((prev) => [...prev, { ...profile, id: crypto.randomUUID() }])
  }, [])

  const updateProfile = useCallback((id, updates) => {
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...updates } : p)))
  }, [])

  const deleteProfile = useCallback((id) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id))
  }, [])

  return { profiles, addProfile, updateProfile, deleteProfile, saveError }
}
