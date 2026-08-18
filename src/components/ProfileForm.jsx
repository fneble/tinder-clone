import { useEffect, useRef, useState } from 'react'
import { resizeImage } from '../utils/resizeImage'

const emptyForm = { name: '', age: '', bio: '', photos: [] }

function toFormState(profile) {
  if (!profile) return emptyForm
  return {
    name: profile.name ?? '',
    age: profile.age != null ? String(profile.age) : '',
    bio: profile.bio ?? '',
    photos: profile.photos ?? [],
  }
}

export default function ProfileForm({ editingProfile, onSubmit, onCancel }) {
  const [form, setForm] = useState(() => toFormState(editingProfile))
  const [photoError, setPhotoError] = useState('')
  const isEditing = !!editingProfile
  const formRef = useRef(null)

  useEffect(() => {
    if (isEditing) formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handlePhotos(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    setPhotoError('')
    for (const file of files) {
      try {
        const dataUrl = await resizeImage(file)
        setForm((f) => ({ ...f, photos: [...f.photos, dataUrl] }))
      } catch {
        setPhotoError(`Couldn't process "${file.name}" — try a different photo.`)
      }
    }
  }

  function removePhoto(index) {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSubmit({ ...form, name: form.name.trim(), age: form.age ? Number(form.age) : undefined })
    if (!isEditing) setForm(emptyForm)
    setPhotoError('')
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit} ref={formRef}>
      <h3>{isEditing ? `Edit ${editingProfile.name}` : 'Create a profile'}</h3>
      <div className="form-row">
        <label>
          Name
          <input
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Jamie"
            required
          />
        </label>
        <label className="age-field">
          Age
          <input
            type="number"
            min="18"
            max="120"
            value={form.age}
            onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
            placeholder="27"
          />
        </label>
      </div>
      <label>
        Bio
        <textarea
          rows={3}
          value={form.bio}
          onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
          placeholder="A short description..."
        />
      </label>
      <label className="photo-upload">
        Photos
        <input type="file" accept="image/*" multiple onChange={handlePhotos} />
      </label>
      {photoError && <p className="form-error">{photoError}</p>}
      {form.photos.length > 0 && (
        <div className="photo-thumbs">
          {form.photos.map((src, i) => (
            <div className="thumb" key={i}>
              <img src={src} alt="" />
              <button type="button" onClick={() => removePhoto(i)} aria-label="Remove photo">
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="form-actions">
        <button type="submit" className="submit-btn">
          {isEditing ? 'Save changes' : 'Add profile'}
        </button>
        {isEditing && (
          <button type="button" className="cancel-btn" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
