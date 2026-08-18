import { AnimatePresence, motion } from 'framer-motion'

export default function MatchModal({ profile, onClose }) {
  return (
    <AnimatePresence>
      {profile && (
        <motion.div
          className="match-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="match-content"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.6, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h1 className="match-title">It's a Match!</h1>
            <p>You and {profile.name} liked each other.</p>
            <div className="match-photo">
              {profile.photos?.[0] ? (
                <img src={profile.photos[0]} alt={profile.name} />
              ) : (
                <div className="photo-placeholder">🙂</div>
              )}
            </div>
            <button className="match-close" onClick={onClose}>
              Keep Swiping
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
