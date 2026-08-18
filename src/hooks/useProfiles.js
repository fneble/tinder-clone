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

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles))
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

  return { profiles, addProfile, updateProfile, deleteProfile }
}
