# LoadCash

Design tokens for the [LoadCash Design System](https://www.figma.com/design/J5Ho0HeSsONaT4wWdEmjLO/LoadCash-Design-System),
versioned from Figma with a changelog and a git tag per update.

- **Use them:** `tokens/tokens.css` (CSS variables + `.lc-text-*` type classes) or `tokens/tokens.json` (W3C format).
  Pinned version: `https://cdn.jsdelivr.net/gh/samgestudio-dev/Loadcash@tokens-v<version>/tokens/tokens.css` ·
  always the latest: `https://samgestudio-dev.github.io/Loadcash/tokens/tokens.css`.
- **What changed:** [`tokens/CHANGELOG.md`](tokens/CHANGELOG.md) — every version with its *Developer impact*.
- **Update from Figma:** run the *LoadCash Tokens Export* plugin and upload the file to [`tokens/inbox`](tokens/inbox/),
  or ask Claude to “sync tokens from Figma”. Details: [`tokens/README.md`](tokens/README.md).
- **Naming:** CSS names follow [`tokens/code-syntax-naming.md`](tokens/code-syntax-naming.md).
- **lc first:** new work uses the `--lc-*` tokens (Figma collections `lc-primitives`, `lc-color`, `lc-layout`,
  `lc-typography`). The older collections and styles are kept as `legacy-*` / `legacy/` (since v2026.11.25).

## SMS landing page (白名单落地页 / 导流落地页)

[`landing/`](landing/) is the LoadCash whitelist landing page (Vite + React), built on the `--lc-*` tokens.
Run it with [`tools/landing-server.command`](tools/landing-server.command) (double-click; port 5174) or
`npm --prefix landing install && npm --prefix landing run dev`. The Figma archive of the page is in the design
system file, page “25 nov 2026 - 白名单落地页”.
