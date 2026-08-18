import { useState } from 'react'

const emptyForm = { name: '', age: '', bio: '', photos: [] }

export default function ProfileForm({ onCreate }) {
  const [form, setForm] = useState(emptyForm)

  function handlePhotos(e) {
    const files = Array.from(e.target.files || [])
    files.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        setForm((f) => ({ ...f, photos: [...f.photos, reader.result] }))
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  function removePhoto(index) {
    setForm((f) => ({ ...f, photos: f.photos.filter((_, i) => i !== index) }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onCreate({ ...form, name: form.name.trim(), age: form.age ? Number(form.age) : undefined })
    setForm(emptyForm)
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h3>Create a profile</h3>
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
      <button type="submit" className="submit-btn">
        Add profile
      </button>
    </form>
  )
}
