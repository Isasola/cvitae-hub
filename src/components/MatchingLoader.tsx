import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, Loader2 } from 'lucide-react'

interface MatchingLoaderProps {
  steps: string[]
  currentStep: number
  totalVacancies?: number
}

export default function MatchingLoader({ steps, currentStep, totalVacancies }: MatchingLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center max-w-[400px] mx-auto py-8">
      {/* Cubos 3D dorados (versión simplificada del loader existente) */}
      <div className="relative w-16 h-16 mb-8">
        <motion.div
          className="absolute inset-0 border-2 border-[#c9a84c] rounded-lg"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
          style={{ transformStyle: 'preserve-3d', perspective: 100 }}
        />
        <motion.div
          className="absolute inset-2 border-2 border-[#c9a84c]/60 rounded-md"
          animate={{ rotate: -360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          style={{ transformStyle: 'preserve-3d', perspective: 100 }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#c9a84c] rounded-full animate-pulse" />
        </div>
      </div>

      {/* Lista de pasos */}
      <div className="w-full space-y-3 mb-6">
        <AnimatePresence>
          {steps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3"
            >
              {index < currentStep ? (
                <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
              ) : index === currentStep ? (
                <Loader2 size={16} className="text-[#c9a84c] animate-spin flex-shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-gray-600 flex-shrink-0" />
              )}
              <span className={`text-sm ${
                index < currentStep ? 'text-gray-400' :
                index === currentStep ? 'text-[#c9a84c] font-medium' :
                'text-gray-600'
              }`}>
                {step}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Barra de progreso */}
      {totalVacancies && (
        <div className="w-full">
          <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-[#c9a84c]"
              initial={{ width: '0%' }}
              animate={{ width: `${Math.min((currentStep / steps.length) * 100, 100)}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Analizando {totalVacancies} oportunidades...
          </p>
        </div>
      )}
    </div>
  )
}
