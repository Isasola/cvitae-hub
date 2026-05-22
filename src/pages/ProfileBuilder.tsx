import { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, Plus, X, CheckCircle } from 'lucide-react'
import { supabase, auth } from '../lib/supabase'

const STEP_TITLES = ['Datos Básicos', 'Experiencia', 'Habilidades', 'Revisión']
const SENIORITY_OPTIONS = ['junior', 'semi-senior', 'senior']

export default function ProfileBuilder() {
  const [, setLocation] = useLocation()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [existingProfileId, setExistingProfileId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    full_name: '',
    professional_title: '',
    location: '',
    seniority: 'junior',
    summary: '',
    habilidades: [] as string[],
  })

  const [newSkill, setNewSkill] = useState('')

  // Cargar usuario autenticado y su perfil existente (si tiene)
  useEffect(() => {
    auth.getUser().then(setUser)
  }, [])

  useEffect(() => {
    if (user) {
      // Buscar perfil existente del usuario
      supabase
        .from('user_master_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setExistingProfileId(data.id)
            setFormData({
              full_name: data.full_name || '',
              professional_title: data.professional_title || '',
              location: data.profile_data?.location || '',
              seniority: data.profile_data?.seniority || 'junior',
              summary: data.summary || '',
              habilidades: data.profile_data?.habilidades || [],
            })
          }
        })
    }
  }, [user])

  const addSkill = () => {
    if (newSkill.trim() && !formData.habilidades.includes(newSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        habilidades: [...prev.habilidades, newSkill.trim()],
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      habilidades: prev.habilidades.filter(s => s !== skill),
    }))
  }

  const handleSave = async () => {
    if (!user) {
      alert('Necesitás iniciar sesión para guardar tu perfil.')
      return
    }

    if (!formData.full_name.trim()) {
      alert('Por favor, ingresá tu nombre completo antes de guardar.')
      return
    }

    if (formData.habilidades.length === 0) {
      alert('Agregá al menos una habilidad para completar tu perfil.')
      return
    }

    if (formData.habilidades.length < 3) {
      const confirm = window.confirm(
        'Tenés menos de 3 habilidades cargadas. Un perfil con más habilidades obtiene matches más precisos. ¿Querés guardar igual?'
      )
      if (!confirm) return
    }

    setSaving(true)
    try {
      const profilePayload = {
        user_id: user.id,
        full_name: formData.full_name,
        professional_title: formData.professional_title,
        summary: formData.summary,
        profile_data: {
          habilidades: formData.habilidades,
          seniority: formData.seniority,
          location: formData.location,
        },
      }

      let error
      if (existingProfileId) {
        // Actualizar perfil existente
        const { error: updateError } = await supabase
          .from('user_master_profiles')
          .update(profilePayload)
          .eq('id', existingProfileId)
        error = updateError
      } else {
        // Crear nuevo perfil
        const { error: insertError } = await supabase
          .from('user_master_profiles')
          .insert(profilePayload)
        error = insertError
      }

      if (error) throw error

      // Guardar respaldo local
      localStorage.setItem(
        'cvitae_profile_backup',
        JSON.stringify({
          ...formData,
          savedAt: new Date().toISOString(),
        })
      )

      setSaved(true)
      setTimeout(() => {
        setLocation('/')
      }, 2000)
    } catch (err) {
      console.error('Error al guardar:', err)
      alert('Error al guardar el perfil. Tus datos se guardaron localmente como respaldo. Reintentá más tarde.')
    } finally {
      setSaving(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-400 mb-4">Necesitás iniciar sesión para acceder al perfil.</p>
          <button
            onClick={() => setLocation('/')}
            className="px-6 py-3 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all"
          >
            Volver al Dashboard
          </button>
        </div>
      </div>
    )
  }

  const totalSteps = STEP_TITLES.length
  const progress = ((step + 1) / totalSteps) * 100

  return (
    <div className="min-h-screen bg-black p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setLocation('/')}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            Volver
          </button>
          <span className="text-sm text-gray-500">Paso {step + 1} de {totalSteps}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-8">
          <motion.div
            className="h-full bg-[#c9a84c] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">{STEP_TITLES[step]}</h1>
        <p className="text-gray-400 text-sm mb-8">
          {step === 0 && 'Contanos quién sos y a qué te dedicás.'}
          {step === 1 && 'Describí tu experiencia profesional en pocas palabras.'}
          {step === 2 && 'Agregá tus habilidades técnicas y blandas.'}
          {step === 3 && 'Revisá que todo esté correcto antes de guardar.'}
        </p>

        {/* Step 0: Datos Básicos */}
        {step === 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre completo</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={e => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Ej: Julio Pérez"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Título profesional</label>
              <input
                type="text"
                value={formData.professional_title}
                onChange={e => setFormData(prev => ({ ...prev, professional_title: e.target.value }))}
                placeholder="Ej: Desarrollador Full Stack"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ubicación</label>
              <input
                type="text"
                value={formData.location}
                onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ej: Asunción, Paraguay"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Seniority</label>
              <select
                value={formData.seniority}
                onChange={e => setFormData(prev => ({ ...prev, seniority: e.target.value }))}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#c9a84c]/50 transition-all"
              >
                {SENIORITY_OPTIONS.map(opt => (
                  <option key={opt} value={opt} className="bg-black">
                    {opt === 'junior' ? 'Junior (0-2 años)' : opt === 'semi-senior' ? 'Semi-Senior (2-5 años)' : 'Senior (5+ años)'}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Step 1: Experiencia */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <label className="block text-sm text-gray-400 mb-1">Resumen profesional</label>
            <textarea
              value={formData.summary}
              onChange={e => setFormData(prev => ({ ...prev, summary: e.target.value }))}
              placeholder="Contanos brevemente tu experiencia, logros y qué tipo de oportunidades buscás..."
              rows={6}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all resize-none"
            />
            <p className="text-xs text-gray-500 mt-2">
              💡 <strong>Sugerencia:</strong> Incluí palabras clave de tu industria (ej: "React", "ventas B2B", "gestión de proyectos"). Esto mejorará tu match score.
            </p>
          </motion.div>
        )}

        {/* Step 2: Habilidades */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSkill()}
                placeholder="Ej: React, Ventas, Excel..."
                className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c9a84c]/50 transition-all"
              />
              <button
                onClick={addSkill}
                className="px-4 py-3 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all"
              >
                <Plus size={20} />
              </button>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {formData.habilidades.map(skill => (
                <span
                  key={skill}
                  className="flex items-center gap-1 px-3 py-1 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full text-[#c9a84c] text-sm"
                >
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-400 transition-colors">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>

            {formData.habilidades.length === 0 && (
              <p className="text-xs text-gray-500 mt-2">
                💡 <strong>Sugerencia:</strong> Agregá al menos 4-5 habilidades para obtener un match score más preciso. Incluí tanto habilidades técnicas como blandas.
              </p>
            )}

            {formData.habilidades.length > 0 && formData.habilidades.length < 4 && (
              <p className="text-xs text-yellow-400 mt-2">
                ⚠️ <strong>Recomendación:</strong> Con más habilidades, el match score será mucho más preciso. Apuntá a 5 o más.
              </p>
            )}

            {formData.habilidades.length >= 5 && (
              <p className="text-xs text-green-400 mt-2">
                ✅ <strong>¡Perfecto!</strong> Tenés suficientes habilidades para un análisis preciso.
              </p>
            )}
          </motion.div>
        )}

        {/* Step 3: Revisión */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            <div className="bento-card">
              <h3 className="text-white font-bold mb-3">Datos del Perfil</h3>
              <div className="space-y-2 text-sm">
                <p><span className="text-gray-500">Nombre:</span> <span className="text-white">{formData.full_name || '—'}</span></p>
                <p><span className="text-gray-500">Título:</span> <span className="text-white">{formData.professional_title || '—'}</span></p>
                <p><span className="text-gray-500">Ubicación:</span> <span className="text-white">{formData.location || '—'}</span></p>
                <p><span className="text-gray-500">Seniority:</span> <span className="text-white">{formData.seniority}</span></p>
                <p><span className="text-gray-500">Resumen:</span> <span className="text-white">{formData.summary || '—'}</span></p>
              </div>
            </div>

            <div className="bento-card">
              <h3 className="text-white font-bold mb-3">Habilidades ({formData.habilidades.length})</h3>
              <div className="flex flex-wrap gap-2">
                {formData.habilidades.map(skill => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-full text-[#c9a84c] text-sm"
                  >
                    {skill}
                  </span>
                ))}
                {formData.habilidades.length === 0 && (
                  <p className="text-gray-500">No agregaste habilidades aún.</p>
                )}
              </div>
            </div>

            {saved && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-2 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400"
              >
                <CheckCircle size={18} />
                ¡Perfil guardado correctamente! Redirigiendo al Dashboard...
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          {step > 0 ? (
            <button
              onClick={() => setStep(prev => prev - 1)}
              className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
            >
              Anterior
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps - 1 ? (
            <button
              onClick={() => setStep(prev => prev + 1)}
              className="px-6 py-3 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all"
            >
              Siguiente
            </button>
          ) : (
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-[#c9a84c] text-black font-bold rounded-xl hover:bg-[#d4b85f] transition-all disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? 'Guardando...' : 'Guardar Perfil'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  )
}
