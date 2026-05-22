interface MatchScoreRingProps {
  score: number
  size?: number
}

export default function MatchScoreRing({ score, size = 80 }: MatchScoreRingProps) {
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#facc15' : '#ef4444'
  const circumference = 2 * Math.PI * 30
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r="30" fill="none" stroke="#1f2937" strokeWidth="6" />
        <circle
          cx="40"
          cy="40"
          r="30"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 40 40)"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-white font-bold text-xs">{score}%</span>
      </div>
    </div>
  )
}
