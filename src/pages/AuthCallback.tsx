import { useEffect } from 'react'
import { useLocation } from 'wouter'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  const [, setLocation] = useLocation()

  useEffect(() => {
    // Procesar el token que viene en el hash
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        console.log('✅ Sesión iniciada correctamente')
        setLocation('/profile')  // Redirigir al perfil
      } else {
        console.log('❌ No se pudo obtener la sesión')
        setLocation('/')
      }
    })
  }, [setLocation])

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <p className="text-[#c9a84c] text-xl">Procesando tu acceso...</p>
        <p className="text-gray-500 mt-2">Por favor espera un momento</p>
      </div>
    </div>
  )
}
