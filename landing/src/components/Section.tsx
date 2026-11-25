import type { ReactNode } from 'react';
import { m } from 'framer-motion';
import { rise, stagger } from '../motion';
import './Section.css';

/* A band of the page with its heading; fades up the first time it enters the screen.
   tone: muted (brand-muted, as the home screen) | default (white) | deep (brand-strong) · align: start | center */
export function Section({ id, kicker, title, body, tone = 'muted', align = 'start', children }: {
  id?: string;
  kicker?: string;
  title?: string;
  body?: string;
  tone?: 'muted' | 'default' | 'deep';
  align?: 'start' | 'center';
  children?: ReactNode;
}) {
  return (
    <m.section
      id={id}
      className={`lp-sec lp-sec--${tone} lp-sec--${align}`}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2 }}
      variants={stagger(0.1)}
    >
      {(kicker || title) && (
        <m.div variants={rise} className="lp-sec__head">
          {kicker && <p className="lp-sec__kicker">{kicker}</p>}
          {title && <h2 className="lp-sec__title">{title}</h2>}
          {body && <p className="lp-sec__body">{body}</p>}
        </m.div>
      )}
      {children}
    </m.section>
  );
}
