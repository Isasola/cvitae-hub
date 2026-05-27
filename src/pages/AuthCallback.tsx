import { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '../lib/supabase'
import { motion } from 'framer-motion'

export default function AuthCallback() {
  const [, setLocation] = useLocation()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Error en callback:', error)
          setStatus('error')
          setTimeout(() => setLocation('/'), 2000)
          return
        }

        if (data.session) {
          console.log('✅ Sesión iniciada correctamente')
          setStatus('success')
          // Redirigir al perfil después de procesar
          setTimeout(() => {
            setLocation('/profile')
          }, 800)
        } else {
          setStatus('error')
          setTimeout(() => setLocation('/'), 1500)
        }
      } catch (err) {
        console.error(err)
        setStatus('error')
        setTimeout(() => setLocation('/'), 1500)
      }
    }

    handleAuthCallback()
  }, [setLocation])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-4 border-[#c9a84c] border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Procesando tu acceso</h2>
            <p className="text-gray-400">Por favor espera un momento...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-2xl font-bold text-white mb-2">¡Acceso exitoso!</h2>
            <p className="text-gray-400">Redirigiendo a tu perfil...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-2">Algo salió mal</h2>
            <p className="text-gray-400">Redirigiendo al inicio...</p>
          </>
        )}
      </motion.div>
    </div>
  )
}
