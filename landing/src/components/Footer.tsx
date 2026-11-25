import { m } from 'framer-motion';
import { COMPANY } from '../config';
import { rise } from '../motion';
import './Footer.css';

/* Company lines (Figma lc/Loan/Home footer, 8501:15166), on the deep closing band under the Download button,
   with a divider above. The policy links are left out (owner, 2026-11-25). */
export function Footer() {
  return (
    <m.footer variants={rise} className="lp-footer">
      <p>Company Name: {COMPANY.name}</p>
      <p>{COMPANY.sec}</p>
      <p>{COMPANY.coa}</p>
    </m.footer>
  );
}
