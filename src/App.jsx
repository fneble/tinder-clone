import { useMemo, useState } from 'react'
import { useProfiles } from './hooks/useProfiles'
import { useSwipeState } from './hooks/useSwipeState'
import SwipeDeck from './components/SwipeDeck'
import ProfileForm from './components/ProfileForm'
import MatchModal from './components/MatchModal'
import './App.css'

export default function App() {
  const { profiles, addProfile, updateProfile, deleteProfile, saveError } = useProfiles()
  const { decisions, decide, reset } = useSwipeState()
  const [view, setView] = useState('discover')
  const [matchedProfile, setMatchedProfile] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const editingProfile = profiles.find((p) => p.id === editingId) ?? null

  const queue = useMemo(
    () => profiles.filter((p) => !(p.id in decisions)),
    [profiles, decisions]
  )
  const matches = useMemo(
    () => profiles.filter((p) => decisions[p.id] === 'match'),
    [profiles, decisions]
  )

  function handleDecision(id, decision) {
    decide(id, decision)
    if (decision === 'match') {
      const profile = profiles.find((p) => p.id === id)
      setMatchedProfile(profile)
    }
  }

  function handleFormSubmit(data) {
    if (editingProfile) {
      updateProfile(editingProfile.id, data)
      setEditingId(null)
    } else {
      addProfile(data)
    }
  }

  function handleDeleteProfile(id) {
    deleteProfile(id)
    if (id === editingId) setEditingId(null)
  }

  return (
    <div className="app">
      <header className="top-bar">
        <button
          className={`tab ${view === 'manage' ? 'active' : ''}`}
          onClick={() => setView('manage')}
        >
          👤 Profiles
        </button>
        <h1 className="logo" onClick={() => setView('discover')}>
          tindr
        </h1>
        <button
          className={`tab ${view === 'matches' ? 'active' : ''}`}
          onClick={() => setView('matches')}
        >
          ♥ Matches{matches.length > 0 ? ` (${matches.length})` : ''}
        </button>
      </header>

      <main className="content">
        {view === 'discover' && (
          <>
            {profiles.length === 0 ? (
              <div className="empty-deck">
                <h3>No profiles yet</h3>
                <p>Head to the Profiles tab to create your first one.</p>
              </div>
            ) : (
              <SwipeDeck queue={queue} onDecision={handleDecision} />
            )}
            {profiles.length > 0 && queue.length === 0 && (
              <button className="reset-btn" onClick={reset}>
                Reset stack
              </button>
            )}
          </>
        )}

        {view === 'manage' && (
          <div className="manage-view">
            {saveError && <p className="save-error-banner">{saveError}</p>}
            <ProfileForm
              key={editingId ?? 'new'}
              editingProfile={editingProfile}
              onSubmit={handleFormSubmit}
              onCancel={() => setEditingId(null)}
            />
            <div className="profile-list">
              <h3>Your profiles ({profiles.length})</h3>
              {profiles.map((p) => (
                <div className={`profile-row ${p.id === editingId ? 'editing' : ''}`} key={p.id}>
                  <div className="profile-row-photo">
                    {p.photos?.[0] ? <img src={p.photos[0]} alt={p.name} /> : <span>🙂</span>}
                  </div>
                  <div className="profile-row-info">
                    <strong>
                      {p.name}
                      {p.age ? `, ${p.age}` : ''}
                    </strong>
                    <p>{p.bio}</p>
                  </div>
                  <div className="profile-row-actions">
                    <button className="edit-btn" onClick={() => setEditingId(p.id)}>
                      Edit
                    </button>
                    <button className="delete-btn" onClick={() => handleDeleteProfile(p.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {view === 'matches' && (
          <div className="matches-view">
            <h3>Your matches</h3>
            {matches.length === 0 && <p>No matches yet — go swipe right on someone!</p>}
            <div className="matches-grid">
              {matches.map((p) => (
                <div className="match-card" key={p.id}>
                  {p.photos?.[0] ? (
                    <img src={p.photos[0]} alt={p.name} />
                  ) : (
                    <div className="photo-placeholder">🙂</div>
                  )}
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <MatchModal profile={matchedProfile} onClose={() => setMatchedProfile(null)} />
    </div>
  )
}
