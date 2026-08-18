import { useRef } from 'react'
import ProfileCard from './ProfileCard'

const VISIBLE_COUNT = 3

export default function SwipeDeck({ queue, onDecision }) {
  const topRef = useRef(null)

  function handleButtonSwipe(direction) {
    topRef.current?.swipe(direction)
  }

  const visible = queue.slice(0, VISIBLE_COUNT)

  return (
    <div className="deck-area">
      <div className="card-stack">
        {visible.length === 0 && (
          <div className="empty-deck">
            <h3>No more profiles</h3>
            <p>You've swiped through everyone. Add more profiles or reset the stack.</p>
          </div>
        )}
        {visible.map((profile, i) => (
          <ProfileCard
            key={profile.id}
            ref={i === 0 ? topRef : null}
            profile={profile}
            isTop={i === 0}
            stackIndex={i}
            onDecided={(decision) => onDecision(profile.id, decision)}
          />
        ))}
      </div>
      <div className="action-buttons">
        <button
          className="btn-pass"
          onClick={() => handleButtonSwipe('left')}
          disabled={visible.length === 0}
          aria-label="Pass"
        >
          ✕
        </button>
        <button
          className="btn-like"
          onClick={() => handleButtonSwipe('right')}
          disabled={visible.length === 0}
          aria-label="Like"
        >
          ♥
        </button>
      </div>
    </div>
  )
}
