# Agent guide

Full guide: [CLAUDE.md](CLAUDE.md) (lc token rules, layout, updating tokens from Figma). Start with the index below.

## File index: what you need → where it is

| You need | Open | Notes |
|---|---|---|
| SMS landing page (导流落地页) | `landing/` | Vite + React source; see the section below |
| Landing page sections | `landing/src/components/` | Hero, LoanCalculator, AboutUs, LoanSteps, StickyCta, Footer… (`.tsx` + `.css`) |
| Design tokens (CSS variables) | `tokens/tokens.css` (JSON: `tokens/tokens.json`) | New work: the `--lc-*` tokens only. Version: `tokens/version.json` |
| What changed in the tokens | `tokens/CHANGELOG.md` | *Developer impact* per version |
| Token naming | `tokens/code-syntax-naming.md` | Figma name → CSS name |
| Update tokens from Figma | `tokens/README.md`, `tools/sync-tokens.py` | Plugin exports go in `tokens/inbox/` |
| Figma export plugin | `tools/figma-tokens/` | `core.js` must match `tools/tokenlib.py` |
| Run the landing page locally | `tools/landing-server.command` | Port 5174 |

Figma: LoadCash Design System `J5Ho0HeSsONaT4wWdEmjLO`. Skip `landing/node_modules/` and `tokens/figma-export.json` (raw snapshot) when searching.

## Keep this index current (owner's rule, 2026-11-26)

On every change, before you commit, decide whether the index above needs an edit. It does when the change:
adds, moves, renames or removes a file or folder the index names (or one people will ask for by name: a new demo,
page, component, token file, tool); changes which version or copy is current or superseded; or makes a path or note
here wrong. Then update the index (and the Layout in CLAUDE.md) **in the same commit**. If none of that applies, leave
it alone: don't touch the index for edits inside files it already points to. Every path in the index must exist.

## SMS landing page (导流落地页 / 白名单落地页)

Looking for the **SMS landing page** — also called the whitelist landing page, 白名单落地页, 白名单卖点落地页 or 导流落地页
(the page opened from the SMS sent to selected users, leading them to Google Play)? It is here:

- **Code:** [`landing/`](landing/) — Vite + React, on the `--lc-*` tokens (`tokens/tokens.css`). Entry: `landing/src/main.tsx`.
- **Run:** `npm --prefix landing install` once, then `npm --prefix landing run dev -- --port 5174`, or double-click `tools/landing-server.command`.
- **Build:** `npm --prefix landing run build` → `landing/dist/` (not committed). The GitHub Pages URL `/Loadcash/landing/` serves
  the unbuilt source, so it does not render; deploy the built `dist/`.
- **Before launch:** `PLAY_URL` in `landing/src/config.ts` and the loan model in `landing/src/loan.ts` are placeholders.
- **Design:** LoadCash Design System file, page "25 nov 2026 - 白名单落地页", Section 1 (8663:17218). Details: "Landing page" in [CLAUDE.md](CLAUDE.md).
