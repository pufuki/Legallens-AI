import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface SlotDigitProps {
  digit: number;
  delay?: number;
  duration?: number;
}

function SlotDigit({ digit, delay = 0, duration = 1.8 }: SlotDigitProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-20px' });

  // 2 full cycles (0..9, 0..9) + target digit for slot reel effect
  const digitsList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
  const targetIndex = 10 + digit;

  return (
    <div ref={ref} className="inline-block h-[1.1em] overflow-hidden leading-none align-baseline">
      <motion.div
        initial={{ y: '0%' }}
        animate={{ y: isInView ? `-${(targetIndex / digitsList.length) * 100}%` : '0%' }}
        transition={{
          duration,
          delay,
          ease: [0.16, 1, 0.3, 1], // easeOutExpo
        }}
        className="flex flex-col items-center"
      >
        {digitsList.map((d, i) => (
          <span key={i} className="h-[1.1em] flex items-center justify-center font-bold tabular-nums">
            {d}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

interface AnimatedCounterProps {
  value: string;
  className?: string;
}

export function AnimatedCounter({ value, className = '' }: AnimatedCounterProps) {
  const characters = value.split('');

  return (
    <span className={`inline-flex items-baseline font-bold tracking-tight ${className}`}>
      {characters.map((char, index) => {
        if (/^\d$/.test(char)) {
          return (
            <SlotDigit
              key={index}
              digit={parseInt(char, 10)}
              delay={index * 0.08}
              duration={1.8 + index * 0.12}
            />
          );
        }
        return (
          <span key={index} className="inline-block leading-none">
            {char === ' ' ? '\u00A0' : char}
          </span>
        );
      })}
    </span>
  );
}
