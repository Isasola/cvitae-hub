import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Sparkles, UserCircle, Search, TrendingUp, ArrowRight, LogOut, Mail } from 'lucide-react'
import { motion } from 'framer-motion'
import BentoCard from '../components/BentoCard'
import MatchScoreRing from '../components/MatchScoreRing'
import { auth } from '../lib/supabase'

export default function Dashboard() {
  const [, setLocation] = useLocation()
  const [user, setUser] = useState<any>(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  useEffect(() => {
    auth.getUser().then(setUser)

    const subscription = auth.onAuthStateChange((user) => {
      setUser(user)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

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
  }

  const recentMatches = [
    { id: 1, title: 'Desarrollador Full Stack', score: 77, date: 'Hoy' },
    { id: 2, title: 'Frontend React', score: 85, date: 'Ayer' },
    { id: 3, title: 'Backend Node.js', score: 62, date: 'Hace 2 días' },
  ]

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
                  Nueva Búsqueda
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
                    <MatchScoreRing score={75} size={64} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">75%</p>
                    <p className="text-xs text-gray-500">Completado</p>
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
          {user && (
            <div className="mt-4 p-3 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 <strong>Sugerencia:</strong> Agregá tus habilidades de liderazgo y comunicación para mejorar tu compatibilidad con puestos senior.
              </p>
            </div>
          )}
        </BentoCard>

        {/* Card: Último Match */}
        <BentoCard title="Último Match" icon={<TrendingUp size={20} />}>
          {user ? (
            <>
              <div className="text-center py-4">
                <MatchScoreRing score={77} />
                <p className="text-white font-bold mt-3">Desarrollador Full Stack</p>
                <p className="text-gray-500 text-sm mt-1">Asunción, Paraguay</p>
              </div>
              <button
                onClick={() => setLocation('/match')}
                className="w-full mt-3 py-2 bg-[#c9a84c]/10 text-[#c9a84c] rounded-lg text-sm hover:bg-[#c9a84c]/20 transition-all"
              >
                Ver análisis completo
              </button>
            </>
          ) : (
            <p className="text-gray-500 text-center py-6">Ingresá para ver tus matches</p>
          )}
        </BentoCard>

        {/* Card: Historial de Matches */}
        <BentoCard title="Historial de Matches" icon={<Sparkles size={20} />} className="lg:col-span-2">
          {user ? (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div
                  key={match.id}
                  className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer"
                  onClick={() => setLocation('/match')}
                >
                  <div>
                    <p className="text-white font-medium">{match.title}</p>
                    <p className="text-xs text-gray-500">{match.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold ${
                      match.score >= 80 ? 'text-green-400' : match.score >= 60 ? 'text-yellow-400' : 'text-red-400'
                    }`}>
                      {match.score}%
                    </span>
                    <ArrowRight size={14} className="text-gray-500" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-6">Ingresá para ver tu historial</p>
          )}
          {user && (
            <div className="mt-4 p-3 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-lg">
              <p className="text-xs text-gray-400">
                💡 <strong>Sugerencia:</strong> Revisá los matches anteriores para identificar patrones en las vacantes que mejor se adaptan a tu perfil.
              </p>
            </div>
          )}
        </BentoCard>

        {/* Card: Skill Gaps */}
        <BentoCard title="Habilidades Faltantes" icon={<Sparkles size={20} />}>
          {user ? (
            <>
              <div className="space-y-2">
                {['Docker', 'Kubernetes', 'Liderazgo', 'Inglés'].map((skill) => (
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
            <p className="text-gray-500 text-center py-6">Ingresá para ver tus sugerencias</p>
          )}
        </BentoCard>
      </div>
    </div>
  )
}
