# Agent guide

See [CLAUDE.md](CLAUDE.md) — how the token pipeline works and how to update the tokens from Figma.

## SMS landing page (导流落地页 / 白名单落地页)

Looking for the **SMS landing page** — also called the whitelist landing page, 白名单落地页, 白名单卖点落地页 or 导流落地页
(the page opened from the SMS sent to selected users, leading them to Google Play)? It is here:

- **Code:** [`landing/`](landing/) — Vite + React, on the `--lc-*` tokens (`tokens/tokens.css`). Entry: `landing/src/main.tsx`.
- **Run:** `npm --prefix landing install` once, then `npm --prefix landing run dev -- --port 5174`, or double-click `tools/landing-server.command`.
- **Build:** `npm --prefix landing run build` → `landing/dist/` (not committed). The GitHub Pages URL `/Loadcash/landing/` serves
  the unbuilt source, so it does not render; deploy the built `dist/`.
- **Before launch:** `PLAY_URL` in `landing/src/config.ts` and the loan model in `landing/src/loan.ts` are placeholders.
- **Design:** LoadCash Design System file, page "25 nov 2026 - 白名单落地页", Section 1 (8663:17218). Details: "Landing page" in [CLAUDE.md](CLAUDE.md).
