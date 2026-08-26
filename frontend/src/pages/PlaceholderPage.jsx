export default function PlaceholderPage({ title, description }) {
  return (
    <div className="placeholder">
      <h1>{title}</h1>
      <p>{description || 'Modul ini belum diimplementasikan — masih tahap shell.'}</p>
    </div>
  )
}
