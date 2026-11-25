import type { Transition, Variants } from 'framer-motion';

/* Shared motion language: one spring for UI, one ease for reveals. Transform + opacity only. */
export const SPRING: Transition = { type: 'spring', stiffness: 420, damping: 34, mass: 0.9 };
export const SOFT: Transition = { type: 'spring', stiffness: 160, damping: 24 };
export const EASE_OUT = [0.22, 1, 0.36, 1] as const;

/** fade-up for a block entering the screen */
export const rise: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT } },
};

/** parent that staggers its children's `rise` */
export const stagger = (gap = 0.08, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: gap, delayChildren: delay } },
});

/** press feedback for buttons and links */
export const press = { whileTap: { scale: 0.97 }, transition: SPRING } as const;
