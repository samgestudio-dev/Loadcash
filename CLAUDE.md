# LoadCash tokens — agent guide

Versioned design tokens of the LoadCash Design System (Figma file `J5Ho0HeSsONaT4wWdEmjLO`).
There is no Playground UI in this repo; GitHub Pages serves `main` / root as-is (`.nojekyll`), so the latest tokens
are at https://samgestudio-dev.github.io/Loadcash/tokens/tokens.css. The owner is a designer; reply in plain language.

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
```

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
