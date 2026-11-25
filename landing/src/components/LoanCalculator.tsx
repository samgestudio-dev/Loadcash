import { useId } from 'react';
import { m } from 'framer-motion';
import { Button } from './Button';
import { LOAN, loanQuote, money, type Term } from '../loan';
import { rise, SPRING } from '../motion';
import './LoanCalculator.css';

/* Loan calculator mock — the reference page's calculator (amount card over a deep result card), built from LoadCash parts:
   lc/Form/Slider (8524:17047) and lc/Form/Term chip (8524:17060). Every number follows the slider at once. */
export function LoanCalculator({ amount, term, onAmount, onTerm, action, note }: {
  amount: number;
  term: Term;
  onAmount: (v: number) => void;
  onTerm: (t: Term) => void;
  action: { href: string; label: string; onClick?: () => void };
  note?: string;
}) {
  const q = loanQuote(amount, term);
  const pct = ((amount - LOAN.min) / (LOAN.max - LOAN.min)) * 100;
  const sliderId = useId();

  return (
    <m.div variants={rise} className="lp-calc">
      <div className="lp-calc__card">
        <div className="lp-calc__amount">
          <label htmlFor={sliderId} className="lp-calc__label">Loan amount</label>
          <output htmlFor={sliderId} className="lp-calc__value">{money(amount, 0)}</output>
        </div>
        <input
          id={sliderId}
          className="lp-slider"
          type="range"
          min={LOAN.min}
          max={LOAN.max}
          step={LOAN.step}
          value={amount}
          onChange={(e) => onAmount(Number(e.target.value))}
          style={{ ['--pct' as string]: `${pct}%` }}
          aria-valuetext={money(amount, 0)}
        />
        <div className="lp-calc__range" aria-hidden="true">
          <span>{money(LOAN.min, 0)}</span>
          <span>{money(LOAN.max, 0)}</span>
        </div>

        <hr className="lp-calc__divider" />

        <div className="lp-calc__kv">
          <span>Loan term</span>
          <span>{LOAN.days} days / term</span>
        </div>
        <div className="lp-terms" role="radiogroup" aria-label="Number of terms">
          {LOAN.terms.map((t) => {
            const on = t === term;
            return (
              <m.button
                key={t}
                type="button"
                role="radio"
                aria-checked={on}
                className={`lp-term${on ? ' is-on' : ''}`}
                onClick={() => onTerm(t)}
                whileTap={{ scale: 0.96 }}
                transition={SPRING}
              >
                {on && <m.span layoutId="lp-term-pill" className="lp-term__pill" transition={SPRING} />}
                <span className="lp-term__label">{t} terms</span>
              </m.button>
            );
          })}
        </div>
      </div>

      <div className="lp-calc__result" aria-live="polite">
        <dl className="lp-calc__rows">
          <div>
            <dt>Interest</dt>
            <dd>{money(q.interest)}</dd>
          </div>
          <div>
            <dt>Per installment</dt>
            <dd>{money(q.per)}</dd>
          </div>
          <div className="is-total">
            <dt>Total repayment</dt>
            <dd>{money(q.total)}</dd>
          </div>
        </dl>
        <Button href={action.href} block external onClick={action.onClick}>
          {action.label}
        </Button>
      </div>

      {note && <p className="lp-calc__note">{note}</p>}
    </m.div>
  );
}
