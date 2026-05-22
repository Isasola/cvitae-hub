import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts'

interface SkillGapChartProps {
  profileSkills: string[]
  vacancySkills: string[]
}

export default function SkillGapChart({ profileSkills, vacancySkills }: SkillGapChartProps) {
  const data = vacancySkills.map(skill => ({
    name: skill,
    Tienes: profileSkills.some(ps => ps.toLowerCase() === skill.toLowerCase()) ? 1 : 0,
    Falta: profileSkills.some(ps => ps.toLowerCase() === skill.toLowerCase()) ? 0 : 1,
  }))

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: 60, right: 20, top: 10, bottom: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
          <XAxis type="number" domain={[0, 1]} tick={false} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <RechartsTooltip
            contentStyle={{
              backgroundColor: '#0a0a0a',
              border: '1px solid rgba(201, 168, 76, 0.3)',
              borderRadius: '8px',
              color: '#fff',
            }}
          />
          <Bar dataKey="Tienes" stackId="a" fill="#4ade80" barSize={20} />
          <Bar dataKey="Falta" stackId="a" fill="#ef4444" barSize={20} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
