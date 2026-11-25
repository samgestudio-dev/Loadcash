import type { ReactNode } from 'react';
import { AnimatePresence, m } from 'framer-motion';
import { SPRING } from '../motion';
import './StickyCta.css';

/* Holds the main action at the bottom of the screen while none of the page's own buttons is in view. Slides on the UI spring. */
export function StickyCta({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <AnimatePresence initial={false}>
      {show && (
        <m.div
          key="sticky"
          className="lp-sticky"
          initial={{ y: '110%' }}
          animate={{ y: 0 }}
          exit={{ y: '110%' }}
          transition={SPRING}
        >
          {children}
        </m.div>
      )}
    </AnimatePresence>
  );
}
