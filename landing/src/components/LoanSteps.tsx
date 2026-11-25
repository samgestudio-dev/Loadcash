import { Fragment } from 'react';
import { m } from 'framer-motion';
import submitInfo from '../assets/step-submit-info.png';
import getCredit from '../assets/step-get-credit.png';
import disburse from '../assets/step-disburse.png';
import { rise, SOFT, stagger } from '../motion';
import './LoanSteps.css';

/* lc/Loan/Loan steps card (Figma 8501:15114): glass card, three lc/Feedback/Step tiles joined by brand dots,
   then "More information" with the licensed-lender chip. Copy is the Figma copy as designed. */
const STEPS = [
  { art: submitInfo, label: 'Submit Info' },
  { art: getCredit, label: 'Get Credit' },
  { art: disburse, label: 'Disburse' },
];

export function LoanSteps() {
  const pop = { hidden: { opacity: 0, scale: 0.7 }, show: { opacity: 1, scale: 1, transition: SOFT } };
  return (
    <m.div variants={rise} className="lp-steps lp-glass">
      <h3 className="lp-steps__title">Get the loan in 5 minutes!</h3>
      <m.ol className="lp-steps__row" variants={stagger(0.12)}>
        {STEPS.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && (
              <li className="lp-steps__connector" aria-hidden="true">
                <span />
                <span />
                <span />
              </li>
            )}
            <m.li className="lp-step" variants={pop}>
              <img src={s.art} width={69} height={71} alt="" />
              <span>{s.label}</span>
            </m.li>
          </Fragment>
        ))}
      </m.ol>
      <hr className="lp-steps__divider" />
      <div className="lp-steps__more">
        <p>More information</p>
        <span className="lp-chip">Reliable Licensed Lender</span>
      </div>
    </m.div>
  );
}
