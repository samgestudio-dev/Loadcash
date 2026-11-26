# LoadCash — agent guide

Versioned design tokens of the LoadCash Design System (Figma file `J5Ho0HeSsONaT4wWdEmjLO`), plus the whitelist
landing page built on them. GitHub Pages serves `main` / root as-is (`.nojekyll`), so the latest tokens are at
https://samgestudio-dev.github.io/Loadcash/tokens/tokens.css. The owner is a designer; reply in plain language.

## Design rules: use the lc tokens by default

Every LoadCash project uses the `lc` tokens. Everything else in Figma is **legacy**: the `legacy-primitive` and
`legacy-semantic` collections and every style under `legacy/` (renamed from `Primitive`, `Semantic` and the
un-prefixed styles on 2026-11-25). Don't use legacy tokens or styles in new work, and don't hardcode values.

- Figma collections: `lc-primitives`, `lc-color` (light / dark), `lc-layout`, `lc-typography`. Bind to `lc/...` variables.
- Code: `tokens/tokens.css` — the lc variables are the `--lc-*` ones (`lc/color/text/primary` → `--lc-color-text-primary`).
  Legacy variables keep their old names (`--color-text-primary`); legacy styles are `--legacy-*` and `.lc-text-legacy-*`.
- In components, prefer **semantic** lc tokens: `--lc-color-bg-*`, `text-*`, `icon-*`, `border-*`, `action-*`,
  `feedback-*`, `overlay-*`, `--lc-spacing-inset-*`, `gap-*`, `--lc-spacing-page-gutter`, `--lc-radius-control|card|sheet|pill`,
  `--lc-typography-*`. Use primitives (`--lc-color-brand-500`, `--lc-spacing-16`) only when no semantic token fits.
- Sizes (widths, heights) are not tokens. Pure decoration (illustrations, backdrops) doesn't need tokens.

Known gaps (2026-11-25):
- Figma has no lc text / effect / paint styles yet: `tokens.css` has no lc shadow, gradient or `.lc-text-*` classes
  built on lc tokens. The landing page keeps its three composites (`--lp-gradient-cta`, `--lp-shadow-*`) in its own CSS.
- `tokens.css` carries only each collection's default mode, so `lc-color` is light only (dark stays in the snapshot).
- Shadow colours (`#000128` / `#034566` + alpha) have no lc colour token.

## Layout

```
tokens/                       versioned design tokens (tokens.css, tokens.json, CHANGELOG.md, snapshot, digest)
                              — updated only through tools/sync-tokens.py (see "Updating tokens")
tokens/inbox/                 plugin exports uploaded here are applied by the Tokens workflow
tools/sync-tokens.py          apply an export → version + changelog + generated files; --digest; --check
tools/build-tokens.py         snapshot → tokens.css / tokens.json (run by sync-tokens.py)
tools/tokenlib.py             hashing, digest and CSS naming (must match tools/figma-tokens/core.js)
tools/figma-tokens/           Figma side: core.js (export + digest) and the LoadCash Tokens Export plugin
.github/workflows/tokens.yml  applies exports dropped in tokens/inbox/, tags tokens-v<version>, checks generated files
landing/                      whitelist landing page (Vite + React), on the --lc-* tokens of tokens/tokens.css
tools/landing-server.command  one-click local server for landing/ (port 5174; 5173 is MocaMoca's)
```

## SMS landing page (`landing/`) — whitelist / 白名单落地页 / 导流落地页

- Flow of the MocaMoca whitelist page: hero → loan calculator → About Us → How it works → closing band, sticky CTA.
  The hero is the Figma new-user home screen (8654:17081); the cards are lc components.
- Archived in Figma: page "25 nov 2026 - 白名单落地页", Section 1 (8663:17218), built from lc components and
  variables. When the page changes, change both, and keep them identical.
- Run it: double-click `tools/landing-server.command`, or `npm --prefix landing run dev -- --port 5174`.
- Placeholders before launch: `PLAY_URL` in `landing/src/config.ts`, the loan model in `landing/src/loan.ts`.

## Updating tokens

`tokens/README.md` explains the pipeline. Rules for agents (they keep an update to a few thousand tokens):

- Never read `tokens/figma-export.json`, `tokens.json`, `tokens.css`, `digest.json` or the whole `CHANGELOG.md` into
  context, and never use `get_variable_defs` / `get_metadata` / `get_design_context` to read tokens. The scripts
  print a short summary; work from that.
- **Owner attached a plugin export** (`loadcash-tokens-*.json`):
  `python3 tools/sync-tokens.py <file> --message-out /tmp/msg.txt`.
- **Sync straight from Figma** (file `J5Ho0HeSsONaT4wWdEmjLO`):
  1. `python3 tools/sync-tokens.py --digest` → one line of JSON.
  2. `use_figma` (read-only) with `code` = the full text of `tools/figma-tokens/core.js` followed by
     `return await lcMcp(<that JSON>, 0);`.
  3. `{"unchanged":true}` → tell the owner nothing changed; stop. Otherwise save the result verbatim to a scratch
     file; if it says `"parts": N` with N > 1, run step 2 again with part 1 … N−1 and save each.
  4. `python3 tools/sync-tokens.py part0.json [part1.json …] --message-out /tmp/msg.txt`.
- Then commit `tokens/` with `/tmp/msg.txt` as the message and push to `main`. Don't tag: the *Tokens* workflow
  tags `tokens-v<version>` on push.
- Report the summary line and any removed / renamed CSS names (the *Developer impact* of the new
  `CHANGELOG.md` entry — read just that entry), plus the tag.
- Changing the export or hashing: edit `tools/figma-tokens/core.js` and `tools/tokenlib.py` together, run
  `python3 tools/sync-tokens.py --check`, then do one full export (`lcMcp({}, …)`, all parts).
- Editing the Figma file itself (values, names, code syntax) is a separate task: make the change in Figma, then sync.

## Checking before you push

- **Index:** decide whether the file index in `AGENTS.md` needs an edit (see "Keep this index current" there); if it does, update it in this commit.
