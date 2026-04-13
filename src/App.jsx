import { useState, useEffect, useRef } from 'react'
import { Routes, Route } from 'react-router-dom'
import {
  Scissors, Star, MapPin, Phone, Clock,
  Menu, X, Sparkles, Award, Heart, Zap, Check,
  MessageCircle, ZoomIn
} from 'lucide-react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase'
import AdminLogin from './pages/AdminLogin'
import AdminDashboard from './pages/AdminDashboard'
import ProtectedRoute from './components/ProtectedRoute'

/* ─── CONSTANTS ─────────────────────────────── */
const WA_LINK = "https://wa.me/390736342914?text=Ciao%20Debora!%20Vorrei%20prenotare%20un%20appuntamento%20%F0%9F%92%87%E2%80%8D%E2%99%80%EF%B8%8F"
const PHONE   = "tel:+390736342914"
const BASE    = import.meta.env.BASE_URL

/* ─── HOOK: site info da Firestore ──────────── */
function useSiteInfo() {
  const [info, setInfo] = useState({})
  useEffect(() => {
    getDocs(collection(db, 'info')).then(snap => {
      const d = snap.docs.find(d => d.id === 'principale')
      if (d) setInfo(d.data())
    }).catch(() => {})
  }, [])
  return info
}

/* ─── HOOK: visibility ───────────────────────── */
function useVisible(threshold = 0.12) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true) },
      { threshold }
    )
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

/* ─── HOOK: scroll Y ─────────────────────────── */
function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const fn = () => setY(window.scrollY)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])
  return y
}

/* ─── ANIMATED COUNTER ───────────────────────── */
function Counter({ target, suffix = '' }) {
  const [n, setN] = useState(0)
  const [ref, visible] = useVisible(0.3)
  useEffect(() => {
    if (!visible) return
    let cur = 0
    const step = Math.max(1, Math.ceil(target / 50))
    const t = setInterval(() => {
      cur += step
      if (cur >= target) { setN(target); clearInterval(t) } else setN(cur)
    }, 28)
    return () => clearInterval(t)
  }, [visible, target])
  return <span ref={ref}>{n}{suffix}</span>
}

/* ─── FLOATING PARTICLES (hero BG) ──────────── */
function Particles() {
  const particles = useRef([...Array(18)].map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    dur: Math.random() * 12 + 8,
    delay: Math.random() * 6,
    opacity: Math.random() * 0.25 + 0.05,
  }))).current
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {particles.map(p => (
        <div key={p.id} style={{
          position: 'absolute',
          left: `${p.x}%`, top: `${p.y}%`,
          width: p.size, height: p.size,
          borderRadius: '50%',
          background: '#C41230',
          opacity: p.opacity,
          animation: `float ${p.dur}s ${p.delay}s ease-in-out infinite alternate`,
        }}/>
      ))}
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px) translateX(0px); }
          33%  { transform: translateY(-18px) translateX(8px); }
          66%  { transform: translateY(-6px) translateX(-12px); }
          100% { transform: translateY(-22px) translateX(5px); }
        }
      `}</style>
    </div>
  )
}

/* ─── REVEAL TEXT (split word animation) ────── */
function RevealText({ children, delay = 0, color = '#F5F0EA', style = {} }) {
  const [ref, visible] = useVisible(0.1)
  return (
    <span ref={ref} style={{
      display: 'inline-block',
      overflow: 'hidden',
      verticalAlign: 'bottom',
      ...style,
    }}>
      <span style={{
        display: 'inline-block',
        transform: visible ? 'translateY(0)' : 'translateY(110%)',
        opacity: visible ? 1 : 0,
        transition: `transform 0.9s cubic-bezier(0.16,1,0.3,1) ${delay}s, opacity 0.6s ease ${delay}s`,
        color,
      }}>
        {children}
      </span>
    </span>
  )
}

/* ─── MAGNETIC BUTTON ────────────────────────── */
function MagneticBtn({ href, children, primary = true, style: extra = {} }) {
  const ref = useRef(null)
  const handleMove = (e) => {
    const el = ref.current; if (!el) return
    const r = el.getBoundingClientRect()
    const x = e.clientX - r.left - r.width / 2
    const y = e.clientY - r.top - r.height / 2
    el.style.transform = `translate(${x * 0.22}px, ${y * 0.22}px)`
  }
  const handleLeave = () => { if (ref.current) ref.current.style.transform = 'translate(0,0)' }
  const base = primary
    ? { background: '#C41230', color: '#F5F0EA', border: 'none' }
    : { background: 'transparent', color: '#F5F0EA', border: '1.5px solid rgba(245,240,234,0.4)' }
  return (
    <a ref={ref} href={href}
      onMouseMove={handleMove} onMouseLeave={handleLeave}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
        fontFamily: 'Montserrat,sans-serif', fontWeight: 600,
        fontSize: '0.68rem', letterSpacing: '0.2em', textTransform: 'uppercase',
        padding: '0.9rem 2.2rem', textDecoration: 'none', cursor: 'pointer',
        transition: 'transform 0.3s cubic-bezier(0.16,1,0.3,1), box-shadow 0.3s ease',
        ...base, ...extra,
      }}
      onMouseEnter={e => {
        if (primary) e.currentTarget.style.boxShadow = '0 8px 30px rgba(196,18,48,0.45)'
        else e.currentTarget.style.borderColor = '#F5F0EA'
      }}
      onMouseLeave2={e => e.currentTarget.style.boxShadow = 'none'}
    >
      {children}
    </a>
  )
}

/* ─── DATA ───────────────────────────────────── */
const services = [
  { cat:'Taglio',      icon:'✂',  name:'Taglio',                      desc:'Taglio su misura con consulenza personalizzata.',                                                          price:'€13' },
  { cat:'Taglio',      icon:'💨', name:'Piega',                       desc:'Shampoo e messa in piega con phon e spazzola.',                                                            price:'€13' },
  { cat:'Taglio',      icon:'💆', name:'Pettinata',                   desc:'Messa in piega e acconciatura senza taglio.',                                                              price:'€8' },
  { cat:'Colore',      icon:'🎨', name:'Colore',                      desc:'Colorazione permanente uniforme su tutta la lunghezza.',                                                   price:'€24' },
  { cat:'Colore',      icon:'🎨', name:'Ritocco colore',              desc:'Ritocco radici con colorazione permanente.',                                                               price:'€11' },
  { cat:'Colore',      icon:'🎨', name:'Bagno colore',                desc:'Trattamento colorante per ravvivare e uniformare il colore su tutta la lunghezza.',                       price:'€23' },
  { cat:'Colore',      icon:'✨', name:'Tonalizzante',                desc:'Trattamento tonalizzante per riflessi e luminosità.',                                                      price:'€10' },
  { cat:'Colore',      icon:'✨', name:'Meches',                      desc:'Schiariture classiche con stagnola per riflessi naturali.',                                                price:'€35' },
  { cat:'Colore',      icon:'✨', name:'Ritocco meches',              desc:'Ritocco delle schiariture su ricrescita.',                                                                  price:'€20' },
  { cat:'Colore',      icon:'🌈', name:'Contouring + tonalizzante',   desc:'Tecnica di contouring colore con finitura tonalizzante.',                                                  price:'€15' },
  { cat:'Colore',      icon:'☀', name:'Degradé',                     desc:'Colorazione a degradé per un effetto naturale e sfumato.',                                                 price:'€45' },
  { cat:'Colore',      icon:'🌟', name:'Voilage',                     desc:'Tecnica di schiariture a velo per un effetto luminoso e naturale.',                                        price:'€50' },
  { cat:'Trattamenti', icon:'〰', name:'Permanente classica',         desc:'Permanente classica o ricci morbidi con consulenza inclusa.',                                             price:'€30' },
  { cat:'Trattamenti', icon:'🌿', name:'Permanente cheratina',        desc:'Lisciatura duratura con cheratina, effetto anti-crespo.',                                                  price:'€40' },
  { cat:'Trattamenti', icon:'💧', name:'Balsamo',                     desc:'Balsamo nutriente per capelli morbidi e luminosi.',                                                        price:'€3' },
  { cat:'Trattamenti', icon:'🌱', name:'Anticaduta',                  desc:'Trattamento specifico anticaduta per rafforzare il capello.',                                             price:'€4' },
  { cat:'Trattamenti', icon:'🌿', name:'Stiraggio cheratina',         desc:'Stiraggio con cheratina per capelli lisci e disciplinati.',                                               price:'€5 / gr.' },
  { cat:'Trattamenti', icon:'💎', name:'Trattamenti idratanti',       desc:'Trattamenti specifici idratanti (shampoo, conditioner, spray).',                                          price:'€9' },
  { cat:'Trattamenti', icon:'✨', name:'Trattamento Regeneration',    desc:'Trattamento rigenerante intensivo per capelli fortemente danneggiati.',                                   price:'€60' },
  { cat:'Trattamenti', icon:'💆', name:'Ricostruzione',               desc:'Ricostruzione della struttura del capello con trattamenti specifici.',                                    price:'€35' },
  { cat:'Trattamenti', icon:'🫧', name:'Ozono',                       desc:'Trattamento all\'ozono per pulizia profonda e ossigenazione del cuoio capelluto.',                        price:'€5 / 10 min.' },
  { cat:'Estetica',    icon:'✦',  name:'Baffetti',                    desc:'Depilazione o rimozione dei baffetti.',                                                                    price:'€3' },
  { cat:'Estetica',    icon:'✦',  name:'Sopracciglia',                desc:'Sistemazione e definizione sopracciglia.',                                                                 price:'€3' },
]
const serviceCategories = ['Tutti','Taglio','Colore','Trattamenti','Estetica']

const reviews = [
  { name: 'Laura Cellini',      stars: 5, tag: 'Cliente da anni',    text: 'Consiglio la Parrucchiera Debora perchè ha professionalità, competenza, gentilezza e disponibilità. Sono cliente da diversi anni e non mi ha mai delusa!' },
  { name: 'Gabriella Bartolini',stars: 5, tag: 'Ospite affezionata', text: 'Professionalità, bravura, innovazione, scelta dei prodotti per la cura dei capelli, simpatia e disponibilità. Non la cambierei per nulla al mondo ❣️' },
  { name: 'Veronica Amici',     stars: 5, tag: 'Colore & Taglio',    text: 'Consiglio vivamente per professionalità e velocità. Sono uscita "nuova" e bellissima... Grazieeeee! Ottimi prezzi!!!' },
  { name: 'Sabrina Del Vecchio',stars: 5, tag: 'Local Guide',        text: 'Per il taglio nulla da obiettare: gentilezza, rispettano gli appuntamenti, consigli utili. I prezzi sono davvero buoni.' },
  { name: 'Paola Marucci',      stars: 5, tag: 'Local Guide',        text: 'La titolare è molto discreta e professionale. Un ambiente raffinato dove ti senti subito a casa.' },
  { name: 'Ernesto Tacconi',    stars: 5, tag: 'La migliore',        text: 'La migliore parrucchiera di Ascoli Piceno. Hairstyling, colorazione, acconciature — eccellenza in ogni servizio.' },
]

const galleryItems = [
  { label: 'Colorazione & Meches',  sub: 'Colore',      gradient: 'linear-gradient(160deg,#2c1810 0%,#7a4a2a 50%,#c49a6c 100%)', img: `${BASE}lavori/portfolio1-dopo.jpg`,  images: [{ src: `${BASE}lavori/portfolio1-dopo.jpg` }, { src: `${BASE}lavori/portfolio1-prima.jpg`, badge: 'Prima' }] },
  { label: 'Meches su Biondo',      sub: 'Colore',      gradient: 'linear-gradient(160deg,#3a2e00 0%,#8a7020 50%,#d4b84a 100%)', img: `${BASE}lavori/portfolio2-dopo.jpg`,  images: [{ src: `${BASE}lavori/portfolio2-dopo.jpg` }, { src: `${BASE}lavori/portfolio2-prima.jpg` }] },
  { label: 'Acconciatura Sposa',    sub: 'Sposa',       gradient: 'linear-gradient(160deg,#1a0a10 0%,#4a1a28 50%,#8a3a50 100%)', img: `${BASE}lavori/portfolio3-sposa.jpg`, images: [{ src: `${BASE}lavori/portfolio3-sposa.jpg` }] },
  { label: 'Permanente Ricci',      sub: 'Trattamenti', gradient: 'linear-gradient(160deg,#2a1e05 0%,#6a5015 50%,#b08830 100%)', img: `${BASE}lavori/portfolio4-dopo.jpg`,  images: [{ src: `${BASE}lavori/portfolio4-dopo.jpg` }, { src: `${BASE}lavori/portfolio4-prima.jpg` }] },
  { label: 'Silver Grey',           sub: 'Colore',      gradient: 'linear-gradient(160deg,#1a1a1a 0%,#484848 50%,#909090 100%)', img: `${BASE}lavori/portfolio5-dopo.jpg`,  images: [{ src: `${BASE}lavori/portfolio5-dopo.jpg` }, { src: `${BASE}lavori/portfolio5-prima.jpg` }] },
]

/* ─── GLOBAL STYLES ──────────────────────────── */
const GLOBAL_CSS = `
  @keyframes bob { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(7px)} }
  @keyframes spinSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(196,18,48,0.4)} 50%{box-shadow:0 0 0 14px rgba(196,18,48,0)} }
  @keyframes shimmerLine { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.9)} to{opacity:1;transform:scale(1)} }
  @media(max-width:860px){.desk-nav{display:none!important}.mob-btn{display:block!important}}
  @media(max-width:640px){.gallery-grid{grid-template-columns:repeat(2,1fr)!important}}
`

/* ─── NAVBAR ─────────────────────────────────── */
const NAV_LINKS = [
  { label: 'Chi Sono',     id: 'chi-sono' },
  { label: 'Servizi',      id: 'servizi' },
  { label: 'I Miei Lavori',id: 'i-miei-lavori' },
  { label: 'Recensioni',   id: 'recensioni' },
  { label: 'Contatti',     id: 'contatti' },
]

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const scrollY = useScrollY()
  const scrolled = scrollY > 50
  return (
    <nav style={{ position:'fixed',top:0,left:0,right:0,zIndex:1000, background:scrolled?'rgba(14,14,14,0.97)':'transparent', backdropFilter:scrolled?'blur(16px)':'none', borderBottom:scrolled?'1px solid rgba(196,18,48,0.18)':'none', padding:scrolled?'0.9rem 0':'1.5rem 0', transition:'all 0.45s ease' }}>
      <div style={{ maxWidth:1280,margin:'0 auto',padding:'0 2rem',display:'flex',alignItems:'center',justifyContent:'space-between' }}>
        <button onClick={()=>scrollTo('home')} style={{ background:'none',border:'none',cursor:'pointer',textDecoration:'none',display:'flex',alignItems:'center',gap:'0.7rem',padding:0 }}>
          <img src={`${BASE}symbol.svg`} alt="" style={{ height:scrolled?'36px':'44px',width:'auto',transition:'height 0.4s ease' }}/>
          <span style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:scrolled?'1.05rem':'1.2rem',fontWeight:600,color:'#F5F0EA',letterSpacing:'0.04em',transition:'font-size 0.4s ease' }}>Parrucchieria Debora</span>
        </button>
        <div className="desk-nav" style={{ display:'flex',alignItems:'center',gap:'2.5rem' }}>
          {NAV_LINKS.map(({ label, id }) => (
            <button key={id} onClick={()=>scrollTo(id)}
              style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.65rem',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'#F5F0EA',background:'none',border:'none',cursor:'pointer',padding:'0 0 3px',transition:'color 0.3s' }}
              onMouseEnter={e=>e.currentTarget.style.color='#C41230'}
              onMouseLeave={e=>e.currentTarget.style.color='#F5F0EA'}
            >{label}</button>
          ))}
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'#C41230',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:600,fontSize:'0.62rem',letterSpacing:'0.18em',textTransform:'uppercase',padding:'0.65rem 1.4rem',textDecoration:'none',transition:'all 0.3s ease',animation:'pulseRed 3s infinite' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#9E0E26';e.currentTarget.style.transform='translateY(-2px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#C41230';e.currentTarget.style.transform='translateY(0)'}}
          >
            <MessageCircle size={13}/> Prenota
          </a>
        </div>
        <button onClick={()=>setOpen(o=>!o)} className="mob-btn" style={{ display:'none',background:'none',border:'none',color:'#F5F0EA',cursor:'pointer',padding:'0.4rem' }}>
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>
      {open && (
        <div style={{ background:'rgba(14,14,14,0.98)',borderTop:'1px solid rgba(196,18,48,0.2)',padding:'1.5rem 2rem', animation:'fadeUp 0.3s ease' }}>
          {NAV_LINKS.map(({ label, id }) => (
            <button key={id} onClick={()=>{ scrollTo(id); setOpen(false) }}
              style={{ display:'block',width:'100%',textAlign:'left',padding:'0.85rem 0',borderBottom:'1px solid rgba(255,255,255,0.05)',borderLeft:'none',borderRight:'none',borderTop:'none',fontFamily:'Montserrat,sans-serif',fontSize:'0.7rem',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'#F5F0EA',background:'none',cursor:'pointer' }}
            >{label}</button>
          ))}
          <a href={WA_LINK} target="_blank" rel="noreferrer" onClick={()=>setOpen(false)}
            style={{ display:'flex',alignItems:'center',gap:'0.5rem',marginTop:'1rem',padding:'0.85rem 0',fontFamily:'Montserrat,sans-serif',fontSize:'0.7rem',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'#C41230',textDecoration:'none' }}
          ><MessageCircle size={15}/> Prenota su WhatsApp</a>
        </div>
      )}
      <style>{GLOBAL_CSS}</style>
    </nav>
  )
}

/* ─── HERO ───────────────────────────────────── */
function Hero() {
  const scrollY = useScrollY()
  const info = useSiteInfo()
  const heroSrc = info.heroVideo || `${BASE}hero.mp4`
  return (
    <section id="home" style={{ minHeight:'100vh',position:'relative',display:'flex',alignItems:'center',background:'#0e0e0e',overflow:'hidden' }}>

      {/* VIDEO BACKGROUND */}
      <video autoPlay muted loop playsInline
        style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',transform:`translateY(${scrollY*0.25}px) scale(1.1)`,transition:'transform 0.1s linear',pointerEvents:'none' }}>
        <source src={heroSrc} type="video/mp4"/>
      </video>

      {/* Layered overlays — dark base + brand red tint */}
      <div style={{ position:'absolute',inset:0,background:'linear-gradient(105deg,rgba(10,4,6,0.96) 0%,rgba(28,8,16,0.88) 50%,rgba(10,4,6,0.78) 100%)',pointerEvents:'none' }}/>
      <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 70% 50%,rgba(196,18,48,0.07) 0%,transparent 65%)',pointerEvents:'none' }}/>

{/* Rotating decorative ring */}
      <div style={{ position:'absolute',right:'8%',top:'50%',transform:`translateY(-50%) translateY(${scrollY*0.08}px)`,opacity:0.06,pointerEvents:'none',animation:'spinSlow 30s linear infinite' }}>
        <svg width="420" height="420" viewBox="0 0 420 420" fill="none">
          <circle cx="210" cy="210" r="200" stroke="#C41230" strokeWidth="1" strokeDasharray="8 12"/>
          <circle cx="210" cy="210" r="150" stroke="#C41230" strokeWidth="0.5" strokeDasharray="4 18"/>
        </svg>
      </div>

      {/* Vertical red accent — pushed further left on mobile */}
      <div style={{ position:'absolute',left:'0.6rem',top:'18%',bottom:'18%',width:1.5,background:'linear-gradient(to bottom,transparent,#C41230 30%,#C41230 70%,transparent)' }}/>

      <div style={{ maxWidth:1280,margin:'0 auto',padding:'9rem 2rem 5rem',position:'relative',zIndex:2 }}>
        <div style={{ maxWidth:680 }}>
          {/* Eyebrow with shimmer */}
          <div style={{ display:'inline-flex',alignItems:'center',gap:'0.75rem',marginBottom:'2rem',animation:'fadeUp 0.8s ease both' }}>
            <div style={{ width:36,height:1.5,background:'linear-gradient(90deg,transparent,#C41230,transparent)',backgroundSize:'200% 100%',animation:'shimmerLine 2s infinite' }}/>
            <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.32em',textTransform:'uppercase',color:'#C41230' }}>Parrucchieria — Ascoli Piceno</span>
          </div>

          {/* Headline — reveal animation */}
          <div style={{ marginBottom:'2rem', overflow:'hidden' }}>
            <h1 style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(3rem,7.5vw,6.5rem)',fontWeight:300,color:'#F5F0EA',lineHeight:1.05,letterSpacing:'-0.02em',margin:0,animation:'fadeUp 0.9s 0.1s ease both' }}>
              Il tuo capello,
            </h1>
            <h1 style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(3rem,7.5vw,6.5rem)',fontWeight:600,fontStyle:'italic',color:'#C41230',lineHeight:1.05,letterSpacing:'-0.02em',margin:0,animation:'fadeUp 0.9s 0.25s ease both' }}>
              la mia passione.
            </h1>
          </div>

          <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.9rem',fontWeight:300,color:'rgba(245,240,234,0.65)',lineHeight:1.95,maxWidth:500,marginBottom:'3rem',animation:'fadeUp 0.9s 0.4s ease both' }}>
            Debora Carboni e il suo team ti accolgono nel salone di Via Celso Ulpiani ad Ascoli Piceno con la cura e l'attenzione che merita ogni cliente. Ogni visita è un'esperienza su misura, pensata esclusivamente per te.
          </p>

          <div style={{ display:'flex',gap:'1rem',flexWrap:'wrap',animation:'fadeUp 0.9s 0.55s ease both' }}>
            <a href={WA_LINK} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'#C41230',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'1rem 2.4rem',textDecoration:'none',transition:'all 0.35s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#9E0E26';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 35px rgba(196,18,48,0.45)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#C41230';e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}
            >
              <MessageCircle size={15}/> Scrivimi su WhatsApp
            </a>
            <a href={PHONE}
              style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'transparent',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:600,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'1rem 2.2rem',textDecoration:'none',border:'1.5px solid rgba(245,240,234,0.35)',transition:'all 0.35s ease' }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='#F5F0EA';e.currentTarget.style.background='rgba(245,240,234,0.06)'}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(245,240,234,0.35)';e.currentTarget.style.background='transparent'}}
            >
              <Phone size={14}/> Chiamami
            </a>
          </div>

          {/* Social proof */}
          <div style={{ display:'flex',alignItems:'center',gap:'0.75rem',marginTop:'3.5rem',animation:'fadeUp 0.9s 0.7s ease both' }}>
            <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.68rem',color:'rgba(245,240,234,0.45)',letterSpacing:'0.08em' }}>
              Clienti che la definiscono la loro parrucchiera preferita
            </span>
          </div>
        </div>
      </div>

    </section>
  )
}

/* ─── STATS ──────────────────────────────────── */
function Stats() {
  return (
    <section style={{ background:'#1C1C1C',padding:'3.5rem 2rem',borderTop:'1px solid rgba(196,18,48,0.2)',borderBottom:'1px solid rgba(196,18,48,0.2)',position:'relative',overflow:'hidden' }}>
      {/* shimmer scan line */}
      <div style={{ position:'absolute',inset:0,background:'linear-gradient(90deg,transparent 0%,rgba(196,18,48,0.04) 50%,transparent 100%)',backgroundSize:'200% 100%',animation:'shimmerLine 4s infinite',pointerEvents:'none' }}/>
      <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'2rem',textAlign:'center',position:'relative' }}>
        {[
          { n:20, s:'+',    label:'Anni di esperienza' },
          { n:500,s:'+',    label:'Clienti soddisfatte' },
          { n:100,s:'%',    label:'Passione in ogni lavoro' },
          { n:1,  s:'',     label:'Team dedicato a te' },
        ].map(({n,s,label})=>(
          <div key={label}>
            <div style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'3.2rem',fontWeight:600,color:'#C41230',lineHeight:1 }}>
              <Counter target={n} suffix={s}/>
            </div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:600,letterSpacing:'0.22em',textTransform:'uppercase',color:'rgba(245,240,234,0.4)',marginTop:'0.5rem' }}>{label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ─── ABOUT ──────────────────────────────────── */
function About() {
  const [rL,vL] = useVisible()
  const [rR,vR] = useVisible()
  const info = useSiteInfo()
  const staffSrc = info.staffPhoto || `${BASE}staff.jpg`
  return (
    <section id="chi-sono" style={{ padding:'9rem 2rem',background:'#F5F0EA',overflow:'hidden' }}>
      <div style={{ maxWidth:1280,margin:'0 auto',display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'6rem',alignItems:'center' }}>

        {/* LEFT: staff photo panel */}
        <div ref={rL} style={{ opacity:vL?1:0,transform:vL?'none':'translateX(-45px)',transition:'all 1s cubic-bezier(0.16,1,0.3,1)',position:'relative' }}>
          <div style={{ background:'#1C1C1C',position:'relative',overflow:'hidden' }}>
            {/* animated red top bar */}
            <div style={{ position:'absolute',top:0,left:0,right:0,height:3,zIndex:2,background:'linear-gradient(90deg,transparent,#C41230,transparent)',backgroundSize:'200% 100%',animation:vL?'shimmerLine 2.5s 0.5s ease both':'none' }}/>
            <img src={staffSrc} alt="Team Parrucchieria Debora" style={{ width:'100%',height:'auto',display:'block',objectFit:'cover' }}/>
            {/* caption overlay */}
            <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'2rem',background:'linear-gradient(to top,rgba(0,0,0,0.82) 0%,transparent 100%)' }}>
              <p style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.15rem',fontStyle:'italic',fontWeight:400,color:'rgba(245,240,234,0.85)',lineHeight:1.7,textAlign:'center' }}>
                "Ogni capello racconta una storia.<br/>Io la racconto con le mie mani."
              </p>
              <div style={{ width:36,height:1.5,background:'#C41230',margin:'0.9rem auto 0' }}/>
              <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.65rem',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'#C41230',marginTop:'0.6rem',textAlign:'center' }}>Debora Carboni & Team</p>
            </div>
          </div>
          {/* badge */}
          <div style={{ position:'absolute',bottom:'-1.5rem',right:'-1.5rem',background:'#C41230',width:110,height:110,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',textAlign:'center',padding:'0.75rem',animation:vL?'scaleIn 0.6s 0.6s ease both':'none',opacity:vL?1:0 }}>
            <div style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'2.2rem',fontWeight:700,color:'#F5F0EA',lineHeight:1 }}>20+</div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.5rem',fontWeight:700,letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(245,240,234,0.85)',marginTop:'0.25rem' }}>Anni di<br/>esperienza</div>
          </div>
        </div>

        {/* RIGHT: text */}
        <div ref={rR} style={{ opacity:vR?1:0,transform:vR?'none':'translateX(45px)',transition:'all 1s cubic-bezier(0.16,1,0.3,1) 0.15s' }}>
          <div style={{ display:'flex',alignItems:'center',gap:'0.75rem',marginBottom:'1.25rem' }}>
            <div style={{ width:36,height:1.5,background:'#C41230' }}/>
            <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.28em',textTransform:'uppercase',color:'#C41230' }}>Chi sono</span>
          </div>
          <h2 style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2.2rem,4vw,3.2rem)',fontWeight:400,color:'#1C1C1C',lineHeight:1.2,marginBottom:'2rem' }}>
            Un team che lavora<br/><span style={{ fontStyle:'italic',color:'#C41230' }}>solo per te.</span>
          </h2>
          <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.88rem',fontWeight:300,color:'#555',lineHeight:1.95,marginBottom:'1.2rem' }}>
            Mi chiamo <strong style={{ color:'#1C1C1C',fontWeight:600 }}>Debora Carboni</strong> e insieme al mio team mi prendo cura dei capelli delle clienti ad Ascoli Piceno da oltre 20 anni, con dedizione, passione e rispetto. Ogni persona che entra nel nostro salone trova un ambiente accogliente e professionisti pronti ad ascoltarla.
          </p>
          <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.88rem',fontWeight:300,color:'#555',lineHeight:1.95,marginBottom:'2.5rem' }}>
            Nessuna fretta, nessun compromesso. Usiamo prodotti selezionati di alta qualità, ci aggiorniamo costantemente sulle tecniche più innovative e — soprattutto — ascoltiamo. Perché capire cosa vuoi è il primo passo per darti ciò che meriti.
          </p>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.85rem',marginBottom:'2.5rem' }}>
            {['Professionalità','Innovazione','Attenzione personale','Discrezione'].map((v,i)=>(
              <div key={v} style={{ display:'flex',alignItems:'center',gap:'0.6rem',opacity:vR?1:0,transform:vR?'none':'translateY(12px)',transition:`all 0.5s ease ${0.3+i*0.1}s` }}>
                <div style={{ width:20,height:20,background:'rgba(196,18,48,0.1)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0 }}>
                  <Check size={11} color="#C41230" strokeWidth={3}/>
                </div>
                <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.78rem',fontWeight:500,color:'#1C1C1C' }}>{v}</span>
              </div>
            ))}
          </div>
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'#C41230',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'0.9rem 2.2rem',textDecoration:'none',transition:'all 0.35s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#9E0E26';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(196,18,48,0.4)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#C41230';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
          >
            <MessageCircle size={15}/> Prenota la tua visita
          </a>
        </div>
      </div>
    </section>
  )
}

/* ─── SERVICES ───────────────────────────────── */
function Services() {
  const [active, setActive] = useState('Tutti')
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    getDocs(collection(db, 'prezzi')).then(snap => {
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setOverrides(map)
    }).catch(() => {})
  }, [])

  const defaultNames = new Set(services.map(s => s.name))
  const merged = services.map(s => ({ ...s, ...(overrides[s.name] || {}) }))
  const extras = Object.entries(overrides).filter(([id]) => !defaultNames.has(id)).map(([, d]) => d)
  const normCat = c => { const t = (c || '').trim(); return t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '' }
  const serviceList = [...merged, ...extras].map(s => ({ ...s, cat: normCat(s.cat) }))
  const filtered = active === 'Tutti' ? serviceList : serviceList.filter(s => s.cat.toLowerCase() === active.toLowerCase())
  return (
    <section id="servizi" style={{ padding:'9rem 2rem',background:'#111',overflow:'hidden' }}>
      <div style={{ maxWidth:1280,margin:'0 auto' }}>
        <SectionHeader dark tag="Cosa offriamo" title={<>Servizi pensati<br/><span style={{ fontStyle:'italic',color:'#C41230' }}>per valorizzarti</span></>}/>

        {/* Filter pills */}
        <div style={{ display:'flex',flexWrap:'wrap',gap:'0.5rem',justifyContent:'center',marginBottom:'3.5rem' }}>
          {['Tutti', ...new Set(serviceList.map(s => s.cat ? s.cat.trim().charAt(0).toUpperCase() + s.cat.trim().slice(1).toLowerCase() : '').filter(Boolean))].map(cat => (
            <button key={cat} onClick={()=>setActive(cat)}
              style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.62rem',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',padding:'0.55rem 1.4rem',border:`1.5px solid ${active===cat?'#C41230':'rgba(245,240,234,0.15)'}`,background:active===cat?'#C41230':'transparent',color:active===cat?'#F5F0EA':'rgba(245,240,234,0.45)',cursor:'pointer',transition:'all 0.25s ease' }}
              onMouseEnter={e=>{ if(active!==cat){ e.currentTarget.style.borderColor='rgba(196,18,48,0.5)'; e.currentTarget.style.color='#F5F0EA' }}}
              onMouseLeave={e=>{ if(active!==cat){ e.currentTarget.style.borderColor='rgba(245,240,234,0.15)'; e.currentTarget.style.color='rgba(245,240,234,0.45)' }}}
            >{cat}</button>
          ))}
        </div>

        {/* Services grid */}
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(min(100%,300px),1fr))',gap:'1px',background:'rgba(196,18,48,0.08)' }}>
          {filtered.map((s,i)=><ServiceCard key={s.name} s={s} i={i}/>)}
        </div>

        <div style={{ textAlign:'center',marginTop:'4rem' }}>
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'#C41230',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'0.9rem 2.4rem',textDecoration:'none',transition:'all 0.35s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#9E0E26';e.currentTarget.style.transform='translateY(-3px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#C41230';e.currentTarget.style.transform='none'}}
          >
            <MessageCircle size={15}/> Prenota la tua seduta
          </a>
        </div>
      </div>
    </section>
  )
}

function ServiceCard({s,i}) {
  const [ref,visible] = useVisible(0.05)
  const [hov,setHov] = useState(false)
  return (
    <div ref={ref} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:'1.8rem 2rem',background:hov?'#1a0a0e':'#161616',opacity:visible?1:0,transform:visible?'none':'translateY(20px)',transition:`opacity 0.5s ease ${i*0.04}s,transform 0.5s ease ${i*0.04}s,background 0.3s ease`,position:'relative',overflow:'hidden',display:'flex',flexDirection:'column',gap:'0.5rem' }}>
      {/* top border reveal */}
      <div style={{ position:'absolute',top:0,left:0,right:0,height:2,overflow:'hidden' }}>
        <div style={{ position:'absolute',top:0,left:0,height:2,background:'#C41230',width:hov?'100%':'0',transition:'width 0.4s cubic-bezier(0.16,1,0.3,1)' }}/>
      </div>
      {/* header row */}
      <div style={{ display:'flex',alignItems:'baseline',justifyContent:'space-between',gap:'1rem' }}>
        <div style={{ display:'flex',alignItems:'center',gap:'0.65rem' }}>
          <span style={{ fontSize:'1.1rem',lineHeight:1 }}>{s.icon}</span>
          <h3 style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.2rem',fontWeight:500,color:'#F5F0EA',margin:0 }}>{s.name}</h3>
        </div>
        <span style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',fontWeight:600,fontStyle:'italic',color:'#C41230',whiteSpace:'nowrap',flexShrink:0 }}>{s.price}</span>
      </div>
      {/* desc */}
      <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.72rem',fontWeight:300,color:'rgba(245,240,234,0.4)',lineHeight:1.75,margin:0 }}>{s.desc}</p>
    </div>
  )
}

/* ─── GALLERY ────────────────────────────────── */
function Gallery() {
  const [lightbox, setLightbox] = useState(null)
  const [slideIdx, setSlideIdx] = useState(0)
  const [overrides, setOverrides] = useState({})

  useEffect(() => {
    getDocs(collection(db, 'gallery')).then(snap => {
      const map = {}
      snap.docs.forEach(d => { map[d.id] = d.data() })
      setOverrides(map)
    }).catch(() => {})
  }, [])

  const defaultLabels = new Set(galleryItems.map(g => g.label))
  const merged = galleryItems.map(g => {
    const ov = overrides[g.label]
    if (!ov) return g
    const fsImages = ov.images?.map(im => ({ src: im.url, badge: im.badge || '' }))
    // Se l'item ha immagini hardcoded (es. portfolio con Prima/Dopo), mantieni il thumbnail hardcoded
    const img = g.images ? g.img : (ov.url || g.img)
    return { ...g, img, sub: ov.sub || g.sub, label: ov.label || g.label, images: fsImages || g.images }
  })
  // Solo extras con adminAdded:true evitano di mostrare voci Firestore obsolete
  const extras = Object.entries(overrides)
    .filter(([id, d]) => !defaultLabels.has(id) && d.adminAdded === true)
    .map(([, d]) => {
      const fsImages = d.images?.map(im => ({ src: im.url, badge: im.badge || '' }))
      return { label: d.label, sub: d.sub, img: d.url, gradient: 'linear-gradient(160deg,#1a0800 0%,#3d1a0a 50%,#6b3316 100%)', images: fsImages }
    })
  const items = [...merged, ...extras]

  const openLightbox = (g) => { setLightbox(g); setSlideIdx(0) }
  const closeLightbox = () => setLightbox(null)

  const slides = lightbox?.images || (lightbox?.img ? [{ src: lightbox.img }] : [])
  const hasPrev = slideIdx > 0
  const hasNext = slideIdx < slides.length - 1
  const currentBadge = slides[slideIdx]?.badge

  return (
    <section id="i-miei-lavori" style={{ padding:'9rem 2rem',background:'#F5F0EA',position:'relative' }}>
      <div style={{ maxWidth:1280,margin:'0 auto' }}>
        <SectionHeader tag="Portfolio" title={<>I miei lavori<br/><span style={{ fontStyle:'italic',color:'#C41230' }}>parlano per me</span></>}/>
        <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.85rem',fontWeight:300,color:'#888',maxWidth:480,margin:'-3rem auto 5rem',textAlign:'center',lineHeight:1.8 }}>
          Ogni risultato è unico. Ogni cliente è una tela bianca su cui esprimere il meglio dell'arte del capello.
        </p>
        <div className="gallery-grid" style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'0.5rem' }}>
          {items.map((g,i)=><GalleryItem key={g.label} g={g} i={i} onOpen={()=>openLightbox(g)}/>)}
        </div>
        <div style={{ textAlign:'center',marginTop:'3rem' }}>
          <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.82rem',fontWeight:300,color:'#888',marginBottom:'1.5rem' }}>
            Vuoi un look come questi? Contattaci per prenotare la tua seduta.
          </p>
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'#C41230',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'0.9rem 2.4rem',textDecoration:'none',transition:'all 0.35s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#9E0E26';e.currentTarget.style.transform='translateY(-3px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#C41230';e.currentTarget.style.transform='none'}}
          ><MessageCircle size={15}/> Prenota adesso</a>
        </div>
      </div>

      {/* LIGHTBOX + SLIDESHOW */}
      {lightbox && (
        <div onClick={closeLightbox}
          style={{ position:'fixed',inset:0,zIndex:9999,background:'rgba(0,0,0,0.92)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'2rem',animation:'scaleIn 0.3s ease',cursor:'zoom-out' }}>
          <button onClick={closeLightbox} style={{ position:'absolute',top:'1.5rem',right:'1.5rem',background:'none',border:'none',color:'#F5F0EA',cursor:'pointer',padding:'0.5rem' }}><X size={28}/></button>

          <div style={{ position:'relative',width:'min(90vw,500px)',aspectRatio:'3/4' }} onClick={e=>e.stopPropagation()}>
            {/* image */}
            <div style={{ width:'100%',height:'100%',background:lightbox.gradient,position:'relative',overflow:'hidden',animation:'scaleIn 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
              {slides.length > 0
                ? <img key={slideIdx} src={slides[slideIdx].src} alt={lightbox.label} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',animation:'scaleIn 0.3s ease' }}/>
                : <div style={{ position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center' }}><Scissors size={48} color="rgba(245,240,234,0.15)" strokeWidth={0.8}/></div>
              }

              {/* badge "Prima" / "Dopo" */}
              {currentBadge && (
                <div style={{ position:'absolute',bottom:'1.2rem',right:'1.2rem',background:'rgba(14,14,14,0.72)',backdropFilter:'blur(6px)',border:'1px solid rgba(196,18,48,0.5)',padding:'0.35rem 0.85rem' }}>
                  <span style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',fontStyle:'italic',fontWeight:400,color:'#F5F0EA',letterSpacing:'0.04em' }}>{currentBadge}</span>
                </div>
              )}

              {/* caption */}
              <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'2rem',background:'linear-gradient(to top,rgba(0,0,0,0.8),transparent)' }}>
                <div style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.6rem',fontStyle:'italic',color:'#F5F0EA' }}>{lightbox.label}</div>
                <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.2em',textTransform:'uppercase',color:'#C41230',marginTop:'0.3rem' }}>{lightbox.sub}</div>
              </div>
            </div>

            {/* prev / next arrows */}
            {hasPrev && (
              <button onClick={()=>setSlideIdx(i=>i-1)}
                style={{ position:'absolute',left:'-3.5rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'1px solid rgba(245,240,234,0.25)',color:'#F5F0EA',width:42,height:42,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'border-color 0.2s,background 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#C41230';e.currentTarget.style.background='rgba(196,18,48,0.15)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(245,240,234,0.25)';e.currentTarget.style.background='none'}}
              >‹</button>
            )}
            {hasNext && (
              <button onClick={()=>setSlideIdx(i=>i+1)}
                style={{ position:'absolute',right:'-3.5rem',top:'50%',transform:'translateY(-50%)',background:'none',border:'1px solid rgba(245,240,234,0.25)',color:'#F5F0EA',width:42,height:42,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:'1.4rem',transition:'border-color 0.2s,background 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor='#C41230';e.currentTarget.style.background='rgba(196,18,48,0.15)'}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(245,240,234,0.25)';e.currentTarget.style.background='none'}}
              >›</button>
            )}
          </div>

          {/* dots */}
          {slides.length > 1 && (
            <div style={{ display:'flex',gap:'0.5rem',marginTop:'1.25rem' }} onClick={e=>e.stopPropagation()}>
              {slides.map((_,i)=>(
                <button key={i} onClick={()=>setSlideIdx(i)}
                  style={{ width:i===slideIdx?20:7,height:7,background:i===slideIdx?'#C41230':'rgba(245,240,234,0.25)',border:'none',cursor:'pointer',transition:'all 0.3s ease',padding:0 }}/>
              ))}
            </div>
          )}

          <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.65rem',letterSpacing:'0.15em',textTransform:'uppercase',color:'rgba(245,240,234,0.35)',marginTop:'0.75rem' }}>
            {slides.length > 1 ? 'Scorri per vedere altri scatti · tocca fuori per chiudere' : 'Tocca per chiudere'}
          </p>
        </div>
      )}
    </section>
  )
}

function GalleryItem({g,i,onOpen}) {
  const [ref,visible] = useVisible(0.05)
  const [hov,setHov] = useState(false)
  return (
    <div ref={ref}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      onClick={onOpen}
      style={{ aspectRatio:'3/4',background:g.gradient,position:'relative',overflow:'hidden',cursor:'pointer',opacity:visible?1:0,transform:visible?'scale(1)':'scale(0.93)',transition:`opacity 0.7s ease ${i*0.07}s,transform 0.7s cubic-bezier(0.16,1,0.3,1) ${i*0.07}s` }}>
      {/* real photo if available */}
      {g.img && <img src={g.img} alt={g.label} style={{ position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',display:'block' }}/>}
      {/* hover overlay */}
      <div style={{ position:'absolute',inset:0,background:'rgba(196,18,48,0.82)',opacity:hov?1:0,transition:'opacity 0.4s ease',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'0.6rem' }}>
        <div style={{ transform:hov?'scale(1) rotate(0deg)':'scale(0.5) rotate(-20deg)',transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
          <ZoomIn size={28} color="#F5F0EA" strokeWidth={1.5}/>
        </div>
        <span style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.2rem',fontStyle:'italic',color:'#F5F0EA',fontWeight:400 }}>{g.label}</span>
        <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(245,240,234,0.8)' }}>{g.sub}</span>
      </div>
      {/* always-visible caption */}
      <div style={{ position:'absolute',bottom:0,left:0,right:0,padding:'1.5rem 1rem 1rem',background:'linear-gradient(to top,rgba(0,0,0,0.75) 0%,transparent 100%)',opacity:hov?0:1,transition:'opacity 0.3s ease' }}>
        <div style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1rem',fontStyle:'italic',color:'#F5F0EA' }}>{g.label}</div>
        <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.55rem',fontWeight:600,letterSpacing:'0.2em',textTransform:'uppercase',color:'rgba(245,240,234,0.55)',marginTop:2 }}>{g.sub}</div>
      </div>
      {/* zoom hint for mobile */}
      <div style={{ position:'absolute',top:'0.75rem',right:'0.75rem',background:'rgba(0,0,0,0.45)',borderRadius:'50%',width:28,height:28,display:'flex',alignItems:'center',justifyContent:'center',opacity:0.6 }}>
        <ZoomIn size={13} color="#fff"/>
      </div>
      {!g.img && <div style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',opacity:0.06,pointerEvents:'none' }}>
        <Scissors size={80} color="#fff" strokeWidth={0.8}/>
      </div>}
    </div>
  )
}

/* ─── REVIEWS ────────────────────────────────── */
function Reviews() {
  const [active,setActive] = useState(0)
  useEffect(()=>{
    const t = setInterval(()=>setActive(a=>(a+1)%reviews.length),4500)
    return ()=>clearInterval(t)
  },[])
  return (
    <section id="recensioni" style={{ padding:'9rem 2rem',background:'#1C1C1C',overflow:'hidden' }}>
      <div style={{ maxWidth:1280,margin:'0 auto' }}>
        <SectionHeader dark tag="Recensioni Google" title={<>Quello che dicono<br/><span style={{ fontStyle:'italic',color:'#C41230' }}>le mie clienti</span></>}/>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))',gap:'1.5rem' }}>
          {reviews.map((r,i)=><ReviewCard key={r.name} r={r} i={i} active={i===active}/>)}
        </div>
        <div style={{ textAlign:'center',marginTop:'4rem' }}>
          <p style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',fontStyle:'italic',fontWeight:400,color:'rgba(245,240,234,0.35)',letterSpacing:'0.04em',marginBottom:'3rem' }}>
            "Le parole più belle vengono direttamente dalle nostre clienti."
          </p>
          {/* CTA recensione */}
          <div style={{ display:'inline-flex',flexDirection:'column',alignItems:'center',gap:'1rem',padding:'2.5rem 3rem',border:'1px solid rgba(196,18,48,0.25)',background:'rgba(196,18,48,0.04)',maxWidth:460 }}>
            <div style={{ display:'flex',gap:4 }}>
              {[...Array(5)].map((_,i)=><Star key={i} size={16} fill="#C41230" color="#C41230"/>)}
            </div>
            <p style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.3rem',fontWeight:400,color:'#F5F0EA',lineHeight:1.4,margin:0 }}>
              Sei stata da noi?<br/><span style={{ fontStyle:'italic',color:'#C41230' }}>Lascia la tua recensione.</span>
            </p>
            <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.72rem',fontWeight:300,color:'rgba(245,240,234,0.45)',lineHeight:1.7,margin:0 }}>
              La tua opinione aiuta altre clienti a sceglierci e ci spinge a fare sempre meglio.
            </p>
            <a href="https://www.google.com/maps/place/Parrucchieria+Debora+di+Carboni+Debora/@42.849746,13.5868388,17z/data=!4m6!3m5!1s0x1331f0d97c4cd84f:0x23d4495b50e31431!8m2!3d42.849746!4d13.5868388!16s%2Fg%2F119wj0y07?entry=ttu"
              target="_blank" rel="noreferrer"
              style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'#C41230',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.65rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'0.85rem 2rem',textDecoration:'none',transition:'all 0.3s ease',marginTop:'0.5rem' }}
              onMouseEnter={e=>{e.currentTarget.style.background='#9E0E26';e.currentTarget.style.transform='translateY(-2px)';e.currentTarget.style.boxShadow='0 8px 24px rgba(196,18,48,0.4)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='#C41230';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
            >
              <Star size={13} fill="#F5F0EA" color="#F5F0EA"/> Scrivi una recensione su Google
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}

function ReviewCard({r,i,active}) {
  const [ref,visible] = useVisible(0.08)
  return (
    <div ref={ref} style={{ padding:'2.25rem',background:active?'#1f080f':'#161616',borderLeft:`3px solid ${active?'#C41230':'rgba(196,18,48,0.18)'}`,opacity:visible?1:0,transform:visible?'none':'translateY(25px)',transition:`opacity 0.6s ease ${i*0.1}s,transform 0.6s ease ${i*0.1}s,background 0.6s ease,border-color 0.6s ease`,position:'relative',overflow:'hidden' }}>
      {active && <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at top left,rgba(196,18,48,0.06) 0%,transparent 70%)',pointerEvents:'none' }}/>}
      <div style={{ display:'flex',gap:3,marginBottom:'1rem' }}>
        {[...Array(r.stars)].map((_,j)=><Star key={j} size={12} fill="#C41230" color="#C41230"/>)}
      </div>
      <p style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1.1rem',fontStyle:'italic',color:'rgba(245,240,234,0.85)',lineHeight:1.75,marginBottom:'1.5rem' }}>"{r.text}"</p>
      <div style={{ display:'flex',alignItems:'center',gap:'0.75rem' }}>
        <div style={{ width:34,height:34,background:active?'#C41230':'rgba(196,18,48,0.2)',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'background 0.5s',transform:active?'scale(1.1)':'scale(1)',transition2:'transform 0.4s ease' }}>
          <span style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'1rem',fontWeight:600,color:'#F5F0EA' }}>{r.name[0]}</span>
        </div>
        <div>
          <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.75rem',fontWeight:600,color:'#F5F0EA' }}>{r.name}</div>
          <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:500,color:'#C41230',letterSpacing:'0.12em',textTransform:'uppercase',marginTop:2 }}>{r.tag}</div>
        </div>
      </div>
    </div>
  )
}

/* ─── CTA BANNER ─────────────────────────────── */
function CTABanner() {
  const [ref,visible] = useVisible(0.2)
  return (
    <section style={{ padding:'7rem 2rem',background:'#C41230',position:'relative',overflow:'hidden',textAlign:'center' }}>
      {/* concentric rings */}
      {[700,520,340].map((s,i)=>(
        <div key={s} style={{ position:'absolute',top:'50%',left:'50%',transform:'translate(-50%,-50%)',width:s,height:s,maxWidth:'90vw',maxHeight:'90vw',borderRadius:'50%',border:'1px solid rgba(245,240,234,0.08)',animation:`spinSlow ${25+i*8}s linear infinite ${i%2===0?'':'reverse'}`,pointerEvents:'none' }}/>
      ))}
      <div ref={ref} style={{ position:'relative',zIndex:1,opacity:visible?1:0,transform:visible?'none':'translateY(30px)',transition:'all 0.9s cubic-bezier(0.16,1,0.3,1)' }}>
        <h2 style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2.2rem,5vw,4rem)',fontWeight:400,color:'#F5F0EA',lineHeight:1.2,marginBottom:'1.25rem' }}>
          Pronta per il tuo<br/><span style={{ fontStyle:'italic',fontWeight:600 }}>nuovo look?</span>
        </h2>
        <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.88rem',fontWeight:300,color:'rgba(245,240,234,0.8)',lineHeight:1.85,maxWidth:460,margin:'0 auto 2.5rem' }}>
          Scrivimi su WhatsApp e insieme troviamo il giorno e il servizio giusto per te — senza fretta, senza coda.
        </p>
        <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap' }}>
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'#F5F0EA',color:'#C41230',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'0.9rem 2.5rem',textDecoration:'none',transition:'all 0.3s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#1C1C1C';e.currentTarget.style.color='#F5F0EA'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#F5F0EA';e.currentTarget.style.color='#C41230'}}
          ><MessageCircle size={15}/> Scrivimi su WhatsApp</a>
          <a href={PHONE}
            style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'transparent',color:'#F5F0EA',fontFamily:'Montserrat,sans-serif',fontWeight:600,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'0.9rem 2.5rem',textDecoration:'none',border:'1.5px solid rgba(245,240,234,0.55)',transition:'all 0.3s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.borderColor='#F5F0EA';e.currentTarget.style.background='rgba(245,240,234,0.1)'}}
            onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(245,240,234,0.55)';e.currentTarget.style.background='transparent'}}
          ><Phone size={14}/> Chiama: 0736 342914</a>
        </div>
      </div>
    </section>
  )
}

const ORARI_VERSION = 2
const DEFAULT_ORARI = "Lunedì: chiuso\nMartedì: 8:30 – 12:30 / 15:30 – 19:30\nMercoledì: 8:30 – 17:00\nGiovedì: 8:30 – 12:30 / 15:30 – 19:30\nVenerdì: 8:30 – 19:00\nSabato: 8:30 – 19:00\nDomenica: chiuso"

/* ─── CONTACT ────────────────────────────────── */
function Contact() {
  const [info, setInfo] = useState({
    indirizzo: "Via Celso Ulpiani, 15\n63100 Ascoli Piceno (AP)",
    telefono: "0736 342914",
    orari: DEFAULT_ORARI,
  })

  useEffect(() => {
    getDocs(collection(db, 'info')).then(snap => {
      const d = snap.docs.find(d => d.id === 'principale')
      if (d) {
        const data = d.data()
        setInfo(prev => ({
          ...prev,
          ...data,
          orari: (data.orariVersion >= ORARI_VERSION) ? data.orari : DEFAULT_ORARI,
        }))
      }
    }).catch(() => {})
  }, [])

  return (
    <section id="contatti" style={{ padding:'9rem 2rem',background:'#F5F0EA' }}>
      <div style={{ maxWidth:1280,margin:'0 auto' }}>
        <SectionHeader tag="Contatti" title={<>Vienimi a trovare<br/><span style={{ fontStyle:'italic',color:'#C41230' }}>ad Ascoli Piceno</span></>}/>

        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'2rem',maxWidth:900,margin:'0 auto' }}>

          {/* Info cards */}
          <InfoCard icon={MapPin} label="Indirizzo"          val={info.indirizzo}  idx={0}/>
          <InfoCard icon={Phone}  label="Telefono & WhatsApp" val={info.telefono}   idx={1}/>
          <InfoCard icon={Clock}  label="Orari"              val={info.orari}      idx={2}/>
        </div>

        {/* CTA buttons */}
        <div style={{ display:'flex',gap:'1rem',justifyContent:'center',flexWrap:'wrap',marginTop:'3.5rem' }}>
          <a href={WA_LINK} target="_blank" rel="noreferrer"
            style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'#25D366',color:'#fff',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'1rem 2.5rem',textDecoration:'none',transition:'all 0.35s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#1da851';e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 28px rgba(37,211,102,0.35)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='#25D366';e.currentTarget.style.transform='none';e.currentTarget.style.boxShadow='none'}}
          ><MessageCircle size={16}/> Scrivimi su WhatsApp</a>
          <a href={PHONE}
            style={{ display:'inline-flex',alignItems:'center',gap:'0.6rem',background:'transparent',color:'#C41230',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.68rem',letterSpacing:'0.2em',textTransform:'uppercase',padding:'1rem 2.5rem',textDecoration:'none',border:'1.5px solid #C41230',transition:'all 0.35s ease' }}
            onMouseEnter={e=>{e.currentTarget.style.background='#C41230';e.currentTarget.style.color='#F5F0EA';e.currentTarget.style.transform='translateY(-3px)'}}
            onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color='#C41230';e.currentTarget.style.transform='none'}}
          ><Phone size={15}/> Chiama: 0736 342914</a>
        </div>

        {/* Map */}
        <div style={{ width:'100%',height:320,marginTop:'4rem',overflow:'hidden',position:'relative' }}>
          <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'#C41230',zIndex:1 }}/>
          <iframe title="Mappa Parrucchieria Debora" src="https://maps.google.com/maps?q=42.849746,13.5868388&z=16&output=embed" style={{ width:'100%',height:'100%',border:0,filter:'grayscale(40%) contrast(1.1)' }} allowFullScreen loading="lazy"/>
          <a href="https://www.google.com/maps/place/Parrucchieria+Debora+di+Carboni+Debora/@42.849746,13.5868388,17z/data=!4m6!3m5!1s0x1331f0d97c4cd84f:0x23d4495b50e31431!8m2!3d42.849746!4d13.5868388!16s%2Fg%2F119wj0y07?entry=ttu" target="_blank" rel="noopener noreferrer" style={{ position:'absolute',top:0,left:0,width:'100%',height:'100%',zIndex:2 }} aria-label="Apri su Google Maps"/>
        </div>
      </div>
    </section>
  )
}

function InfoCard({icon:Icon,label,val,idx}) {
  const [ref,visible] = useVisible(0.1)
  return (
    <div ref={ref} style={{ background:'white',padding:'2.5rem 2rem',borderTop:'3px solid #C41230',boxShadow:'0 4px 24px rgba(0,0,0,0.06)',opacity:visible?1:0,transform:visible?'none':'translateY(24px)',transition:`all 0.6s ease ${idx*0.12}s` }}>
      <div style={{ width:44,height:44,background:'rgba(196,18,48,0.08)',display:'flex',alignItems:'center',justifyContent:'center',marginBottom:'1.25rem' }}>
        <Icon size={18} color="#C41230"/>
      </div>
      <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.58rem',fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:'#C41230',marginBottom:'0.6rem' }}>{label}</div>
      <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.88rem',fontWeight:300,color:'#444',lineHeight:1.8,whiteSpace:'pre-line' }}>{val}</div>
    </div>
  )
}

/* ─── FOOTER ─────────────────────────────────── */
function Footer() {
  const [orari, setOrari] = useState(DEFAULT_ORARI)
  useEffect(() => {
    getDocs(collection(db, 'info')).then(snap => {
      const d = snap.docs.find(d => d.id === 'principale')
      if (d) {
        const data = d.data()
        if (data.orariVersion >= ORARI_VERSION && data.orari) setOrari(data.orari)
      }
    }).catch(() => {})
  }, [])
  const orariRows = orari.split('\n').map(line => {
    const idx = line.indexOf(':')
    return idx > -1 ? [line.slice(0, idx).trim(), line.slice(idx + 1).trim()] : [line, '']
  })
  return (
    <footer style={{ background:'#0e0e0e',padding:'4rem 2rem 2rem',borderTop:'1px solid rgba(196,18,48,0.15)' }}>
      <div style={{ maxWidth:1280,margin:'0 auto' }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:'3rem',marginBottom:'3.5rem' }}>
          <div>
            <img src={`${BASE}symbol.svg`} alt="Parrucchieria Debora" style={{ height:72,width:'auto',marginBottom:'1.25rem',opacity:0.9 }}/>
            <p style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.75rem',fontWeight:300,color:'rgba(245,240,234,0.35)',lineHeight:1.85,marginBottom:'1.25rem' }}>
              Il tuo salone di fiducia ad Ascoli Piceno da oltre 20 anni.
            </p>
            <a href={WA_LINK} target="_blank" rel="noreferrer"
              style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'#25D366',color:'#fff',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.6rem',letterSpacing:'0.15em',textTransform:'uppercase',padding:'0.6rem 1.2rem',textDecoration:'none',transition:'all 0.3s' }}
              onMouseEnter={e=>e.currentTarget.style.background='#1da851'}
              onMouseLeave={e=>e.currentTarget.style.background='#25D366'}
            ><MessageCircle size={12}/> WhatsApp</a>
          </div>
          <div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:'#C41230',marginBottom:'1.25rem' }}>Servizi</div>
            {serviceCategories.filter(c=>c!=='Tutti').map(cat=><div key={cat} style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.75rem',fontWeight:300,color:'rgba(245,240,234,0.4)',marginBottom:'0.55rem' }}>{cat}</div>)}
          </div>
          <div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:'#C41230',marginBottom:'1.25rem' }}>Orari</div>
            {orariRows.map(([g,h])=>(
              <div key={g} style={{ display:'flex',justifyContent:'space-between',gap:'1rem',marginBottom:'0.55rem' }}>
                <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.72rem',fontWeight:300,color:'rgba(245,240,234,0.35)' }}>{g}</span>
                <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.72rem',fontWeight:400,color:'rgba(245,240,234,0.55)',whiteSpace:'nowrap' }}>{h}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.25em',textTransform:'uppercase',color:'#C41230',marginBottom:'1.25rem' }}>Dove siamo</div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.75rem',fontWeight:300,color:'rgba(245,240,234,0.4)',lineHeight:1.85,marginBottom:'0.35rem' }}>Via Celso Ulpiani, 15</div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.75rem',fontWeight:300,color:'rgba(245,240,234,0.4)',lineHeight:1.85,marginBottom:'0.35rem' }}>63100 Ascoli Piceno (AP)</div>
            <div style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.75rem',fontWeight:400,color:'rgba(245,240,234,0.6)',marginBottom:'1.25rem' }}>0736 342914</div>
            <a href="#contatti"
              style={{ display:'inline-block',background:'transparent',color:'#C41230',fontFamily:'Montserrat,sans-serif',fontWeight:700,fontSize:'0.6rem',letterSpacing:'0.18em',textTransform:'uppercase',padding:'0.6rem 1.2rem',textDecoration:'none',border:'1.5px solid rgba(196,18,48,0.4)',transition:'all 0.3s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(196,18,48,0.1)'}}
              onMouseLeave={e=>{e.currentTarget.style.background='transparent'}}
            >Prenota ora</a>
          </div>
        </div>
        <div style={{ borderTop:'1px solid rgba(255,255,255,0.05)',paddingTop:'1.75rem',display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:'1rem' }}>
          <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.62rem',color:'rgba(245,240,234,0.18)' }}>© 2025 Parrucchieria Debora di Carboni Debora — P.IVA 01779990447</span>
          <div style={{ display:'flex',gap:'2rem' }}>
            {['Privacy Policy','Cookie Policy'].map(l=>(
              <a key={l} href="#" style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.62rem',color:'rgba(245,240,234,0.18)',textDecoration:'none',transition:'color 0.3s' }}
                onMouseEnter={e=>e.currentTarget.style.color='#C41230'}
                onMouseLeave={e=>e.currentTarget.style.color='rgba(245,240,234,0.18)'}
              >{l}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

/* ─── SHARED: SECTION HEADER ─────────────────── */
function SectionHeader({ tag, title, dark = false }) {
  const [ref,visible] = useVisible(0.1)
  return (
    <div ref={ref} style={{ textAlign:'center',marginBottom:'5rem',opacity:visible?1:0,transform:visible?'none':'translateY(24px)',transition:'all 0.8s cubic-bezier(0.16,1,0.3,1)' }}>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:'0.75rem',marginBottom:'1.25rem' }}>
        <div style={{ width:36,height:1.5,background:'#C41230' }}/>
        <span style={{ fontFamily:'Montserrat,sans-serif',fontSize:'0.6rem',fontWeight:700,letterSpacing:'0.3em',textTransform:'uppercase',color:'#C41230' }}>{tag}</span>
        <div style={{ width:36,height:1.5,background:'#C41230' }}/>
      </div>
      <h2 style={{ fontFamily:'"Cormorant Garamond",serif',fontSize:'clamp(2.2rem,4.5vw,3.5rem)',fontWeight:400,color:dark?'#F5F0EA':'#1C1C1C',lineHeight:1.2 }}>{title}</h2>
    </div>
  )
}

/* ─── HOME ───────────────────────────────────── */
function Home() {
  return (
    <>
      <Navbar/>
      <Hero/>
      <Stats/>
      <About/>
      <Services/>
      <Gallery/>
      <Reviews/>
      <CTABanner/>
      <Contact/>
      <Footer/>
    </>
  )
}

/* ─── APP ────────────────────────────────────── */
export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home/>}/>
      <Route path="/admin" element={<AdminLogin/>}/>
      <Route path="/admin/dashboard" element={
        <ProtectedRoute><AdminDashboard/></ProtectedRoute>
      }/>
    </Routes>
  )
}
