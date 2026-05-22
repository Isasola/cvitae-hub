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

export async function matchVacancy(userProfileId: string, vacancyText: string): Promise<MatchResult> {
  const response = await fetch(EDGE_FUNCTION_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userProfileId, vacancyText }),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'Error al analizar la vacante')
  }

  return response.json()
}
