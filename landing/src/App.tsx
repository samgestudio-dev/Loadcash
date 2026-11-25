import { useRef, useState } from 'react';
import { domMax, LazyMotion, m, MotionConfig, useInView } from 'framer-motion';
import { TopBar } from './components/TopBar';
import { Hero } from './components/Hero';
import { Section } from './components/Section';
import { LoanCalculator } from './components/LoanCalculator';
import { AboutUs } from './components/AboutUs';
import { LoanSteps } from './components/LoanSteps';
import { Button, PlayMark } from './components/Button';
import { Footer } from './components/Footer';
import { StickyCta } from './components/StickyCta';
import { LOAN, type Term } from './loan';
import { PLAY_URL, track } from './config';
import { rise } from './motion';

/* LoadCash whitelist landing page — the flow of the MocaMoca whitelist landing page (hero → calculator → trust →
   how it works → closing band, sticky CTA), with the LoadCash new-user home screen as the hero (Figma 8654:17081).
   Every colour, spacing, radius and type value is an lc token (CLAUDE.md); only sizes and the decorative art are not.
   The hero and the About us / Loan steps cards keep their Figma copy; the rest is written for LoadCash. */
export default function App() {
  const [amount, setAmount] = useState(LOAN.amount);
  const [term, setTerm] = useState<Term>(LOAN.term);

  const heroRef = useRef<HTMLDivElement>(null);
  const calcRef = useRef<HTMLDivElement>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const heroIn = useInView(heroRef, { margin: '0px 0px -30% 0px' });
  const calcIn = useInView(calcRef);
  const endIn = useInView(endRef);

  const getCash = { href: PLAY_URL, label: 'Download to Get Cash Now' }; // hero card + sticky CTA (owner, 2026-11-25: download wording)

  return (
    <LazyMotion features={domMax} strict>
      <MotionConfig reducedMotion="user">
        <div className="lp-page" id="top">
          <TopBar cta={{ href: PLAY_URL, label: 'Download' }} onCta={() => track('nav')} />

          <div ref={heroRef}>
            <Hero
              amount={LOAN.max}
              facts={[
                { label: 'Repayment Term', value: '91-180 days' },
                { label: 'Annual interest rate', value: '10-20%' },
              ]}
              cta={getCash}
              onCta={() => track('hero')}
            />
          </div>

          <main>
            <Section id="calculator" kicker="Loan calculator" title="Estimate your repayment">
              <div ref={calcRef}>
                <LoanCalculator
                  amount={amount}
                  term={term}
                  onAmount={setAmount}
                  onTerm={setTerm}
                  action={{ href: PLAY_URL, label: 'Apply in the app', onClick: () => track('calculator') }}
                  note="These are examples only. Approval and your final loan details depend on our review."
                />
              </div>
            </Section>

            <Section id="about" kicker="Why LoadCash" title="About Us">
              <AboutUs />
            </Section>

            <Section id="how" kicker="How it works">
              <LoanSteps />
            </Section>

            <Section
              tone="deep"
              align="center"
              title="Your credit limit is waiting"
              body="Log in to LoadCash to see how much you can borrow, then decide if it fits your plans."
            >
              <m.div variants={rise} ref={endRef}>
                <Button href={PLAY_URL} block icon={<PlayMark />} onClick={() => track('end')}>
                  Download LoadCash
                </Button>
              </m.div>
              <Footer />
            </Section>
          </main>

          <StickyCta show={!heroIn && !calcIn && !endIn}>
            <Button href={getCash.href} block onClick={() => track('sticky')}>
              {getCash.label}
            </Button>
          </StickyCta>
        </div>
      </MotionConfig>
    </LazyMotion>
  );
}
