import { useEffect } from 'react';
import { animate, m, useMotionValue, useReducedMotion, useTransform } from 'framer-motion';
import backdrop from '../assets/home-backdrop-hero.png';
import { Button } from './Button';
import { EASE_OUT, rise, stagger } from '../motion';
import { money } from '../loan';
import './Hero.css';

/* Hero — the LoadCash home screen for new users (Figma 8654:17081 "Home / New user") as the landing page's first screen:
   backdrop art, social proof, the glass loan amount card (lc/Loan/Loan amount card, 8501:15097).
   Left out on purpose: the phone status bar. The social proof lines are an image in Figma (img/Art/home-social-proof);
   here they are real text on lc tokens, so they read, translate and scale. Only the backdrop art stays an image. */

type Fact = { label: string; value: string };

export function Hero({ amount, facts, cta, onCta }: {
  amount: number;
  facts: Fact[];
  cta: { href: string; label: string };
  onCta?: () => void;
}) {
  return (
    <section className="lp-hero" aria-labelledby="hero-title">
      <img className="lp-hero__bg" src={backdrop} alt="" />
      <m.div className="lp-hero__main" initial="hidden" animate="show" variants={stagger(0.12, 0.05)}>
        <SocialProof lines={['Over 300,000+ users are using', '5 years trusted service']} />
        <m.div variants={rise} className="lp-amountcard lp-glass">
          <AmountPanel amount={amount} />
          <dl className="lp-amountcard__facts">
            {facts.map((f) => (
              <div key={f.label}>
                <dt>{f.label}</dt>
                <dd>{f.value}</dd>
              </div>
            ))}
          </dl>
          <Button href={cta.href} block external onClick={onCta}>
            {cta.label}
          </Button>
        </m.div>
      </m.div>
    </section>
  );
}

/** Social proof (img/Art/home-social-proof, 8510:15148): two claims joined by a dotted line. */
function SocialProof({ lines }: { lines: string[] }) {
  return (
    <m.ul variants={stagger(0.1)} className="lp-proof" id="hero-title">
      {lines.map((l) => (
        <m.li key={l} variants={rise}>
          {l}
        </m.li>
      ))}
    </m.ul>
  );
}

/** Amount (8501:15097 › Amount): "Loan Amount", the max amount counting up once on load, a divider. */
function AmountPanel({ label = 'Loan Amount', amount }: { label?: string; amount: number }) {
  const reduce = useReducedMotion();
  const mv = useMotionValue(reduce ? amount : 0);
  const text = useTransform(mv, (v) => money(Math.round(v / 100) * 100, 0));
  useEffect(() => {
    if (reduce) return void mv.set(amount);
    const run = animate(mv, amount, { duration: 1.4, delay: 0.35, ease: EASE_OUT });
    return () => run.stop();
  }, [amount, reduce, mv]);
  return (
    <div className="lp-amountcard__amount">
      <p className="lp-amountcard__label">{label}</p>
      <p className="lp-amountcard__value" aria-label={money(amount, 0)}>
        <m.span aria-hidden="true">{text}</m.span>
      </p>
      <hr className="lp-amountcard__divider" />
    </div>
  );
}
