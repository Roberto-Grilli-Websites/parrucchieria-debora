import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { useNavigate } from 'react-router-dom'
import { Scissors } from 'lucide-react'

const provider = new GoogleAuthProvider()

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, user => {
      if (user) navigate('/admin/dashboard')
    })
    return unsub
  }, [navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/admin/dashboard')
    } catch (err) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError('Email o password errati.')
      } else if (err.code === 'auth/too-many-requests') {
        setError('Troppi tentativi. Riprova tra qualche minuto.')
      } else {
        setError('Errore di accesso. Riprova.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, provider)
      navigate('/admin/dashboard')
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user' && err.code !== 'auth/cancelled-popup-request') {
        setError('Accesso con Google non riuscito. Riprova.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0e0e0e', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <Scissors size={36} color="#C41230" style={{ marginBottom: '1rem' }} />
          <h1 style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '2rem', fontWeight: 400, color: '#F5F0EA', margin: 0 }}>
            Parrucchieria Debora
          </h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.25em', textTransform: 'uppercase', color: '#C41230', marginTop: '0.5rem' }}>
            Area Amministrativa
          </p>
        </div>

        <div style={{ background: '#161616', padding: '2.5rem', border: '1px solid rgba(196,18,48,0.15)' }}>
          <button onClick={handleGoogle} disabled={loading} style={{ width: '100%', padding: '0.85rem', background: '#fff', color: '#1a1a1a', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.15em', textTransform: 'uppercase', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.75rem', transition: 'opacity 0.3s' }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.5 6.5 29 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5c10.5 0 19.5-7.6 19.5-19.5 0-1.3-.1-2.7-.4-4z"/>
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.7 1.1 7.8 2.9L37 9.7C33.5 6.5 29 4.5 24 4.5c-7.6 0-14.2 4.3-17.7 10.2z"/>
              <path fill="#4CAF50" d="M24 43.5c4.9 0 9.4-1.9 12.8-4.9l-5.9-5c-2 1.4-4.5 2.3-6.9 2.3-5.2 0-9.6-3.5-11.2-8.3l-6.5 5C9.6 39 16.3 43.5 24 43.5z"/>
              <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l5.9 5C40.6 35.4 43.5 30.1 43.5 24c0-1.3-.1-2.7-.4-4z"/>
            </svg>
            Accedi con Google
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.75rem' }}>
            <div style={{ flex: 1, height: 1, background: 'rgba(245,240,234,0.08)' }}/>
            <span style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.6rem', color: 'rgba(245,240,234,0.25)', letterSpacing: '0.15em' }}>OPPURE</span>
            <div style={{ flex: 1, height: 1, background: 'rgba(245,240,234,0.08)' }}/>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={inputStyle}
                placeholder="admin@esempio.com"
              />
            </div>
            <div style={{ marginBottom: '1.75rem' }}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={inputStyle}
                placeholder="••••••••"
              />
            </div>
            {error && (
              <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.75rem', color: '#C41230', marginBottom: '1rem', textAlign: 'center' }}>
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '0.9rem', background: loading ? '#7a0a1c' : '#C41230', color: '#F5F0EA', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 700, fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase', transition: 'background 0.3s' }}>
              {loading ? 'Accesso in corso...' : 'Accedi'}
            </button>
          </form>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <a href="#/" style={{ fontFamily: 'Montserrat, sans-serif', fontSize: '0.65rem', color: 'rgba(245,240,234,0.3)', textDecoration: 'none' }}>
            ← Torna al sito
          </a>
        </p>
      </div>
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.6rem',
  fontWeight: 700,
  letterSpacing: '0.2em',
  textTransform: 'uppercase',
  color: 'rgba(245,240,234,0.5)',
  marginBottom: '0.5rem',
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  background: '#0e0e0e',
  border: '1px solid rgba(196,18,48,0.2)',
  color: '#F5F0EA',
  fontFamily: 'Montserrat, sans-serif',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box',
}
