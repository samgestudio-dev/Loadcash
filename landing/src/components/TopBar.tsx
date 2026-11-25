import { useState } from 'react';
import { m, useMotionValueEvent, useScroll } from 'framer-motion';
import logo from '../assets/logo-horizontal.png';
import { Button } from './Button';
import './TopBar.css';

/* lc/Navigation/Title bar, Type=Home, Tone=Muted (Figma 8444:12688): logo on the muted brand header.
   The phone status bar is left out (a web page has none); the service button gives way to the Download action.
   Fixed: the header fill and a soft shadow fade in once the page scrolls, so the bar separates from the content. */
export function TopBar({ cta, onCta }: { cta: { href: string; label: string }; onCta?: () => void }) {
  const { scrollY } = useScroll();
  const [solid, setSolid] = useState(false);
  useMotionValueEvent(scrollY, 'change', (v) => setSolid(v > 8));
  return (
    <header className="lp-topbar">
      <m.div className="lp-topbar__fill" initial={false} animate={{ opacity: solid ? 1 : 0 }} transition={{ duration: 0.25 }} />
      <a href="#top" className="lp-topbar__brand" aria-label="LoadCash home">
        <img src={logo} width={132} height={32} alt="LoadCash" />
      </a>
      <Button href={cta.href} variant="primary" size="md" external onClick={onCta}>
        {cta.label}
      </Button>
    </header>
  );
}
