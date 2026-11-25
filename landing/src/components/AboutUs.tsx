import { m } from 'framer-motion';
import trusted from '../assets/about-trusted.png';
import trustworthy from '../assets/about-trustworthy.png';
import safe from '../assets/about-safe.png';
import payment from '../assets/about-payment.png';
import { rise, stagger } from '../motion';
import './AboutUs.css';

/* lc/Loan/About us (Figma 8501:15139): a white card of four lc/Loan/Feature rows (8501:15091).
   Copy is the Figma copy as designed. */
const ROWS = [
  { art: trusted, title: 'Trusted Service', text: 'Company Name: Copperstone Lending Inc.' },
  { art: trustworthy, title: 'Trustworthy', text: 'SEC-licensed & bank-level security' },
  { art: safe, title: 'Safe And Reliable', text: 'Global registered users' },
  { art: payment, title: 'Convenient Payment', text: 'Multiple payment options for convenience and speed' },
];

export function AboutUs() {
  return (
    <m.ul variants={stagger(0.08)} className="lp-about">
      {ROWS.map((r) => (
        <m.li key={r.title} variants={rise} className="lp-feature">
          <img src={r.art} width={59} height={59} alt="" />
          <span className="lp-feature__divider" aria-hidden="true" />
          <div className="lp-feature__text">
            <h3>{r.title}</h3>
            <p>{r.text}</p>
          </div>
        </m.li>
      ))}
    </m.ul>
  );
}
