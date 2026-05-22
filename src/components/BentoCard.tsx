import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface BentoCardProps {
  title: string
  icon: ReactNode
  children: ReactNode
  className?: string
}

export default function BentoCard({ title, icon, children, className = '' }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`bento-card ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="gold-text">{icon}</span>
        <h3 className="text-white font-semibold">{title}</h3>
      </div>
      {children}
    </motion.div>
  )
}
