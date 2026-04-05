import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc, doc, setDoc
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { LogOut, Image, Tag, Info, Trash2, Plus, Upload, Check, X, Pencil } from 'lucide-react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const BASE = import.meta.env.BASE_URL

const DEFAULT_GALLERY = [
  { label: 'Balayage Naturale',      sub: 'Colore',      img: `${BASE}lavori/Balayage Naturale.jpg`,      type: 'image' },
  { label: 'Bob Liscio',             sub: 'Taglio',      img: `${BASE}lavori/Bob Liscio.jpg`,             type: 'image' },
  { label: 'Onde Morbide',           sub: 'Piega',       img: `${BASE}lavori/Onde Morbide.jpg`,           type: 'image' },
  { label: 'Colorazione Ramata',     sub: 'Colore',      img: `${BASE}lavori/Colorazione Ramata.jpg`,     type: 'image' },
  { label: 'Capelli Ricci Definiti', sub: 'Trattamento', img: `${BASE}lavori/Capelli Ricci Definiti.jpg`, type: 'image' },
  { label: 'Pixie Cut',              sub: 'Taglio',      img: `${BASE}lavori/Pixie Cut.jpg`,              type: 'image' },
  { label: 'Highlights Biondi',      sub: 'Colore',      img: `${BASE}lavori/Highlights Biondi.jpg`,      type: 'image' },
  { label: 'Beach Waves',            sub: 'Piega',       img: `${BASE}lavori/Beach Waves.jpg`,            type: 'image' },
  { label: 'Castano Cioccolato',     sub: 'Colore',      img: `${BASE}lavori/Castano Cioccolato.jpg`,     type: 'image' },
]

/* ─── TABS ─────────────────────────────────────── */
const TABS = [
  { id: 'gallery', label: 'Galleria', icon: Image },
  { id: 'prezzi',  label: 'Prezzi',   icon: Tag },
  { id: 'info',    label: 'Info',     icon: Info },
]

export default function AdminDashboard() {
  const [tab, setTab] = useState('gallery')
  const navigate = useNavigate()

  const handleLogout = async () => {
    await signOut(auth)
    navigate('/admin')
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', color: '#F5F0EA' }}>
      {/* Header */}
      <div style={{ background: '#161616', borderBottom: '1px solid rgba(196,18,48,0.2)', padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '1.5rem', fontWeight: 400, margin: 0 }}>Dashboard Admin</h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C41230', margin: '0.25rem 0 0' }}>Parrucchieria Debora</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="#/" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: 'rgba(245,240,234,0.4)', textDecoration: 'none' }}>← Sito pubblico</a>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'transparent', border: '1px solid rgba(196,18,48,0.3)', color: '#C41230', padding: '0.5rem 1rem', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            <LogOut size={14} /> Esci
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: '#111', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', padding: '0 2rem' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: tab === t.id ? '2px solid #C41230' : '2px solid transparent', color: tab === t.id ? '#C41230' : 'rgba(245,240,234,0.4)', cursor: 'pointer', fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.15em', textTransform: 'uppercase', transition: 'all 0.2s', marginBottom: '-1px' }}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '2rem', maxWidth: 1100, margin: '0 auto' }}>
        {tab === 'gallery' && <GalleryTab />}
        {tab === 'prezzi'  && <PrezziTab />}
        {tab === 'info'    && <InfoTab />}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

/* ─── UPLOAD CLOUDINARY (immagini e video) ──────── */
async function uploadToCloudinary(file) {
  const isVideo = file.type.startsWith('video/')
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', 'parrucchiera-debora/gallery')
  const endpoint = isVideo ? 'video' : 'image'
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, { method: 'POST', body: formData })
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)
  return { url: data.secure_url, publicId: data.public_id, type: isVideo ? 'video' : 'image' }
}

/* ─── GALLERY TAB ───────────────────────────────── */
function GalleryTab() {
  const [firestoreItems, setFirestoreItems] = useState(null)
  const [replacing, setReplacing] = useState(null)
  const [uploadMsg, setUploadMsg] = useState({})
  const [editingMeta, setEditingMeta] = useState(null) // { key, label, sub }
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ label: '', sub: '' })
  const [addUploading, setAddUploading] = useState(false)
  const [addMsg, setAddMsg] = useState('')

  useEffect(() => { loadGallery() }, [])

  const loadGallery = async () => {
    try {
      const snap = await getDocs(collection(db, 'gallery'))
      setFirestoreItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Firestore:', err)
      setFirestoreItems([])
    }
  }

  const usingDefaults = firestoreItems !== null && firestoreItems.length === 0
  const displayItems = usingDefaults
    ? DEFAULT_GALLERY.map(i => ({ ...i, isDefault: true }))
    : (firestoreItems || []).map(i => ({ ...i, isDefault: false }))

  /* Sostituisci file (immagine o video) */
  const handleReplace = async (item, file) => {
    const key = item.id || item.label
    setReplacing(key)
    setUploadMsg(m => ({ ...m, [key]: '' }))
    try {
      const uploaded = await uploadToCloudinary(file)
      if (item.isDefault) {
        await addDoc(collection(db, 'gallery'), {
          label: item.label, sub: item.sub,
          url: uploaded.url, publicId: uploaded.publicId, type: uploaded.type,
          createdAt: new Date().toISOString(),
        })
      } else {
        await updateDoc(doc(db, 'gallery', item.id), {
          url: uploaded.url, publicId: uploaded.publicId, type: uploaded.type,
          updatedAt: new Date().toISOString(),
        })
      }
      setUploadMsg(m => ({ ...m, [key]: 'ok' }))
      loadGallery()
    } catch (err) {
      setUploadMsg(m => ({ ...m, [key]: err.message }))
    } finally {
      setReplacing(null)
    }
  }

  /* Modifica titolo/categoria */
  const handleSaveMeta = async () => {
    if (!editingMeta) return
    const { key, id, label, sub } = editingMeta
    try {
      await updateDoc(doc(db, 'gallery', id), { label, sub })
      setUploadMsg(m => ({ ...m, [key]: 'ok' }))
      setEditingMeta(null)
      loadGallery()
    } catch (err) {
      setUploadMsg(m => ({ ...m, [key]: err.message }))
    }
  }

  /* Elimina */
  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo elemento dalla galleria?')) return
    await deleteDoc(doc(db, 'gallery', id))
    setUploadMsg({})
    loadGallery()
  }

  /* Aggiungi nuovo */
  const handleAdd = async (e) => {
    e.preventDefault()
    const file = e.target.querySelector('input[type=file]').files[0]
    if (!file || !newItem.label) return
    setAddUploading(true)
    setAddMsg('')
    try {
      const uploaded = await uploadToCloudinary(file)
      await addDoc(collection(db, 'gallery'), {
        label: newItem.label, sub: newItem.sub || 'Lavoro',
        url: uploaded.url, publicId: uploaded.publicId, type: uploaded.type,
        createdAt: new Date().toISOString(),
      })
      setNewItem({ label: '', sub: '' })
      e.target.reset()
      setShowAddForm(false)
      loadGallery()
    } catch (err) {
      setAddMsg('Errore: ' + err.message)
    } finally {
      setAddUploading(false)
    }
  }

  if (firestoreItems === null) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ ...sectionTitle, marginBottom: '0.25rem' }}>Galleria Foto & Video</h2>
          {usingDefaults && (
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', color: 'rgba(245,240,234,0.35)', margin: 0 }}>
              Foto predefinite del sito — clicca "Sostituisci" su qualsiasi elemento per caricare la tua versione.
            </p>
          )}
        </div>
        <button onClick={() => setShowAddForm(s => !s)} style={btnPrimary}>
          <Plus size={14} /> Aggiungi nuovo
        </button>
      </div>

      {/* Form aggiungi */}
      {showAddForm && (
        <form onSubmit={handleAdd} style={{ background: '#161616', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(196,18,48,0.2)' }}>
          <p style={subTitle}>Nuovo elemento galleria</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div>
              <label style={labelStyle}>Titolo *</label>
              <input value={newItem.label} onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))} required placeholder="es. Balayage Naturale" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Categoria</label>
              <input value={newItem.sub} onChange={e => setNewItem(p => ({ ...p, sub: e.target.value }))} placeholder="es. Colore, Taglio, Video" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>File (foto o video) *</label>
              <input type="file" accept="image/*,video/*" required style={{ ...inputStyle, padding: '0.5rem' }} />
            </div>
          </div>
          {addMsg && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: '#C41230', marginBottom: '1rem' }}>{addMsg}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={addUploading} style={btnPrimary}><Upload size={13} /> {addUploading ? 'Caricamento...' : 'Carica'}</button>
            <button type="button" onClick={() => setShowAddForm(false)} style={btnSecondary}><X size={13} /> Annulla</button>
          </div>
        </form>
      )}

      {/* Griglia */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: '1.25rem' }}>
        {displayItems.map(item => {
          const key = item.id || item.label
          const isReplacing = replacing === key
          const msg = uploadMsg[key]
          const isEditingThis = editingMeta?.key === key
          const srcUrl = item.isDefault ? item.img : item.url
          const isVideo = item.type === 'video'

          return (
            <div key={key} style={{ background: '#161616', border: `1px solid ${msg === 'ok' ? 'rgba(76,175,80,0.35)' : 'rgba(255,255,255,0.05)'}`, overflow: 'hidden' }}>

              {/* Preview */}
              <div style={{ position: 'relative', aspectRatio: '1' }}>
                {isVideo
                  ? <video src={srcUrl} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isReplacing ? 0.4 : 1 }} muted playsInline />
                  : <img src={srcUrl} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isReplacing ? 0.4 : 1 }} />
                }
                {isVideo && (
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(196,18,48,0.85)', padding: '0.15rem 0.5rem' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#F5F0EA' }}>VIDEO</span>
                  </div>
                )}
                {item.isDefault && (
                  <div style={{ position: 'absolute', top: isVideo ? '1.75rem' : '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.65)', padding: '0.15rem 0.5rem' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.5)' }}>Predefinita</span>
                  </div>
                )}
                {isReplacing && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ width: 32, height: 32, border: '3px solid rgba(196,18,48,0.3)', borderTopColor: '#C41230', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                )}
                {!item.isDefault && (
                  <button onClick={() => handleDelete(item.id)} title="Elimina"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(196,18,48,0.85)', border: 'none', color: '#fff', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                )}
              </div>

              {/* Info + azioni */}
              <div style={{ padding: '0.85rem' }}>
                {isEditingThis ? (
                  <div>
                    <input
                      value={editingMeta.label}
                      onChange={e => setEditingMeta(m => ({ ...m, label: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: '0.4rem', fontSize: '0.75rem' }}
                      placeholder="Titolo"
                    />
                    <input
                      value={editingMeta.sub}
                      onChange={e => setEditingMeta(m => ({ ...m, sub: e.target.value }))}
                      style={{ ...inputStyle, marginBottom: '0.6rem', fontSize: '0.7rem' }}
                      placeholder="Categoria"
                    />
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={handleSaveMeta} style={{ ...btnPrimary, padding: '0.4rem 0.75rem', fontSize: '0.58rem' }}><Check size={11} /> Salva</button>
                      <button onClick={() => setEditingMeta(null)} style={{ ...btnSecondary, padding: '0.4rem 0.75rem', fontSize: '0.58rem' }}><X size={11} /></button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.4rem', marginBottom: '0.15rem' }}>
                      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', fontWeight: 600, color: '#F5F0EA' }}>{item.label}</div>
                      {!item.isDefault && (
                        <button
                          onClick={() => setEditingMeta({ key, id: item.id, label: item.label, sub: item.sub || '' })}
                          style={{ background: 'none', border: 'none', color: 'rgba(245,240,234,0.3)', cursor: 'pointer', padding: '0.1rem', flexShrink: 0 }}
                          title="Modifica titolo/categoria"
                        >
                          <Pencil size={12} />
                        </button>
                      )}
                    </div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem', color: '#C41230', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>{item.sub}</div>

                    {msg === 'ok' ? (
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#4caf50', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Check size={12} /> Aggiornato!
                      </p>
                    ) : msg ? (
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#C41230', margin: 0 }}>Errore: {msg}</p>
                    ) : (
                      <label style={{ ...btnSecondary, display: 'flex', cursor: isReplacing ? 'not-allowed' : 'pointer', justifyContent: 'center', opacity: isReplacing ? 0.5 : 1 }}>
                        <Upload size={12} style={{ marginRight: '0.4rem' }} />
                        Sostituisci file
                        <input type="file" accept="image/*,video/*" style={{ display: 'none' }} disabled={isReplacing}
                          onChange={e => { if (e.target.files[0]) handleReplace(item, e.target.files[0]) }} />
                      </label>
                    )}
                  </>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── PREZZI TAB ────────────────────────────────── */
function PrezziTab() {
  const [items, setItems] = useState(null)
  const [editing, setEditing] = useState(null)
  const [newItem, setNewItem] = useState({ cat: '', name: '', desc: '', price: '' })
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadPrezzi() }, [])

  const loadPrezzi = async () => {
    try {
      const snap = await getDocs(collection(db, 'prezzi'))
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (err) {
      console.error('Firestore:', err)
      setItems([])
    }
  }

  const handleSaveEdit = async (item) => {
    setSaving(true)
    await updateDoc(doc(db, 'prezzi', item.id), { cat: item.cat, name: item.name, desc: item.desc, price: item.price })
    setEditing(null)
    setSaving(false)
    loadPrezzi()
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    await addDoc(collection(db, 'prezzi'), { ...newItem })
    setNewItem({ cat: '', name: '', desc: '', price: '' })
    setShowForm(false)
    setSaving(false)
    loadPrezzi()
  }

  const handleDelete = async (id) => {
    if (!confirm('Eliminare questo servizio?')) return
    await deleteDoc(doc(db, 'prezzi', id))
    loadPrezzi()
  }

  if (items === null) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ ...sectionTitle, marginBottom: '0.25rem' }}>Prezzi & Servizi</h2>
          {items.length === 0 && (
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', color: 'rgba(245,240,234,0.35)', margin: 0 }}>
              Nessun servizio in Firestore — aggiungi i tuoi per sovrascrivere quelli predefiniti del sito.
            </p>
          )}
        </div>
        <button onClick={() => setShowForm(s => !s)} style={btnPrimary}>
          <Plus size={14} /> Aggiungi servizio
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} style={{ background: '#161616', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(196,18,48,0.2)' }}>
          <p style={subTitle}>Nuovo servizio</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {[['Categoria', 'cat', 'Taglio, Piega…'], ['Nome servizio', 'name', 'Taglio donna'], ['Prezzo', 'price', 'da €25']].map(([label, key, ph]) => (
              <div key={key}>
                <label style={labelStyle}>{label} *</label>
                <input value={newItem[key]} onChange={e => setNewItem(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} required style={inputStyle} />
              </div>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Descrizione</label>
            <textarea value={newItem.desc} onChange={e => setNewItem(p => ({ ...p, desc: e.target.value }))} rows={2} placeholder="Breve descrizione del servizio" style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} style={btnPrimary}><Check size={14} /> Salva</button>
            <button type="button" onClick={() => setShowForm(false)} style={btnSecondary}><X size={14} /> Annulla</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {items.map(item => (
          <div key={item.id} style={{ background: '#161616', padding: '1.25rem', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            {editing === item.id ? (
              <EditServiceRow item={item} onSave={handleSaveEdit} onCancel={() => setEditing(null)} saving={saving} />
            ) : (
              <>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'baseline', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.55rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C41230', flexShrink: 0 }}>{item.cat}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.85rem', fontWeight: 600, color: '#F5F0EA' }}>{item.name}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.82rem', color: '#C41230', fontWeight: 700, marginLeft: 'auto' }}>{item.price}</span>
                  </div>
                  {item.desc && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.73rem', color: 'rgba(245,240,234,0.4)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  <button onClick={() => setEditing(item.id)} style={btnSecondary}><Pencil size={13} /> Modifica</button>
                  <button onClick={() => handleDelete(item.id)} style={{ ...btnSecondary, borderColor: 'rgba(196,18,48,0.3)', color: '#C41230' }}><Trash2 size={13} /></button>
                </div>
              </>
            )}
          </div>
        ))}
        {items.length === 0 && !showForm && (
          <p style={{ color: 'rgba(245,240,234,0.2)', fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', padding: '1rem 0' }}>Usa "Aggiungi servizio" per inserire i prezzi.</p>
        )}
      </div>
    </div>
  )
}

function EditServiceRow({ item, onSave, onCancel, saving }) {
  const [data, setData] = useState({ ...item })
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem', marginBottom: '0.75rem' }}>
        {[['Categoria', 'cat'], ['Nome', 'name'], ['Prezzo', 'price']].map(([label, key]) => (
          <div key={key}>
            <label style={labelStyle}>{label}</label>
            <input value={data[key] || ''} onChange={e => setData(p => ({ ...p, [key]: e.target.value }))} style={inputStyle} />
          </div>
        ))}
      </div>
      <div style={{ marginBottom: '0.75rem' }}>
        <label style={labelStyle}>Descrizione</label>
        <textarea value={data.desc || ''} onChange={e => setData(p => ({ ...p, desc: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
      </div>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <button onClick={() => onSave(data)} disabled={saving} style={btnPrimary}><Check size={13} /> Salva</button>
        <button onClick={onCancel} style={btnSecondary}><X size={13} /> Annulla</button>
      </div>
    </div>
  )
}

/* ─── INFO TAB ──────────────────────────────────── */
function InfoTab() {
  const INFO_ID = 'principale'
  const [info, setInfo] = useState({
    indirizzo: 'Via Celso Ulpiani, 15\n63100 Ascoli Piceno (AP)',
    telefono: '0736 342914',
    email: '',
    orari: 'Lun – Ven: 9:00 – 18:30\nSabato: 9:00 – 17:00\nDomenica: chiuso',
    whatsapp: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    getDocs(collection(db, 'info'))
      .then(snap => {
        const d = snap.docs.find(d => d.id === INFO_ID)
        if (d) setInfo(prev => ({ ...prev, ...d.data() }))
      })
      .catch(err => console.error('Firestore:', err))
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMsg('')
    try {
      await setDoc(doc(db, 'info', INFO_ID), info)
      setMsg('Salvato!')
    } catch (err) {
      setMsg('Errore: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Spinner />

  const fields = [
    { label: 'Indirizzo',        key: 'indirizzo', ph: 'Via Celso Ulpiani, 15\n63100 Ascoli Piceno (AP)', multi: true },
    { label: 'Telefono',         key: 'telefono',  ph: '0736 342914',                                     multi: false },
    { label: 'WhatsApp (numero con prefisso)', key: 'whatsapp', ph: '+390736342914',                      multi: false },
    { label: 'Email',            key: 'email',     ph: 'info@parrucchieradebora.it',                       multi: false },
    { label: 'Orari di apertura (una riga per fascia)', key: 'orari', ph: 'Lun – Ven: 9:00 – 18:30\nSabato: 9:00 – 17:00\nDomenica: chiuso', multi: true },
  ]

  return (
    <div>
      <h2 style={sectionTitle}>Informazioni Salone</h2>
      <form onSubmit={handleSave} style={{ background: '#161616', padding: '1.75rem', border: '1px solid rgba(196,18,48,0.1)', maxWidth: 640 }}>
        {fields.map(({ label, key, ph, multi }) => (
          <div key={key} style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>{label}</label>
            {multi ? (
              <textarea value={info[key] || ''} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            ) : (
              <input value={info[key] || ''} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={inputStyle} />
            )}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <button type="submit" disabled={saving} style={btnPrimary}>
            <Check size={14} /> {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          {msg && (
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: msg.startsWith('Errore') ? '#C41230' : '#4caf50' }}>{msg}</span>
          )}
        </div>
      </form>
    </div>
  )
}

/* ─── SPINNER ───────────────────────────────────── */
function Spinner() {
  return (
    <div style={{ padding: '3rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(196,18,48,0.2)', borderTopColor: '#C41230', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: 'rgba(245,240,234,0.3)' }}>Caricamento...</span>
    </div>
  )
}

/* ─── SHARED STYLES ─────────────────────────────── */
const sectionTitle = {
  fontFamily: '"Cormorant Garamond", serif',
  fontSize: '1.75rem',
  fontWeight: 400,
  color: '#F5F0EA',
  marginBottom: '1.5rem',
  marginTop: 0,
}

const subTitle = {
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.65rem',
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: '#C41230',
  marginTop: 0,
  marginBottom: '1rem',
}

const labelStyle = {
  display: 'block',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.58rem',
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(245,240,234,0.4)',
  marginBottom: '0.4rem',
}

const inputStyle = {
  width: '100%',
  padding: '0.65rem 0.85rem',
  background: '#0e0e0e',
  border: '1px solid rgba(196,18,48,0.2)',
  color: '#F5F0EA',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.82rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const btnPrimary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  background: '#C41230',
  color: '#F5F0EA',
  border: 'none',
  padding: '0.6rem 1.25rem',
  cursor: 'pointer',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.62rem',
  fontWeight: 700,
  letterSpacing: '0.15em',
  textTransform: 'uppercase',
}

const btnSecondary = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.4rem',
  background: 'transparent',
  color: 'rgba(245,240,234,0.6)',
  border: '1px solid rgba(255,255,255,0.12)',
  padding: '0.6rem 1rem',
  cursor: 'pointer',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.62rem',
  fontWeight: 600,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
}
