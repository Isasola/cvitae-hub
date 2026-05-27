import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

// URL de producción (usa variable de entorno + fallback)
const getSiteUrl = () => {
  // En producción (Netlify)
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_PUBLIC_SITE_URL || 'https://cvitaehub.netlify.app'
  }
  // En desarrollo
  return 'http://localhost:3000'
}

export const auth = {
  signInWithMagicLink: async (email: string) => {
    const siteUrl = getSiteUrl()
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${siteUrl}/profile`,   // ← Esta es la clave
        // Opcional: agregar captcha si tenés problemas de rate limit
      },
    })
    return { error }
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  getUser: async () => {
    const { data } = await supabase.auth.getUser()
    return data?.user || null
  },

  onAuthStateChange: (callback: (user: any) => void) => {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null)
    })
  },
}
