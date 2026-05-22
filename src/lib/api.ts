const EDGE_FUNCTION_URL = 'https://rbrirxbjbmdxflzaxxzp.supabase.co/functions/v1/universal-job-matcher'

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

interface MatchError {
  error: string
  suggestion?: string
  confidence?: string
  details?: string
}

export async function matchVacancy(
  userProfileId: string,
  vacancyText: string
): Promise<MatchResult> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 12000) // 12 segundos de timeout

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userProfileId, vacancyText }),
      signal: controller.signal,
    })

    const data = await response.json()

    if (!response.ok) {
      const errorData = data as MatchError
      throw new Error(errorData.error || 'Error al analizar la vacante')
    }

    // Si hay error pero status 200 (ejemplo: sin habilidades detectadas)
    if (data.error) {
      throw new Error(data.error)
    }

    return data as MatchResult
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error('El servidor está tardando demasiado. Probá con un texto más corto o intentá más tarde.')
    }
    throw err
  } finally {
    clearTimeout(timeout)
  }
}
