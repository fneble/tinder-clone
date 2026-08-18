import { forwardRef, useImperativeHandle, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const SWIPE_THRESHOLD = 120

const ProfileCard = forwardRef(function ProfileCard(
  { profile, isTop, stackIndex, onDecided },
  ref
) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-300, 300], [-18, 18])
  const likeOpacity = useTransform(x, [20, 140], [0, 1])
  const nopeOpacity = useTransform(x, [-140, -20], [1, 0])
  const [photoIndex, setPhotoIndex] = useState(0)
  const photos = profile.photos?.length ? profile.photos : [null]

  useImperativeHandle(ref, () => ({
    swipe(direction) {
      const target = direction === 'right' ? 900 : -900
      animate(x, target, { duration: 0.4, ease: 'easeIn' }).then(() =>
        onDecided(direction === 'right' ? 'match' : 'pass')
      )
    },
  }))

  function handleDragEnd(_, info) {
    if (info.offset.x > SWIPE_THRESHOLD) {
      animate(x, 900, { duration: 0.3 }).then(() => onDecided('match'))
    } else if (info.offset.x < -SWIPE_THRESHOLD) {
      animate(x, -900, { duration: 0.3 }).then(() => onDecided('pass'))
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300, damping: 24 })
    }
  }

  function handlePhotoTap(e) {
    if (photos.length < 2) return
    const { left, width } = e.currentTarget.getBoundingClientRect()
    const tapX = e.clientX - left
    setPhotoIndex((i) =>
      tapX < width / 2 ? Math.max(0, i - 1) : Math.min(photos.length - 1, i + 1)
    )
  }

  return (
    <motion.div
      className="swipe-card"
      style={{
        zIndex: 10 - stackIndex,
        x: isTop ? x : 0,
        rotate: isTop ? rotate : 0,
        scale: 1 - stackIndex * 0.04,
        top: stackIndex * 10,
      }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.85}
      onDragEnd={isTop ? handleDragEnd : undefined}
    >
      <div className="card-photo-track" onClick={isTop ? handlePhotoTap : undefined}>
        {photos.length > 1 && (
          <div className="photo-indicators">
            {photos.map((_, i) => (
              <span key={i} className={`indicator ${i === photoIndex ? 'active' : ''}`} />
            ))}
          </div>
        )}
        {photos[photoIndex] ? (
          <img src={photos[photoIndex]} alt={profile.name} draggable={false} />
        ) : (
          <div className="photo-placeholder">🙂</div>
        )}
        {isTop && (
          <>
            <motion.div className="stamp like-stamp" style={{ opacity: likeOpacity }}>
              LIKE
            </motion.div>
            <motion.div className="stamp nope-stamp" style={{ opacity: nopeOpacity }}>
              NOPE
            </motion.div>
          </>
        )}
        <div className="card-gradient" />
        <div className="card-info">
          <h2>
            {profile.name}
            {profile.age ? <span className="age">{profile.age}</span> : null}
          </h2>
          {profile.bio && <p>{profile.bio}</p>}
        </div>
      </div>
    </motion.div>
  )
})

export default ProfileCard
