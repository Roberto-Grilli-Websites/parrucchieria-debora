import { useState, useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth, db } from '../firebase'
import {
  collection, getDocs, deleteDoc, doc, setDoc
} from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'
import { LogOut, Image, Tag, Info, Trash2, Plus, Upload, Check, X, Pencil } from 'lucide-react'

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET
const BASE = import.meta.env.BASE_URL

const DEFAULT_SERVICES = [
  { cat:'Taglio',      icon:'✂',  name:'Taglio',                    desc:'Taglio su misura con consulenza personalizzata.',                                        price:'€13' },
  { cat:'Taglio',      icon:'💨', name:'Piega',                     desc:'Shampoo e messa in piega con phon e spazzola.',                                          price:'€13' },
  { cat:'Taglio',      icon:'💆', name:'Pettinata',                 desc:'Messa in piega e acconciatura senza taglio.',                                            price:'€8' },
  { cat:'Colore',      icon:'🎨', name:'Colore',                    desc:'Colorazione permanente uniforme su tutta la lunghezza.',                                 price:'€24' },
  { cat:'Colore',      icon:'🎨', name:'Ritocco colore',            desc:'Ritocco radici con colorazione permanente.',                                             price:'€11' },
  { cat:'Colore',      icon:'🎨', name:'Bagno colore',              desc:'Trattamento colorante per ravvivare e uniformare il colore su tutta la lunghezza.',     price:'€23' },
  { cat:'Colore',      icon:'✨', name:'Tonalizzante',              desc:'Trattamento tonalizzante per riflessi e luminosità.',                                    price:'€10' },
  { cat:'Colore',      icon:'✨', name:'Meches',                    desc:'Schiariture classiche con stagnola per riflessi naturali.',                              price:'€35' },
  { cat:'Colore',      icon:'✨', name:'Ritocco meches',            desc:'Ritocco delle schiariture su ricrescita.',                                                price:'€20' },
  { cat:'Colore',      icon:'🌈', name:'Contouring + tonalizzante', desc:'Tecnica di contouring colore con finitura tonalizzante.',                                price:'€15' },
  { cat:'Colore',      icon:'☀', name:'Degradé',                   desc:'Colorazione a degradé per un effetto naturale e sfumato.',                               price:'€45' },
  { cat:'Colore',      icon:'🌟', name:'Voilage',                   desc:'Tecnica di schiariture a velo per un effetto luminoso e naturale.',                      price:'€50' },
  { cat:'Trattamenti', icon:'〰', name:'Permanente classica',       desc:'Permanente classica o ricci morbidi con consulenza inclusa.',                           price:'€30' },
  { cat:'Trattamenti', icon:'🌿', name:'Permanente cheratina',      desc:'Lisciatura duratura con cheratina, effetto anti-crespo.',                                price:'€40' },
  { cat:'Trattamenti', icon:'💧', name:'Balsamo',                   desc:'Balsamo nutriente per capelli morbidi e luminosi.',                                      price:'€3' },
  { cat:'Trattamenti', icon:'🌱', name:'Anticaduta',                desc:'Trattamento specifico anticaduta per rafforzare il capello.',                           price:'€4' },
  { cat:'Trattamenti', icon:'🌿', name:'Stiraggio cheratina',       desc:'Stiraggio con cheratina per capelli lisci e disciplinati.',                             price:'€5 / gr.' },
  { cat:'Trattamenti', icon:'💎', name:'Trattamenti idratanti',     desc:'Trattamenti specifici idratanti (shampoo, conditioner, spray).',                        price:'€9' },
  { cat:'Trattamenti', icon:'✨', name:'Trattamento Regeneration',  desc:'Trattamento rigenerante intensivo per capelli fortemente danneggiati.',                 price:'€60' },
  { cat:'Trattamenti', icon:'💆', name:'Ricostruzione',             desc:'Ricostruzione della struttura del capello con trattamenti specifici.',                  price:'€35' },
  { cat:'Trattamenti', icon:'🫧', name:'Ozono',                     desc:"Trattamento all'ozono per pulizia profonda e ossigenazione del cuoio capelluto.",       price:'€5 / 10 min.' },
  { cat:'Estetica',    icon:'✦',  name:'Baffetti',                  desc:'Depilazione o rimozione dei baffetti.',                                                  price:'€3' },
  { cat:'Estetica',    icon:'✦',  name:'Sopracciglia',              desc:'Sistemazione e definizione sopracciglia.',                                               price:'€3' },
]

const DEFAULT_GALLERY = [
  { label: 'Colorazione & Meches', sub: 'Colore',      img: `${BASE}lavori/portfolio1-dopo.jpg`, type: 'image', images: [{ url: `${BASE}lavori/portfolio1-dopo.jpg`, badge: '' }, { url: `${BASE}lavori/portfolio1-prima.jpg`, badge: 'Prima' }] },
  { label: 'Meches su Biondo',     sub: 'Colore',      img: `${BASE}lavori/portfolio2-dopo.jpg`, type: 'image', images: [{ url: `${BASE}lavori/portfolio2-dopo.jpg`, badge: '' }, { url: `${BASE}lavori/portfolio2-prima.jpg`, badge: '' }] },
  { label: 'Acconciatura Sposa',   sub: 'Sposa',       img: `${BASE}lavori/portfolio3-sposa.jpg`,type: 'image', images: [{ url: `${BASE}lavori/portfolio3-sposa.jpg`, badge: '' }] },
  { label: 'Permanente Ricci',     sub: 'Trattamenti', img: `${BASE}lavori/portfolio4-dopo.jpg`, type: 'image', images: [{ url: `${BASE}lavori/portfolio4-dopo.jpg`, badge: '' }, { url: `${BASE}lavori/portfolio4-prima.jpg`, badge: '' }] },
  { label: 'Silver Grey',          sub: 'Colore',      img: `${BASE}lavori/portfolio5-dopo.jpg`, type: 'image', images: [{ url: `${BASE}lavori/portfolio5-dopo.jpg`, badge: '' }, { url: `${BASE}lavori/portfolio5-prima.jpg`, badge: '' }] },
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
  const [overrides, setOverrides] = useState(null)
  const [replacing, setReplacing] = useState(null)
  const [uploadMsg, setUploadMsg] = useState({})
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ label: '', sub: '' })
  const [addUploading, setAddUploading] = useState(false)
  const [addMsg, setAddMsg] = useState('')
  const [editingMeta, setEditingMeta] = useState(null)
  const [editForm, setEditForm] = useState({ label: '', sub: '' })
  const [expandedSlides, setExpandedSlides] = useState(null)
  const [addingSlide, setAddingSlide] = useState(null)
  const [newSlide, setNewSlide] = useState({ badge: '' })
  const [badgeEdits, setBadgeEdits] = useState({})

  useEffect(() => { loadGallery() }, [])

  const loadGallery = async () => {
    try {
      const snap = await getDocs(collection(db, 'gallery'))
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setOverrides(map)
    } catch (err) {
      console.error('Firestore:', err)
      setOverrides({})
    }
  }

  const defaultLabels = new Set(DEFAULT_GALLERY.map(g => g.label))
  const mergedDefaults = DEFAULT_GALLERY.map(g => {
    const ov = overrides?.[g.label]
    return ov
      ? { ...g, _id: g.label, label: ov.label || g.label, url: ov.url, sub: ov.sub || g.sub, type: ov.type || 'image', images: ov.images || g.images || [], hasOverride: true }
      : { ...g, _id: g.label, url: g.img, type: 'image', images: g.images || [], hasOverride: false }
  })
  const extraItems = Object.entries(overrides || {})
    .filter(([id]) => !defaultLabels.has(id))
    .map(([id, data]) => ({ _id: id, label: data.label || id, sub: data.sub, url: data.url, type: data.type || 'image', images: data.images || [], hasOverride: true, isExtra: true }))
  const displayItems = [...mergedDefaults, ...extraItems]

  /* Normalizza le immagini dell'item corrente (da Firestore o da default) */
  const getItemImages = (item) => {
    const existing = overrides?.[item._id]
    if (existing?.images?.length > 0) return existing.images
    return item.images.map(im => ({ url: im.url || im.src || '', publicId: im.publicId || '', badge: im.badge || '' }))
  }

  /* Sostituisci immagine principale */
  const handleReplace = async (item, file) => {
    setReplacing(item._id)
    setUploadMsg(m => ({ ...m, [item._id]: '' }))
    try {
      const uploaded = await uploadToCloudinary(file)
      const existing = overrides?.[item._id] || {}
      const images = getItemImages(item)
      const updatedImages = images.length > 0
        ? [{ url: uploaded.url, publicId: uploaded.publicId, badge: images[0]?.badge || '' }, ...images.slice(1)]
        : [{ url: uploaded.url, publicId: uploaded.publicId, badge: '' }]
      await setDoc(doc(db, 'gallery', item._id), {
        ...existing,
        label: item.label, sub: item.sub,
        url: uploaded.url, publicId: uploaded.publicId, type: uploaded.type,
        images: updatedImages,
        updatedAt: new Date().toISOString(),
      })
      setUploadMsg(m => ({ ...m, [item._id]: 'ok' }))
      loadGallery()
    } catch (err) {
      setUploadMsg(m => ({ ...m, [item._id]: err.message }))
    } finally {
      setReplacing(null)
    }
  }

  /* Aggiungi slide extra */
  const handleAddSlide = async (item, file) => {
    if (!file) return
    setAddingSlide(item._id)
    try {
      const uploaded = await uploadToCloudinary(file)
      const existing = overrides?.[item._id] || {}
      const images = getItemImages(item)
      const updatedImages = [...images, { url: uploaded.url, publicId: uploaded.publicId, badge: newSlide.badge }]
      await setDoc(doc(db, 'gallery', item._id), {
        ...existing,
        label: item.label, sub: item.sub,
        url: existing.url || images[0]?.url || uploaded.url,
        images: updatedImages,
        updatedAt: new Date().toISOString(),
      })
      setNewSlide({ badge: '' })
      loadGallery()
    } catch (err) {
      console.error(err)
    } finally {
      setAddingSlide(null)
    }
  }

  /* Rimuovi slide */
  const handleRemoveSlide = async (item, idx) => {
    if (!confirm('Rimuovere questa immagine dallo slideshow?')) return
    const existing = overrides?.[item._id] || {}
    const images = [...getItemImages(item)]
    images.splice(idx, 1)
    const newUrl = images[0]?.url || existing.url || ''
    await setDoc(doc(db, 'gallery', item._id), {
      ...existing,
      url: newUrl,
      images,
      updatedAt: new Date().toISOString(),
    })
    loadGallery()
  }

  /* Aggiorna badge di una slide */
  const handleUpdateBadge = async (item, idx, badge) => {
    const existing = overrides?.[item._id] || {}
    const images = getItemImages(item).map((im, i) => i === idx ? { ...im, badge } : im)
    await setDoc(doc(db, 'gallery', item._id), {
      ...existing,
      images,
      updatedAt: new Date().toISOString(),
    })
    setOverrides(prev => ({ ...prev, [item._id]: { ...(prev?.[item._id] || {}), images } }))
  }

  /* Ripristina default */
  const handleReset = async (id) => {
    if (!confirm('Ripristinare la foto originale?')) return
    await deleteDoc(doc(db, 'gallery', id))
    setUploadMsg(m => ({ ...m, [id]: '' }))
    loadGallery()
  }

  const handleCleanupObsolete = async () => {
    if (!confirm('Eliminare tutte le voci obsolete non presenti nel portfolio attuale?')) return
    const obsolete = Object.keys(overrides || {}).filter(id => !defaultLabels.has(id))
    await Promise.all(obsolete.map(id => deleteDoc(doc(db, 'gallery', id))))
    loadGallery()
  }

  const startEditMeta = (item) => {
    setEditingMeta(item._id)
    setEditForm({ label: item.label, sub: item.sub || '' })
  }

  const handleSaveMeta = async (item) => {
    const { label: newLabel, sub: newSub } = editForm
    try {
      const existingData = overrides?.[item._id] || {}
      if (item.isExtra && newLabel !== item.label) {
        await deleteDoc(doc(db, 'gallery', item._id))
        await setDoc(doc(db, 'gallery', newLabel), { ...existingData, label: newLabel, sub: newSub, updatedAt: new Date().toISOString() })
      } else {
        await setDoc(doc(db, 'gallery', item._id), {
          ...existingData,
          label: newLabel, sub: newSub,
          url: existingData.url || item.url || '',
          updatedAt: new Date().toISOString(),
        })
      }
      setEditingMeta(null)
      loadGallery()
    } catch (err) { console.error(err) }
  }

  const handleAdd = async (e) => {
    e.preventDefault()
    const file = e.target.querySelector('input[type=file]').files[0]
    if (!file || !newItem.label) return
    setAddUploading(true)
    setAddMsg('')
    try {
      const uploaded = await uploadToCloudinary(file)
      await setDoc(doc(db, 'gallery', newItem.label), {
        label: newItem.label, sub: newItem.sub || 'Lavoro',
        url: uploaded.url, publicId: uploaded.publicId, type: uploaded.type,
        images: [{ url: uploaded.url, publicId: uploaded.publicId, badge: '' }],
        adminAdded: true,
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

  if (overrides === null) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Galleria Foto & Video</h2>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {Object.keys(overrides || {}).some(id => !defaultLabels.has(id)) && (
            <button onClick={handleCleanupObsolete} style={{ ...btnSecondary, color: '#C41230', borderColor: 'rgba(196,18,48,0.4)' }}>
              <Trash2 size={13} /> Pulisci voci obsolete
            </button>
          )}
          <button onClick={() => setShowAddForm(s => !s)} style={btnPrimary}><Plus size={14} /> Aggiungi nuovo</button>
        </div>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} style={{ background: '#161616', padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(196,18,48,0.2)' }}>
          <p style={subTitle}>Nuovo elemento</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            <div><label style={labelStyle}>Titolo *</label><input value={newItem.label} onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))} required placeholder="es. Riccio Naturale" style={inputStyle} /></div>
            <div><label style={labelStyle}>Categoria</label><input value={newItem.sub} onChange={e => setNewItem(p => ({ ...p, sub: e.target.value }))} placeholder="es. Colore" style={inputStyle} /></div>
            <div><label style={labelStyle}>File *</label><input type="file" accept="image/*,video/*" required style={{ ...inputStyle, padding: '0.5rem' }} /></div>
          </div>
          {addMsg && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: '#C41230', marginBottom: '1rem' }}>{addMsg}</p>}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={addUploading} style={btnPrimary}><Upload size={13} /> {addUploading ? 'Caricamento...' : 'Carica'}</button>
            <button type="button" onClick={() => setShowAddForm(false)} style={btnSecondary}><X size={13} /> Annulla</button>
          </div>
        </form>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
        {displayItems.map(item => {
          const isReplacing = replacing === item._id
          const msg = uploadMsg[item._id]
          const isVideo = item.type === 'video'
          const isExpanded = expandedSlides === item._id
          const slides = item.images || []

          return (
            <div key={item._id} style={{ background: '#161616', border: `1px solid ${msg === 'ok' ? 'rgba(76,175,80,0.35)' : item.hasOverride ? 'rgba(196,18,48,0.25)' : 'rgba(255,255,255,0.05)'}`, overflow: 'hidden' }}>
              {/* Thumbnail */}
              <div style={{ position: 'relative', aspectRatio: '1' }}>
                {isVideo
                  ? <video src={item.url} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isReplacing ? 0.4 : 1 }} muted playsInline />
                  : <img src={item.url} alt={item.label} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: isReplacing ? 0.4 : 1 }} />
                }
                {/* slide count badge */}
                {slides.length > 1 && (
                  <div style={{ position: 'absolute', bottom: '0.5rem', left: '0.5rem', background: 'rgba(196,18,48,0.9)', padding: '0.15rem 0.45rem' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.5rem', fontWeight: 700, color: '#F5F0EA' }}>{slides.length} foto</span>
                  </div>
                )}
                {!item.hasOverride && (
                  <div style={{ position: 'absolute', top: '0.5rem', left: '0.5rem', background: 'rgba(0,0,0,0.6)', padding: '0.15rem 0.5rem' }}>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.48rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.4)' }}>Default</span>
                  </div>
                )}
                {item.isExtra && (
                  <button onClick={() => handleReset(item._id)} title="Elimina"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(196,18,48,0.85)', border: 'none', color: '#fff', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                    <Trash2 size={12} />
                  </button>
                )}
                {item.hasOverride && !item.isExtra && (
                  <button onClick={() => handleReset(item._id)} title="Ripristina default"
                    style={{ position: 'absolute', top: '0.5rem', right: '0.5rem', background: 'rgba(0,0,0,0.7)', border: 'none', color: 'rgba(245,240,234,0.6)', width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '0.6rem' }}>
                    ↩
                  </button>
                )}
                {isReplacing && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.3)' }}>
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(196,18,48,0.3)', borderTopColor: '#C41230', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                )}
              </div>

              {/* Info + actions */}
              <div style={{ padding: '0.75rem' }}>
                {editingMeta === item._id ? (
                  <div>
                    <input value={editForm.label} onChange={e => setEditForm(p => ({ ...p, label: e.target.value }))} placeholder="Titolo" style={{ ...inputStyle, fontSize: '0.65rem', padding: '0.35rem 0.5rem', marginBottom: '0.4rem', width: '100%', boxSizing: 'border-box' }} />
                    <input value={editForm.sub} onChange={e => setEditForm(p => ({ ...p, sub: e.target.value }))} placeholder="Categoria" style={{ ...inputStyle, fontSize: '0.65rem', padding: '0.35rem 0.5rem', marginBottom: '0.5rem', width: '100%', boxSizing: 'border-box' }} />
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => handleSaveMeta(item)} style={{ ...btnPrimary, padding: '0.3rem 0.6rem', fontSize: '0.58rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Check size={10} /> Salva</button>
                      <button onClick={() => setEditingMeta(null)} style={{ ...btnSecondary, padding: '0.3rem 0.6rem', fontSize: '0.58rem', display: 'flex', alignItems: 'center' }}><X size={10} /></button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.1rem' }}>
                      <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', fontWeight: 600, color: '#F5F0EA' }}>{item.label}</div>
                      <button onClick={() => startEditMeta(item)} title="Modifica nome/categoria" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(245,240,234,0.3)', padding: '0 0 0 0.4rem', lineHeight: 1 }}><Pencil size={11} /></button>
                    </div>
                    <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.56rem', color: '#C41230', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>{item.sub}</div>
                    {msg === 'ok'
                      ? <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', color: '#4caf50', margin: '0 0 0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={11} /> Aggiornato!</p>
                      : msg ? <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', color: '#C41230', margin: '0 0 0.5rem' }}>Errore: {msg}</p>
                      : (
                        <label style={{ ...btnSecondary, display: 'flex', cursor: isReplacing ? 'not-allowed' : 'pointer', justifyContent: 'center', padding: '0.4rem 0.6rem', marginBottom: '0.4rem', opacity: isReplacing ? 0.5 : 1 }}>
                          <Upload size={11} style={{ marginRight: '0.35rem' }} /> Sostituisci copertina
                          <input type="file" accept="image/*,video/*" style={{ display: 'none' }} disabled={isReplacing}
                            onChange={e => { if (e.target.files[0]) handleReplace(item, e.target.files[0]) }} />
                        </label>
                      )
                    }
                    {/* Toggle slide manager */}
                    <button onClick={() => setExpandedSlides(isExpanded ? null : item._id)}
                      style={{ ...btnSecondary, width: '100%', justifyContent: 'center', padding: '0.4rem 0.6rem', fontSize: '0.6rem', background: isExpanded ? 'rgba(196,18,48,0.1)' : 'transparent', borderColor: isExpanded ? 'rgba(196,18,48,0.4)' : undefined }}>
                      {isExpanded ? '▲' : '▼'} Slide ({slides.length})
                    </button>
                  </div>
                )}
              </div>

              {/* Slide manager panel */}
              {isExpanded && (
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '0.75rem', background: '#121212' }}>
                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.58rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(245,240,234,0.4)', marginBottom: '0.75rem' }}>Immagini slideshow</p>

                  {/* Existing slides */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '0.75rem' }}>
                    {slides.map((sl, idx) => (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#161616', padding: '0.4rem' }}>
                        <img src={sl.url} alt="" style={{ width: 40, height: 40, objectFit: 'cover', flexShrink: 0 }} />
                        <input
                          value={badgeEdits[`${item._id}-${idx}`] ?? sl.badge ?? ''}
                          onChange={e => setBadgeEdits(p => ({ ...p, [`${item._id}-${idx}`]: e.target.value }))}
                          onBlur={e => handleUpdateBadge(item, idx, e.target.value)}
                          placeholder='Badge (es. "Prima")'
                          style={{ ...inputStyle, flex: 1, fontSize: '0.6rem', padding: '0.3rem 0.4rem' }}
                        />
                        <button onClick={() => handleRemoveSlide(item, idx)}
                          style={{ background: 'rgba(196,18,48,0.15)', border: 'none', color: '#C41230', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                          <Trash2 size={11} />
                        </button>
                      </div>
                    ))}
                    {slides.length === 0 && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.62rem', color: 'rgba(245,240,234,0.25)', margin: 0 }}>Nessuna slide aggiunta</p>}
                  </div>

                  {/* Add new slide */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <input
                      value={newSlide.badge}
                      onChange={e => setNewSlide(p => ({ ...p, badge: e.target.value }))}
                      placeholder='Badge (opzionale, es. "Dopo")'
                      style={{ ...inputStyle, fontSize: '0.6rem', padding: '0.3rem 0.4rem' }}
                    />
                    <label style={{ ...btnPrimary, display: 'flex', justifyContent: 'center', cursor: addingSlide === item._id ? 'not-allowed' : 'pointer', opacity: addingSlide === item._id ? 0.5 : 1, fontSize: '0.6rem', padding: '0.4rem 0.6rem' }}>
                      {addingSlide === item._id
                        ? <><div style={{ width: 12, height: 12, border: '2px solid rgba(245,240,234,0.3)', borderTopColor: '#F5F0EA', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginRight: '0.4rem' }} /> Caricamento...</>
                        : <><Plus size={11} style={{ marginRight: '0.3rem' }} /> Aggiungi foto</>
                      }
                      <input type="file" accept="image/*" style={{ display: 'none' }} disabled={!!addingSlide}
                        onChange={e => { if (e.target.files[0]) handleAddSlide(item, e.target.files[0]) }} />
                    </label>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ─── PREZZI TAB ────────────────────────────────── */
function PrezziTab() {
  const [overrides, setOverrides] = useState(null) // map name→data
  const [editing, setEditing] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ cat: '', name: '', desc: '', price: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => { loadPrezzi() }, [])

  const loadPrezzi = async () => {
    try {
      const snap = await getDocs(collection(db, 'prezzi'))
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setOverrides(map)
    } catch (err) {
      console.error('Firestore:', err)
      setOverrides({})
    }
  }

  // Merge: ogni default + override Firestore (ID = name)
  const defaultNames = new Set(DEFAULT_SERVICES.map(s => s.name))
  const mergedDefaults = DEFAULT_SERVICES.map(s => {
    const ov = overrides?.[s.name]
    return ov ? { ...s, ...ov, hasOverride: true } : { ...s, hasOverride: false }
  })
  // Elementi extra aggiunti dall'admin (non presenti nei default)
  const extraServices = Object.entries(overrides || {})
    .filter(([id]) => !defaultNames.has(id))
    .map(([, data]) => ({ ...data, hasOverride: true, isExtra: true }))
  const displayItems = [...mergedDefaults, ...extraServices]

  /* Salva modifica — upsert con doc ID = name */
  const handleSaveEdit = async (data) => {
    setSaving(true)
    try {
      await setDoc(doc(db, 'prezzi', data.name), {
        cat: data.cat, name: data.name, desc: data.desc, price: data.price, icon: data.icon || '',
      })
      setEditing(null)
      loadPrezzi()
    } catch (err) {
      console.error(err)
    } finally {
      setSaving(false)
    }
  }

  /* Ripristina default (elimina override) */
  const handleReset = async (name) => {
    if (!confirm('Ripristinare il valore originale del codice?')) return
    await deleteDoc(doc(db, 'prezzi', name))
    loadPrezzi()
  }

  /* Aggiungi servizio extra */
  const handleAdd = async (e) => {
    e.preventDefault()
    setSaving(true)
    await setDoc(doc(db, 'prezzi', newItem.name), { ...newItem, icon: '' })
    setNewItem({ cat: '', name: '', desc: '', price: '' })
    setShowAddForm(false)
    setSaving(false)
    loadPrezzi()
  }

  if (overrides === null) return <Spinner />

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ ...sectionTitle, marginBottom: 0 }}>Prezzi & Servizi</h2>
        <button onClick={() => setShowAddForm(s => !s)} style={btnPrimary}><Plus size={14} /> Aggiungi servizio</button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAdd} style={{ background: '#161616', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid rgba(196,18,48,0.2)' }}>
          <p style={subTitle}>Nuovo servizio</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {[['Categoria', 'cat', 'Taglio, Piega…'], ['Nome *', 'name', 'Taglio donna'], ['Prezzo', 'price', 'da €25']].map(([label, key, ph]) => (
              <div key={key}><label style={labelStyle}>{label}</label><input value={newItem[key]} onChange={e => setNewItem(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} required={key === 'name'} style={inputStyle} /></div>
            ))}
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={labelStyle}>Descrizione</label>
            <textarea value={newItem.desc} onChange={e => setNewItem(p => ({ ...p, desc: e.target.value }))} rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button type="submit" disabled={saving} style={btnPrimary}><Check size={14} /> Salva</button>
            <button type="button" onClick={() => setShowAddForm(false)} style={btnSecondary}><X size={14} /> Annulla</button>
          </div>
        </form>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {displayItems.map(item => (
          <div key={item.name} style={{ background: '#161616', padding: '1rem 1.25rem', border: `1px solid ${item.hasOverride ? 'rgba(196,18,48,0.25)' : 'rgba(255,255,255,0.05)'}`, display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            {editing === item.name ? (
              <EditServiceRow item={item} onSave={handleSaveEdit} onCancel={() => setEditing(null)} saving={saving} />
            ) : (
              <>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                    <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.52rem', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#C41230' }}>{item.cat}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.83rem', fontWeight: 600, color: '#F5F0EA' }}>{item.name}</span>
                    <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.8rem', color: '#C41230', fontWeight: 700, marginLeft: 'auto' }}>{item.price}</span>
                  </div>
                  {item.desc && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.7rem', color: 'rgba(245,240,234,0.35)', margin: 0, lineHeight: 1.6 }}>{item.desc}</p>}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button onClick={() => setEditing(item.name)} style={btnSecondary}><Pencil size={12} /></button>
                  {item.isExtra && (
                    <button onClick={() => handleReset(item.name)} title="Elimina" style={{ ...btnSecondary, borderColor: 'rgba(196,18,48,0.3)', color: '#C41230', padding: '0.6rem 0.6rem' }}><Trash2 size={12} /></button>
                  )}
                  {item.hasOverride && !item.isExtra && (
                    <button onClick={() => handleReset(item.name)} title="Ripristina default" style={{ ...btnSecondary, padding: '0.6rem 0.6rem' }}>↩</button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
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
    orari: 'Lunedì: chiuso\nMartedì: 8:30 – 12:30 / 15:30 – 19:30\nMercoledì: 8:30 – 17:00\nGiovedì: 8:30 – 12:30 / 15:30 – 19:30\nVenerdì: 8:30 – 19:00\nSabato: 8:30 – 19:00\nDomenica: chiuso',
    whatsapp: '3472113803',
    heroVideo: '',
    staffPhoto: '',
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [mediaUploading, setMediaUploading] = useState({})
  const [mediaMsg, setMediaMsg] = useState({})

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
      await setDoc(doc(db, 'info', INFO_ID), { ...info, orariVersion: 2 })
      setMsg('Salvato!')
    } catch (err) {
      setMsg('Errore: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleMediaReset = async (field) => {
    if (!confirm('Ripristinare il file di default del codice?')) return
    const newInfo = { ...info, [field]: '' }
    setInfo(newInfo)
    await setDoc(doc(db, 'info', INFO_ID), newInfo)
    setMediaMsg(m => ({ ...m, [field]: '' }))
  }

  const handleMediaUpload = async (field, file) => {
    setMediaUploading(m => ({ ...m, [field]: true }))
    setMediaMsg(m => ({ ...m, [field]: '' }))
    try {
      const isVideo = file.type.startsWith('video/')
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', UPLOAD_PRESET)
      formData.append('folder', 'parrucchiera-debora/assets')
      const endpoint = isVideo ? 'video' : 'image'
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${endpoint}/upload`, { method: 'POST', body: formData })
      const data = await res.json()
      if (data.error) throw new Error(data.error.message)
      const newInfo = { ...info, [field]: data.secure_url }
      setInfo(newInfo)
      await setDoc(doc(db, 'info', INFO_ID), newInfo)
      setMediaMsg(m => ({ ...m, [field]: 'ok' }))
      setTimeout(() => setMediaMsg(m => ({ ...m, [field]: '' })), 3000)
    } catch (err) {
      setMediaMsg(m => ({ ...m, [field]: err.message }))
    } finally {
      setMediaUploading(m => ({ ...m, [field]: false }))
    }
  }

  if (loading) return <Spinner />

  const textFields = [
    { label: 'Indirizzo',        key: 'indirizzo', ph: 'Via Celso Ulpiani, 15\n63100 Ascoli Piceno (AP)', multi: true },
    { label: 'Telefono (fisso – per le chiamate)', key: 'telefono', ph: '0736 342914', multi: false },
    { label: 'WhatsApp (solo numero, es. 347 211 3803)', key: 'whatsapp', ph: '347 211 3803', multi: false },
    { label: 'Email',            key: 'email',     ph: 'info@parrucchieradebora.it', multi: false },
    { label: 'Orari di apertura', key: 'orari',   ph: 'Lun – Ven: 9:00 – 18:30\nSabato: 9:00 – 17:00\nDomenica: chiuso', multi: true },
  ]

  const mediaFields = [
    { label: 'Video Hero (sfondo homepage)', key: 'heroVideo', accept: 'video/*', current: info.heroVideo, fallback: 'hero.mp4 locale', isVideo: true },
    { label: 'Foto Staff (sezione Chi Sono)', key: 'staffPhoto', accept: 'image/*', current: info.staffPhoto, fallback: 'staff.jpg locale', isVideo: false },
  ]

  return (
    <div>
      {/* Testi e contatti */}
      <h2 style={sectionTitle}>Informazioni Salone</h2>
      <form onSubmit={handleSave} style={{ background: '#161616', padding: '1.75rem', border: '1px solid rgba(196,18,48,0.1)', maxWidth: 640, marginBottom: '2.5rem' }}>
        {textFields.map(({ label, key, ph, multi }) => (
          <div key={key} style={{ marginBottom: '1.25rem' }}>
            <label style={labelStyle}>{label}</label>
            {multi ? (
              <textarea value={info[key] || ''} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} rows={3} style={{ ...inputStyle, resize: 'vertical' }} />
            ) : (
              <input value={info[key] || ''} onChange={e => setInfo(p => ({ ...p, [key]: e.target.value }))} placeholder={ph} style={inputStyle} />
            )}
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button type="submit" disabled={saving} style={btnPrimary}>
            <Check size={14} /> {saving ? 'Salvataggio...' : 'Salva modifiche'}
          </button>
          {msg && <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: msg.startsWith('Errore') ? '#C41230' : '#4caf50' }}>{msg}</span>}
        </div>
      </form>

      {/* Media fissi */}
      <h2 style={{ ...sectionTitle, fontSize: '1.4rem' }}>Media Fissi del Sito</h2>
      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.72rem', color: 'rgba(245,240,234,0.35)', marginBottom: '1.5rem', marginTop: '-1rem' }}>
        Carica qui le immagini/video che rimangono fissi nel sito (non nella galleria).
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: 640 }}>
        {mediaFields.map(({ label, key, accept, current, fallback, isVideo }) => {
          const uploading = mediaUploading[key]
          const mMsg = mediaMsg[key]
          return (
            <div key={key} style={{ background: '#161616', border: '1px solid rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              {/* Preview */}
              <div style={{ position: 'relative', aspectRatio: '16/9', background: '#0e0e0e' }}>
                {current
                  ? isVideo
                    ? <video src={current} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
                    : <img src={current} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '0.4rem' }}>
                      <Upload size={24} color="rgba(245,240,234,0.15)" />
                      <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem', color: 'rgba(245,240,234,0.2)' }}>{fallback}</span>
                    </div>
                }
                {uploading && (
                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(196,18,48,0.3)', borderTopColor: '#C41230', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  </div>
                )}
              </div>
              {/* Info + upload */}
              <div style={{ padding: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', fontWeight: 600, color: '#F5F0EA' }}>{label}</div>
                  {current && (
                    <button onClick={() => handleMediaReset(key)} title="Ripristina default" style={{ ...btnSecondary, padding: '0.3rem 0.5rem', fontSize: '0.7rem', lineHeight: 1 }}>↩</button>
                  )}
                </div>
                {mMsg === 'ok'
                  ? <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#4caf50', margin: 0, display: 'flex', alignItems: 'center', gap: '0.3rem' }}><Check size={12} /> Aggiornato!</p>
                  : mMsg
                    ? <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: '#C41230', margin: 0 }}>Errore: {mMsg}</p>
                    : (
                      <label style={{ ...btnSecondary, display: 'flex', cursor: uploading ? 'not-allowed' : 'pointer', justifyContent: 'center', opacity: uploading ? 0.5 : 1 }}>
                        <Upload size={12} style={{ marginRight: '0.4rem' }} />
                        {current ? 'Sostituisci' : 'Carica file'}
                        <input type="file" accept={accept} style={{ display: 'none' }} disabled={uploading}
                          onChange={e => { if (e.target.files[0]) handleMediaUpload(key, e.target.files[0]) }} />
                      </label>
                    )
                }
              </div>
            </div>
          )
        })}
      </div>
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
