/* Loan maths for the calculator mock (same model as the MocaMoca calculator):
   - amount ₱2,000 – ₱90,000 (max: owner, 2026-11-25, over the Figma hero's ₱50,000; ₱2,000 is the smallest amount in the Flows page)
   - 4, 6 or 8 terms of 15 days each (owner, 2026-11-25), so the loan runs 60 / 90 / 120 days
   - rate (owner, 2026-11-25): 日千3 — 0.3 % of the loan amount per day, charged on the full amount for every day of
     the loan. One term costs 4.5 % of the amount. Note the hero still says "Annual interest rate 10-20%" (Figma copy).
   - principal is paid back in equal parts (amount / terms); each installment = principal part + one term's fees.
   PLACEHOLDER: confirm the real rate model and amount range with the business before launch. */
const TERMS = [4, 6, 8] as const;
export type Term = (typeof TERMS)[number];

export const LOAN = {
  min: 2000,
  max: 90000,
  step: 500,
  amount: 50000, // the calculator opens on ₱50,000 (owner, 2026-11-25)
  terms: TERMS,
  term: 6 as Term,
  days: 15, // per term
  dailyRate: 0.003, // 日千3
};

const r2 = (n: number) => Math.round(n * 100) / 100;

export function loanQuote(amount: number, term: number) {
  const daily = r2(amount * LOAN.dailyRate); // the daily fee
  const charge = r2(daily * LOAN.days); // fees per term (15 days)
  const interest = r2(charge * term); // fees over the whole loan
  return {
    interest,
    per: r2(amount / term + charge),
    total: r2(amount + interest),
  };
}

const fmt2 = new Intl.NumberFormat('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmt0 = new Intl.NumberFormat('en-PH', { maximumFractionDigits: 0 });

/** "₱1,234.50" */
export const money = (n: number, decimals: 0 | 2 = 2) => '₱' + (decimals ? fmt2 : fmt0).format(n);
