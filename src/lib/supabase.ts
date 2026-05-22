import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Funciones de autenticación con Magic Link
export const auth = {
  /** Envía un magic link al email del usuario para iniciar sesión sin contraseña */
  signInWithMagicLink: async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/profile',
      },
    })
    return { error }
  },

  /** Cierra la sesión del usuario */
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  /** Obtiene el usuario actual (si hay sesión activa) */
  getUser: async () => {
    const { data } = await supabase.auth.getUser()
    return data?.user || null
  },

  /** Escucha cambios en el estado de autenticación */
  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  },
}
