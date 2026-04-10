import { motion, useReducedMotion } from 'framer-motion';
import { CRISIS_LINES } from '../constants/crisisLines';

export default function CrisisInterventionBanner() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className="relative overflow-hidden rounded-2xl border-2 border-red-300/90 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 px-4 py-4 text-white shadow-lg sm:px-6"
      role="alert"
      animate={
        reduceMotion
          ? {}
          : { boxShadow: ['0 0 0 0 rgba(254, 202, 202, 0.5)', '0 0 0 10px rgba(254, 202, 202, 0)', '0 0 0 0 rgba(254, 202, 202, 0)'] }
      }
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="relative z-10">
        <p className="font-bold text-lg sm:text-xl">Immediate support</p>
        <p className="mt-1 text-sm text-red-100 leading-relaxed">
          If you are in danger or thinking about hurting yourself, please reach out right now. You deserve help, and it
          is available.
        </p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-3">
          {CRISIS_LINES.map((line) => (
            <li key={line.name}>
              <a
                href={line.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl bg-white/15 px-3 py-2 text-center text-sm font-semibold backdrop-blur-sm transition hover:bg-white/25"
              >
                <span className="block text-red-100/90">{line.name}</span>
                <span className="block text-base tracking-tight">{line.number}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-red-100/90">US: 988 · Crisis Text: HOME to 741741 · Emergency: local services</p>
      </div>
    </motion.div>
  );
}
