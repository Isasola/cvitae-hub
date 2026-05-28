import { useState, useEffect, useMemo } from 'react'
import { useLocation } from 'wouter'
import { Sparkles, UserCircle, Search, TrendingUp, ArrowRight, LogOut, Mail, Briefcase, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import BentoCard from '../components/BentoCard'
import MatchScoreRing from '../components/MatchScoreRing'
import MatchingLoader from '../components/MatchingLoader'
import { auth, supabase } from '../lib/supabase'

const MATCH_BATCH_URL = 'https://rbrirxbjbmdxflzaxxzp.supabase.co/functions/v1/match-batch'
const LOADER_STEPS = [
  "Leyendo tu perfil...",
  "Cargando vacantes activas...",
  "Calculando compatibilidad...",
  "Ordenando resultados...",
]

interface MatchItem {
  id: string
  slug: string
  titulo: string
  categoria: string
  ubicacion: string
  organization: string
  application_url: string
  skillsScore: number
  seniorityScore: number
  locationScore: number
  finalScore: number
  vacancySkills: string[]
}

export default function Dashboard() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [matches, setMatches] = useState<MatchItem[]>([])
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [matchesError, setMatchesError] = useState<string | null>(null)
  const [loaderStep, setLoaderStep] = useState(0)
  const [profileSkills, setProfileSkills] = useState<string[]>([])

  useEffect(() => {
    auth.getUser().then(setUser)

    const subscription = auth.onAuthStateChange((user) => {
      setUser(user)
    })

    return () => {
      if (subscription) subscription.unsubscribe()
    }
  }, [])

  // Avanzar pasos del loader cada 2 segundos
  useEffect(() => {
    if (!loadingMatches) return
    const interval = setInterval(() => {
      setLoaderStep(prev => Math.min(prev + 1, LOADER_STEPS.length - 1))
    }, 2000)
    return () => clearInterval(interval)
  }, [loadingMatches])

  // Cargar matches cuando el usuario esté autenticado
  useEffect(() => {
    if (user) {
      loadMatches()
    } else {
      setMatches([])
      setProfileSkills([])
    }
  }, [user])

  const loadMatches = async () => {
    setLoadingMatches(true)
    setLoaderStep(0)
    setMatchesError(null)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) throw new Error('No autorizado')

      const response = await fetch(MATCH_BATCH_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error al cargar matches')
      setMatches(data.matches || [])
      setProfileSkills(data.profileSkills || [])
    } catch (err: any) {
      setMatchesError(err.message)
    } finally {
      setLoadingMatches(false)
    }
  }

  // Calcular habilidades faltantes reales desde los matches
  const missingSkills = useMemo(() => {
    if (matches.length === 0) return []
    const top5 = matches.slice(0, 5)
    const allVacancySkills: string[] = []
    top5.forEach(match => {
      match.vacancySkills.forEach(skill => {
        if (!profileSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())) {
          allVacancySkills.push(skill)
        }
      })
    })
    // Contar frecuencia
    const freq: Record<string, number> = {}
    allVacancySkills.forEach(skill => {
      freq[skill] = (freq[skill] || 0) + 1
    })
    // Ordenar por frecuencia descendente y tomar las 4 más frecuentes
    return Object.entries(freq)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 4)
      .map(([skill]) => skill)
  }, [matches, profileSkills])

  const handleSendMagicLink = async () => {
    if (!email.trim()) return
    setSending(true)
    const { error } = await auth.signInWithMagicLink(email)
    setSending(false)
    if (error) {
      alert('Error al enviar el enlace: ' + error.message)
    } else {
      setSent(true)
    }
  }

  const handleSignOut = async () => {
    await auth.signOut()
    setUser(null)
    setSent(false)
    setEmail('')
    setMatches([])
    setProfileSkills([])
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto mb-12"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              <span className="gold-gradient">CVitae</span> Intelligence Hub
            </h1>
            <p className="text-gray-400 mt-2">Tu Agente de Carrera Proactivo</p>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <span className="text-sm text-gray-400">{user.email}</span>
                <button
                  onClick={() => setLocation('/profile')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl text-[#c9a84c] hover:bg-[#c9a84c]/20 transition-all"
                >
                  <UserCircle size={18} />
                  Editar Perfil
                </button>
                <button
                  onClick={() => setLocation('/match')}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all"
                >
                  <Search size={18} />
                  Analizar Vacante
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <LogOut size={18} />
                  Salir
                </button>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@email.com"
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all w-48"
                  />
                  <button
                    onClick={handleSendMagicLink}
                    disabled={sending || !email.trim()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all disabled:opacity-50"
                  >
                    <Mail size={18} />
                    {sending ? 'Enviando...' : sent ? 'Reenviar' : 'Ingresar'}
                  </button>
                </div>
                {sent && (
                  <span className="text-xs text-green-400">
                    ✓ ¡Revisá tu correo! Te enviamos un enlace mágico.
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </motion.header>

      {/* Bento Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card: Estado del Perfil */}
        <BentoCard title="Tu Perfil Maestro" icon={<UserCircle size={20} />} className="lg:col-span-2">
          {user ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Completitud del perfil</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="w-16 h-16">
                    <MatchScoreRing score={profileSkills.length >= 5 ? 85 : profileSkills.length >= 3 ? 60 : 30} size={64} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{profileSkills.length >= 5 ? 85 : profileSkills.length >= 3 ? 60 : 30}%</p>
                    <p className="text-xs text-gray-500">{profileSkills.length} habilidades</p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setLocation('/profile')}
                className="flex items-center gap-1 text-sm text-[#c9a84c] hover:underline"
              >
                Completar perfil <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-3">Ingresá con tu email para ver tu perfil</p>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all w-48"
                />
                <button
                  onClick={handleSendMagicLink}
                  disabled={sending || !email.trim()}
                  className="flex items-center gap-2 px-4 py-2 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all disabled:opacity-50"
                >
                  <Mail size={18} />
                  {sending ? 'Enviando...' : sent ? 'Reenviar' : 'Ingresar'}
                </button>
              </div>
              {sent && (
                <p className="text-xs text-green-400 mt-3">
                  ✓ ¡Revisá tu correo! Te enviamos un enlace mágico.
                </p>
              )}
            </div>
          )}
        </BentoCard>

        {/* Card: Analizar Vacante */}
        <BentoCard title="Analizar Vacante" icon={<Search size={20} />}>
          <p className="text-gray-400 text-sm mb-4">
            ¿Encontraste una oferta fuera de CVitae? Pegá el texto y calculá tu compatibilidad al instante.
          </p>
          <button
            onClick={() => setLocation('/match')}
            className="w-full py-2 bg-[#c9a84c] text-black font-bold rounded-lg hover:bg-[#d4b85f] transition-all"
          >
            Ir al Analizador
          </button>
        </BentoCard>

        {/* Card: Oportunidades para vos (MATCHING AUTOMÁTICO) */}
        <BentoCard title="Oportunidades para vos" icon={<Briefcase size={20} />} className="lg:col-span-2">
          {!user ? (
            <p className="text-gray-500 text-center py-6">Ingresá para ver tus matches</p>
          ) : loadingMatches ? (
            <MatchingLoader
              steps={LOADER_STEPS}
              currentStep={loaderStep}
            />
          ) : matchesError ? (
            <div className="text-center py-6">
              <p className="text-red-400 text-sm mb-2">{matchesError}</p>
              <button onClick={loadMatches} className="text-[#c9a84c] text-sm hover:underline">Reintentar</button>
            </div>
          ) : matches.length === 0 ? (
            <p className="text-gray-500 text-center py-6">No se encontraron matches. Completá tu perfil con más habilidades.</p>
          ) : (
            <div className="space-y-3">
              {matches.slice(0, 5).map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => {
                    if (match.application_url) window.open(match.application_url, '_blank')
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate">{match.titulo}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <MapPin size={12} /> {match.ubicacion}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Briefcase size={12} /> {match.categoria}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${getScoreColor(match.finalScore)}`}>
                        {match.finalScore}%
                      </p>
                      <p className="text-xs text-gray-500">match</p>
                    </div>
                    <ArrowRight size={16} className="text-gray-500" />
                  </div>
                </div>
              ))}
              {matches.length > 5 && (
                <button className="w-full py-2 text-sm text-[#c9a84c] hover:underline text-center">
                  Ver todas las oportunidades ({matches.length})
                </button>
              )}
            </div>
          )}
          {user && matches.length > 0 && (
            <div className="mt-4 p-3 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 <strong>Sugerencia:</strong> Hacé clic en una oportunidad para postularte directamente.
              </p>
            </div>
          )}
        </BentoCard>

        {/* Card: Skill Gaps (AHORA CON DATOS REALES) */}
        <BentoCard title="Habilidades Faltantes" icon={<Sparkles size={20} />}>
          {!user ? (
            <p className="text-gray-500 text-center py-6">Ingresá para ver tus sugerencias</p>
          ) : matches.length === 0 && !loadingMatches ? (
            <p className="text-gray-500 text-center py-6">Cargando sugerencias...</p>
          ) : missingSkills.length > 0 ? (
            <>
              <div className="space-y-2">
                {missingSkills.map((skill) => (
                  <div key={skill} className="flex items-center justify-between p-2 bg-white/5 rounded-lg">
                    <span className="text-gray-300 text-sm">{skill}</span>
                    <span className="text-xs text-[#c9a84c]">+Curso sugerido</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-lg">
                <p className="text-xs text-gray-400">
                  💡 <strong>Sugerencia:</strong> Completar estas habilidades puede aumentar tu match score en un 15-20%.
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-center py-6">¡Excelente! Tu perfil cubre todas las habilidades demandadas.</p>
          )}
        </BentoCard>
      </div>
    </div>
  )
}
