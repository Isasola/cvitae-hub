import { useState } from 'react'
import { useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { ArrowLeft, Search, Sparkles, AlertCircle, CheckCircle, TrendingUp, MapPin, Briefcase } from 'lucide-react'
import { matchVacancy } from '../lib/api'
import MatchScoreRing from '../components/MatchScoreRing'

interface MatchResult {
  skillsScore: number
  seniorityScore: number
  locationScore: number
  finalScore: number
  confidence: 'alta' | 'media' | 'baja'
  vacancySeniority: string
  profileSeniority: string
  profileSkills: string[]
  vacancySkills: string[]
  summary: string
}

export default function JobMatcher() {
  const [, setLocation] = useLocation()
  const [vacancyText, setVacancyText] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<MatchResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isValidLength = vacancyText.replace(/\s+/g, '').length >= 50

  const handleMatch = async () => {
    if (!isValidLength) {
      setError('La descripción es demasiado corta. Necesitamos al menos 50 caracteres para un análisis fiable.')
      return
    }

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await matchVacancy(
        '0579bae0-ecd0-458d-8077-2ad5d7990e09',
        vacancyText
      )
      setResult(data)
    } catch (err: any) {
      setError(err.message || 'Error al analizar la vacante')
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceColor = (confidence: string) => {
    if (confidence === 'alta') return 'bg-green-500/10 text-green-400 border-green-500/20'
    if (confidence === 'media') return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
    return 'bg-red-500/10 text-red-400 border-red-500/20'
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Volver al Dashboard
          </button>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2">
          <span className="gold-gradient">Analizar</span> Vacante
        </h1>
        <p className="text-gray-400 mb-8">
          Pegá el texto de una oferta laboral y obtené tu compatibilidad al instante.
        </p>

        {/* Input Area */}
        <div className="bento-card mb-8">
          <textarea
            value={vacancyText}
            onChange={e => setVacancyText(e.target.value)}
            placeholder="Pegá aquí la descripción de la vacante que encontraste en LinkedIn, BuscoJobs, o cualquier otro portal..."
            rows={8}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all resize-none mb-4"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {!isValidLength && vacancyText.length > 0
                ? `⚠️ Faltan ${50 - vacancyText.replace(/\s+/g, '').length} caracteres para un análisis fiable.`
                : '💡 Cuanto más texto tenga la vacante, más preciso será el análisis.'}
            </p>
            <button
              onClick={handleMatch}
              disabled={loading || !isValidLength}
              className="flex items-center gap-2 px-6 py-3 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all disabled:opacity-50"
            >
              <Search size={18} />
              {loading ? 'Analizando...' : 'Analizar Compatibilidad'}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 mb-8"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        {/* Results */}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Main Score Card */}
            <div className="bento-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Resultado del Match</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getConfidenceColor(result.confidence)}`}>
                  Confianza: {result.confidence}
                </span>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="flex-shrink-0">
                  <MatchScoreRing score={result.finalScore} size={120} />
                </div>
                <div className="flex-1 space-y-4">
                  <p className={`text-2xl font-bold ${getScoreColor(result.finalScore)}`}>
                    {result.finalScore}% de compatibilidad
                  </p>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Habilidades</p>
                      <p className={`text-lg font-bold ${getScoreColor(result.skillsScore)}`}>{result.skillsScore}%</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Seniority</p>
                      <p className={`text-lg font-bold ${getScoreColor(result.seniorityScore)}`}>{result.seniorityScore}%</p>
                    </div>
                    <div className="text-center p-3 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Ubicación</p>
                      <p className={`text-lg font-bold ${getScoreColor(result.locationScore)}`}>{result.locationScore}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bento-card">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-400" />
                  Tus Habilidades ({result.profileSkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.profileSkills.map(skill => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        result.vacancySkills.includes(skill.toLowerCase())
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-white/5 text-gray-400 border-white/10'
                      }`}
                    >
                      {skill}
                      {result.vacancySkills.includes(skill.toLowerCase()) && ' ✓'}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bento-card">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Briefcase size={18} className="text-[#c9a84c]" />
                  Vacante Requiere ({result.vacancySkills.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.vacancySkills.map(skill => (
                    <span
                      key={skill}
                      className={`px-3 py-1 rounded-full text-xs font-medium border ${
                        result.profileSkills.some(ps => ps.toLowerCase() === skill.toLowerCase())
                          ? 'bg-green-500/10 text-green-400 border-green-500/20'
                          : 'bg-red-500/10 text-red-400 border-red-500/20'
                      }`}
                    >
                      {skill}
                      {!result.profileSkills.some(ps => ps.toLowerCase() === skill.toLowerCase()) && ' ✗'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bento-card">
              <h3 className="text-white font-bold mb-2 flex items-center gap-2">
                <TrendingUp size={18} className="text-[#c9a84c]" />
                Resumen
              </h3>
              <p className="text-gray-300">{result.summary}</p>
              <div className="mt-4 p-3 bg-[#c9a84c]/5 border border-[#c9a84c]/10 rounded-lg">
                <p className="text-xs text-gray-400">
                  💡 <strong>Sugerencia:</strong> {result.skillsScore < 60
                    ? 'Considerá agregar más habilidades a tu perfil para mejorar la compatibilidad.'
                    : result.seniorityScore < 70
                    ? 'Tu nivel de seniority no coincide exactamente con la vacante, pero tus habilidades son competitivas.'
                    : '¡Buen match! Tus habilidades y experiencia se alinean bien con esta oportunidad.'}
                </p>
              </div>
            </div>

            {/* New Analysis Button */}
            <div className="text-center">
              <button
                onClick={() => {
                  setResult(null)
                  setVacancyText('')
                  setError(null)
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                ← Analizar otra vacante
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
