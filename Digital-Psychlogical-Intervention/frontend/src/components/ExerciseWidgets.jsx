import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronDown, Wind, Leaf } from 'lucide-react';

const PHASES = [
  { name: 'inhale', label: 'Breathe in', duration: 4, next: 'hold' },
  { name: 'hold', label: 'Hold', duration: 7, next: 'exhale' },
  { name: 'exhale', label: 'Breathe out', duration: 8, next: 'inhale' },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const fn = () => setReduced(mq.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, []);
  return reduced;
}

function panelMotion(reduceMotion) {
  if (reduceMotion) {
    return {
      initial: { opacity: 1, y: 0, scale: 1 },
      animate: { opacity: 1, y: 0, scale: 1 },
      exit: { opacity: 1, y: 0, scale: 1 },
    };
  }
  return {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 6, scale: 0.98 },
  };
}

/**
 * @param {object} props
 * @param {boolean} [props.compact]
 * @param {boolean} [props.collapsible] — collapsed header; expand for full exercise (chat + Resource Hub)
 * @param {boolean} [props.defaultExpanded]
 */
export function BreathingExercise({ compact = false, collapsible = false, defaultExpanded = !collapsible }) {
  const [phase, setPhase] = useState('idle');
  const [count, setCount] = useState(0);
  const [cycles, setCycles] = useState(0);
  const [open, setOpen] = useState(defaultExpanded);
  const intervalRef = useRef(null);
  const reducedMotion = usePrefersReducedMotion();
  const framerReduced = useReducedMotion();
  const cur = PHASES.find((p) => p.name === phase);

  const outerSize = compact ? 64 : 80;
  const innerSize = compact ? 56 : 64;

  useEffect(() => {
    if (phase === 'idle') return;
    const phaseCfg = PHASES.find((p) => p.name === phase);
    if (!phaseCfg) return;
    let rem = phaseCfg.duration;
    setCount(rem);
    intervalRef.current = setInterval(() => {
      rem -= 1;
      setCount(rem);
      if (rem <= 0) {
        clearInterval(intervalRef.current);
        if (phaseCfg.next === 'inhale') setCycles((c) => c + 1);
        setPhase(phaseCfg.next);
      }
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [phase]);

  const stop = () => {
    clearInterval(intervalRef.current);
    setPhase('idle');
    setCycles(0);
    setCount(0);
  };

  const inhaleScale = 1.22;
  const exhaleScale = 0.88;
  const holdScale = 1.22;

  const circleStyle = {
    width: innerSize,
    height: innerSize,
    transform:
      reducedMotion && phase !== 'idle'
        ? 'scale(1)'
        : phase === 'exhale'
          ? `scale(${exhaleScale})`
          : phase !== 'idle'
            ? `scale(${phase === 'hold' ? holdScale : inhaleScale})`
            : 'scale(1)',
    transitionTimingFunction:
      phase === 'inhale' ? 'ease-in' : phase === 'exhale' ? 'ease-out' : 'ease-in-out',
    transitionDuration:
      phase === 'inhale' ? '4s' : phase === 'exhale' ? '8s' : phase === 'hold' ? '0.35s' : '0.3s',
    transitionProperty: 'transform',
  };

  const inner = (
    <div
      className={`relative flex-shrink-0 flex items-center justify-center ${!compact ? 'mb-0' : ''}`}
      style={{ width: outerSize, height: outerSize }}
    >
      <div
        className={`absolute inset-0 rounded-full border-4 border-indigo-400/25 ${
          phase !== 'idle' && !reducedMotion ? 'animate-ping' : ''
        }`}
      />
      <div
        className="rounded-full border-4 border-indigo-500 bg-indigo-50 flex items-center justify-center shadow-inner z-10 motion-reduce:!transition-none"
        style={circleStyle}
      >
        {phase !== 'idle' && (
          <span className={`font-bold text-indigo-700 ${compact ? 'text-base' : 'text-xl'}`}>{count}</span>
        )}
      </div>
    </div>
  );

  const controls = (
    <div className={`flex flex-col ${compact ? 'gap-1.5' : 'gap-2'} min-w-0 flex-1`}>
      {!collapsible && (
        <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-xl'}`}>4-7-8 Breathing</h3>
      )}
      <p className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
        {phase === 'idle' ? (
          'Calm your nervous system — start when ready.'
        ) : (
          <span className="font-medium text-indigo-700">
            {cur?.label} — {count}s{cycles > 0 && ` · ${cycles} cycle${cycles > 1 ? 's' : ''}`}
          </span>
        )}
      </p>
      <div className="flex items-center gap-2 flex-wrap">
        {phase === 'idle' ? (
          <button
            type="button"
            onClick={() => setPhase('inhale')}
            className={`rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 ${
              compact ? 'px-3 py-1.5 text-xs' : 'px-6 py-2 text-sm'
            }`}
          >
            Start
          </button>
        ) : (
          <button
            type="button"
            onClick={stop}
            className={`rounded-xl border border-gray-300 bg-white/70 text-gray-700 font-medium hover:bg-white ${
              compact ? 'px-3 py-1.5 text-xs' : 'px-6 py-2 text-sm'
            }`}
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );

  const body = (
    <div
      className={`flex ${compact ? 'flex-row items-center gap-3' : 'items-center gap-6'} ${
        compact ? 'p-2.5' : 'p-6'
      }`}
    >
      {inner}
      {controls}
    </div>
  );

  const shellClass = compact
    ? 'rounded-xl border border-indigo-100/80 bg-white/50 shadow-sm'
    : 'rounded-2xl border border-white/40 bg-white/40 backdrop-blur-lg shadow-xl mb-8';

  if (collapsible) {
    const hub = !compact;
    const pm = panelMotion(!!framerReduced);
    return (
      <div
        className={
          hub
            ? 'w-full rounded-2xl border border-indigo-100/90 bg-gradient-to-r from-white/95 to-indigo-50/45 shadow-md overflow-hidden'
            : 'rounded-xl border border-indigo-100/90 bg-gradient-to-r from-white/90 to-indigo-50/40 shadow-sm overflow-hidden max-w-sm'
        }
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-3 text-left hover:bg-white/55 transition-colors ${
            hub ? 'px-4 py-3.5' : 'px-3 py-2'
          }`}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`flex shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 ${
                hub ? 'h-11 w-11' : 'h-8 w-8 rounded-lg'
              }`}
            >
              <Wind className={hub ? 'h-5 w-5' : 'h-4 w-4'} />
            </span>
            <span>
              <span className={`block text-gray-900 ${hub ? 'text-base font-bold' : 'text-sm font-semibold'}`}>
                4-7-8 Breathing
              </span>
              <span className={`block text-gray-500 ${hub ? 'text-sm' : 'text-[11px]'}`}>
                Calming rhythm · {open ? 'Click to hide' : 'Click to open'}
              </span>
            </span>
          </span>
          <ChevronDown
            className={`shrink-0 text-indigo-500 transition-transform ${hub ? 'h-6 w-6' : 'h-5 w-5'} ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="breathing-panel"
              initial={pm.initial}
              animate={pm.animate}
              exit={pm.exit}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
              className="border-t border-indigo-100/60"
            >
              <div
                className={
                  hub
                    ? 'bg-white/45 backdrop-blur-md'
                    : shellClass.replace('mb-8', '')
                }
              >
                {body}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <div className={shellClass}>{body}</div>;
}

const GROUNDING_STEPS = [
  { key: 'see', count: 5, label: 'things you can see', placeholder: 'e.g. a plant, the window…' },
  { key: 'touch', count: 4, label: 'things you can touch', placeholder: 'e.g. fabric, the chair…' },
  { key: 'hear', count: 3, label: 'things you can hear', placeholder: 'e.g. traffic, a fan…' },
  { key: 'smell', count: 2, label: 'things you can smell', placeholder: 'optional…' },
  { key: 'taste', count: 1, label: 'thing you can taste', placeholder: 'optional…' },
];

export function GroundingExercise({ compact = false, collapsible = false, defaultExpanded = !collapsible }) {
  const [items, setItems] = useState(() =>
    Object.fromEntries(GROUNDING_STEPS.map((s) => [s.key, Array(s.count).fill('')]))
  );
  const [done, setDone] = useState(false);
  const [open, setOpen] = useState(defaultExpanded);
  const reducedMotion = usePrefersReducedMotion();
  const framerReduced = useReducedMotion();

  const totalSlots = GROUNDING_STEPS.reduce((acc, s) => acc + s.count, 0);
  const filled = GROUNDING_STEPS.reduce(
    (acc, s) => acc + items[s.key].filter((t) => t.trim()).length,
    0
  );
  const progress = totalSlots ? filled / totalSlots : 0;

  const setCell = (key, idx, val) => {
    setItems((prev) => {
      const row = [...prev[key]];
      row[idx] = val;
      return { ...prev, [key]: row };
    });
  };

  useEffect(() => {
    setDone(filled === totalSlots && totalSlots > 0);
  }, [filled, totalSlots]);

  const form = (
    <>
      <div
        className={`${
          collapsible
            ? 'flex flex-row flex-wrap items-center justify-between gap-3'
            : 'flex flex-col sm:flex-row sm:items-center sm:justify-between'
        } gap-2 ${compact ? 'mb-2' : 'mb-4'}`}
      >
        {!collapsible && (
          <h3 className={`font-bold text-gray-900 ${compact ? 'text-sm' : 'text-xl'}`}>5-4-3-2-1 Grounding</h3>
        )}
        {collapsible && (
          <span className={`font-medium text-gray-600 shrink-0 ${compact ? 'text-xs' : 'text-sm'}`}>Your progress</span>
        )}
        <div
          className={`h-1.5 rounded-full bg-gray-200 overflow-hidden ${
            compact ? 'max-w-full' : collapsible ? 'flex-1 min-w-[120px] max-w-full' : 'sm:w-48'
          }`}
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-400 via-indigo-500 to-violet-500 motion-reduce:transition-none transition-all duration-500"
            style={{ width: `${Math.round(progress * 100)}%` }}
          />
        </div>
      </div>

      <div className={compact ? 'space-y-2 max-h-[min(240px,50vh)] overflow-y-auto pr-1' : 'space-y-4'}>
        {GROUNDING_STEPS.map((step) => (
          <div key={step.key}>
            <p className="text-[10px] font-bold text-indigo-700 uppercase tracking-wide mb-1">
              {step.count} {step.label}
            </p>
            <div className={`grid gap-1.5 ${compact ? 'grid-cols-1' : 'sm:grid-cols-2 gap-2'}`}>
              {items[step.key].map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  value={val}
                  onChange={(e) => setCell(step.key, idx, e.target.value)}
                  placeholder={step.placeholder}
                  className={`w-full rounded-lg border border-gray-200 bg-white/80 text-gray-800 placeholder:text-gray-400 focus:ring-2 focus:ring-indigo-400 focus:border-transparent ${
                    compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {done && (
        <div
          className={`mt-3 text-center rounded-lg bg-gradient-to-r from-teal-100 to-indigo-100 border border-indigo-200/60 px-3 py-2 ${
            reducedMotion ? '' : 'animate-pulse'
          }`}
        >
          <p className={`font-semibold text-indigo-900 ${compact ? 'text-xs' : ''}`}>You did it — nice grounding work.</p>
          {!compact && (
            <p className="text-sm text-indigo-700 mt-1">Take a slow breath and come back when you are ready.</p>
          )}
        </div>
      )}
    </>
  );

  const shellClass = compact
    ? 'rounded-xl border border-teal-100/80 bg-white/60 p-2.5'
    : 'rounded-2xl border border-white/40 bg-white/40 backdrop-blur-lg shadow-xl overflow-hidden p-6';

  if (collapsible) {
    const hub = !compact;
    const pm = panelMotion(!!framerReduced);
    return (
      <div
        className={
          hub
            ? 'w-full rounded-2xl border border-teal-100/90 bg-gradient-to-r from-white/95 to-teal-50/35 shadow-md overflow-hidden'
            : 'rounded-xl border border-teal-100/90 bg-gradient-to-r from-white/90 to-teal-50/30 shadow-sm overflow-hidden max-w-sm'
        }
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className={`w-full flex items-center justify-between gap-3 text-left hover:bg-white/55 transition-colors ${
            hub ? 'px-4 py-3.5' : 'px-3 py-2'
          }`}
        >
          <span className="flex items-center gap-3 min-w-0">
            <span
              className={`flex shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-700 ${
                hub ? 'h-11 w-11' : 'h-8 w-8 rounded-lg'
              }`}
            >
              <Leaf className={hub ? 'h-5 w-5' : 'h-4 w-4'} />
            </span>
            <span>
              <span className={`block text-gray-900 ${hub ? 'text-base font-bold' : 'text-sm font-semibold'}`}>
                5-4-3-2-1 Grounding
              </span>
              <span className={`block text-gray-500 ${hub ? 'text-sm' : 'text-[11px]'}`}>
                Notice senses · {open ? 'Click to hide' : 'Click to open'}
              </span>
            </span>
          </span>
          <ChevronDown
            className={`shrink-0 text-teal-600 transition-transform ${hub ? 'h-6 w-6' : 'h-5 w-5'} ${
              open ? 'rotate-180' : ''
            }`}
          />
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="grounding-panel"
              initial={pm.initial}
              animate={pm.animate}
              exit={pm.exit}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="border-t border-teal-100/60"
            >
              <div className={hub ? 'bg-white/45 backdrop-blur-md p-6' : shellClass}>{form}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return <div className={shellClass}>{form}</div>;
}
