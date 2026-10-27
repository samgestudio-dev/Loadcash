#!/usr/bin/env python3
"""
LoadCash token build.

Reads the raw Figma export in figma/ and writes:
  tokens/loadcash_token.json        W3C DTCG token file (Primitive / Semantic / styles)
  dist/tokens.css                   CSS custom properties + typography / effect classes
  dist/tokens.json                  flat map of CSS variable -> resolved value
  dist/tokens.js                    same map as an ES module
  reports/code-syntax-audit.md      Figma code syntax vs. naming spec

CSS variable names follow docs/code-syntax-naming.md:
the name comes only from the token's own path (never its value / collection / mode).

Usage: python3 scripts/build.py   (no dependencies)
"""
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FIGMA = ROOT / "figma"


# ---------------------------------------------------------------- naming spec
def normalize(segment: str) -> str:
    s = segment.strip()
    s = re.sub(r"([a-z0-9])([A-Z])", r"\1-\2", s)
    s = re.sub(r"[\s_/]+", "-", s)
    s = re.sub(r"[^a-zA-Z0-9-]", "", s)
    s = re.sub(r"-+", "-", s)
    s = s.strip("-")
    return s.lower()


def css_name(path: str) -> str:
    """Token path 'Color/Text/Brand/Default' -> '--color-text-brand-default'."""
    return "--" + "-".join(p for p in (normalize(x) for x in path.split("/")) if p)


def code_syntax(path: str) -> str:
    return f"var({css_name(path)})"


# ---------------------------------------------------------------- load
prim = json.loads((FIGMA / "primitive.json").read_text())
sem = json.loads((FIGMA / "semantic.json").read_text())
styles = json.loads((FIGMA / "styles.json").read_text())

collections = {"Primitive": prim["variables"], "Semantic": sem["variables"]}
by_key = {}  # "Primitive/Color/Blue/500" -> var
for cname, vars_ in collections.items():
    for v in vars_:
        v["collection"] = cname
        by_key[f"{cname}/{v['n']}"] = v

semantic_by_name = {v["n"]: v for v in sem["variables"]}


def resolve(v):
    seen = set()
    while isinstance(v["v"], dict):
        key = v["v"]["alias"]
        if key in seen:
            raise ValueError(f"alias cycle at {key}")
        seen.add(key)
        v = by_key[key]
    return v


# ---------------------------------------------------------------- value formatting
def fmt_num(x):
    return str(int(x)) if float(x).is_integer() else f"{x:g}"


def unit_kind(v):
    """How a FLOAT token is emitted in CSS."""
    root = resolve(v)
    name = root["n"]
    if name.startswith("Font/Weight/"):
        return "unitless"
    if name.lower().startswith("layer opacity/"):
        return "percent-to-ratio"
    return "px"


def css_literal(v):
    """Literal CSS value for a non-alias token."""
    t, val = v["t"], v["v"]
    if t == "COLOR":
        return val
    if t == "STRING":
        return f'"{val}"'
    kind = unit_kind(v)
    if kind == "unitless":
        return fmt_num(val)
    if kind == "percent-to-ratio":
        return fmt_num(round(val / 100, 4))
    return "0" if val == 0 else f"{fmt_num(val)}px"


def css_value(v):
    if isinstance(v["v"], dict):
        target = by_key[v["v"]["alias"]]
        return f"var({css_name(target['n'])})"
    return css_literal(v)


def resolved_css(v):
    return css_literal(resolve(v))


# ---------------------------------------------------------------- 1. code syntax audit
audit_rows, collisions = [], []
emitted = {}  # css name -> (collection, var)
for cname, vars_ in collections.items():
    for v in vars_:
        std = code_syntax(v["n"])
        existing = (v.get("cs") or {}).get("WEB")
        v["std_cs"] = std
        status = "ok" if existing == std else ("missing" if not existing else "mismatch")
        audit_rows.append((cname, v["n"], existing, std, status))
        n = css_name(v["n"])
        if n in emitted:
            collisions.append((n, emitted[n], (cname, v)))
        else:
            emitted[n] = (cname, v)

# A semantic token whose standard name equals the primitive it aliases is
# emitted once (it would otherwise be `--x: var(--x)`, a cycle).
skip_semantic = set()
for n, (c1, v1), (c2, v2) in collisions:
    same_target = c1 == "Primitive" and c2 == "Semantic" and v2["v"] == {"alias": f"Primitive/{v1['n']}"}
    if not same_target:
        raise SystemExit(f"Unresolvable CSS name collision: {n} ({c1}/{v1['n']} vs {c2}/{v2['n']})")
    skip_semantic.add(v2["n"])

# ---------------------------------------------------------------- 2. DTCG tokens
DTCG_TYPE = {"COLOR": "color", "STRING": "fontFamily"}


def dtcg_type(v):
    if v["t"] in DTCG_TYPE:
        return DTCG_TYPE[v["t"]]
    root = resolve(v)["n"]
    if root.startswith("Font/Weight/"):
        return "fontWeight"
    if root.lower().startswith("layer opacity/"):
        return "number"
    return "dimension"


def dtcg_ref(alias_key):
    return "{" + alias_key.replace("/", ".") + "}"


def dtcg_value(v):
    if isinstance(v["v"], dict):
        return dtcg_ref(v["v"]["alias"])
    t = dtcg_type(v)
    if t == "dimension":
        return f"{fmt_num(v['v'])}px"
    if t == "number":
        return round(v["v"] / 100, 4)
    return v["v"]


def put(tree, path, leaf):
    node = tree
    for p in path[:-1]:
        node = node.setdefault(p, {})
    node[path[-1]] = leaf


dtcg = {
    "$description": "LoadCash Design System tokens, exported from Figma "
                    "(https://www.figma.com/design/J5Ho0HeSsONaT4wWdEmjLO/LoadCash-Design-System). "
                    "Generated by scripts/build.py — do not edit by hand.",
}
for cname, vars_ in collections.items():
    group = dtcg.setdefault(cname, {})
    for v in vars_:
        leaf = {"$type": dtcg_type(v), "$value": dtcg_value(v)}
        if v.get("d"):
            leaf["$description"] = v["d"]
        leaf["$extensions"] = {"com.figma": {"codeSyntax": {"WEB": v["std_cs"]}, "scopes": v["s"]}}
        put(group, v["n"].split("/"), leaf)


def sem_ref(name):
    return dtcg_ref(f"Semantic/{name}")


typo = dtcg.setdefault("Typography", {})
for s in styles["text"]:
    b = s["b"]
    ls = s["ls"]
    ls_val = f"{fmt_num(ls['value'])}px" if ls["unit"] == "PIXELS" else f"{fmt_num(round(ls['value'] / 100, 4))}em"
    put(typo, s["n"].split("/"), {
        "$type": "typography",
        "$value": {
            "fontFamily": sem_ref(b["fontFamily"]),
            "fontWeight": sem_ref(b["fontWeight"]),
            "fontSize": sem_ref(b["fontSize"]),
            "lineHeight": sem_ref(b["lineHeight"]),
            "letterSpacing": ls_val,
        },
        "$extensions": {"com.figma": {"style": s["n"], "fontStyle": s["style"]}},
    })


def shadow_layers(effects):
    out = []
    for e in effects:
        if e["type"] != "DROP_SHADOW" or not e["visible"]:
            continue
        b = e["b"]
        out.append({
            "color": sem_ref(b["color"]) if "color" in b else e["color"],
            "offsetX": f"{fmt_num(e['offset']['x'])}px",
            "offsetY": f"{fmt_num(e['offset']['y'])}px",
            "blur": sem_ref(b["radius"]) if "radius" in b else f"{fmt_num(e['radius'])}px",
            "spread": f"{fmt_num(e['spread'])}px",
        })
    return out


eff = dtcg.setdefault("Effect", {})
for s in styles["effect"]:
    shadows = shadow_layers(s["effects"])
    blur = next((e for e in s["effects"] if e["type"] == "BACKGROUND_BLUR" and e["visible"]), None)
    leaf = {}
    if shadows and not blur:
        leaf = {"$type": "shadow", "$value": shadows if len(shadows) > 1 else shadows[0]}
    else:
        val = {}
        if blur:
            val["backdropBlur"] = sem_ref(blur["b"]["radius"]) if "radius" in blur["b"] else f"{fmt_num(blur['radius'])}px"
        if shadows:
            val["shadow"] = shadows
        leaf = {"$value": val, "$description": "Composite effect: background blur" + (" + drop shadow" if shadows else "")}
    leaf["$extensions"] = {"com.figma": {"style": s["n"]}}
    put(eff, s["n"].split("/"), leaf)


def gradient_angle(t):
    # Figma gradient runs along gradient-space x; x_grad = t[0][0]*x + t[0][1]*y + t[0][2].
    # CSS angle: 0deg = to top, 90deg = to right, 180deg = to bottom.
    import math
    dx, dy = t[0][0], t[0][1]
    return round((math.degrees(math.atan2(dx, -dy))) % 360)


grad = dtcg.setdefault("Gradient", {})
for s in styles["paint"]:
    p = s["paints"][0]
    put(grad, s["n"].split("/")[1:] if s["n"].startswith("Gradient/") else s["n"].split("/"), {
        "$type": "gradient",
        "$value": [{"color": st["color"], "position": st["pos"]} for st in p["stops"]],
        "$extensions": {"com.figma": {"style": s["n"], "angle": f"{gradient_angle(p['transform'])}deg"}},
    })

(ROOT / "tokens").mkdir(exist_ok=True)
(ROOT / "tokens" / "loadcash_token.json").write_text(json.dumps(dtcg, ensure_ascii=False, indent=2) + "\n")

# ---------------------------------------------------------------- 3. CSS
def section(title, lines):
    return [f"  /* {title} */"] + lines + [""]


GROUP_ORDER = [
    ("Color", lambda n: n.startswith("Color/")),
    ("Font", lambda n: n.startswith("Font/")),
    ("Spacing", lambda n: n.startswith("Spacing/")),
    ("Radius", lambda n: n.startswith("Radius/")),
    ("Stroke", lambda n: n.startswith("Stroke/")),
    ("Blur", lambda n: n.startswith("Blur/")),
    ("Layer opacity (0–1)", lambda n: n.lower().startswith("layer opacity/")),
]

css = [
    "/**",
    " * LoadCash Design System — CSS tokens",
    " * Generated by scripts/build.py from figma/*.json. Do not edit by hand.",
    " * Variable names follow docs/code-syntax-naming.md (token path → kebab-case).",
    " */",
    "",
    ":root {",
]
for cname in ("Primitive", "Semantic"):
    css.append(f"  /* ============ {cname} ============ */")
    css.append("")
    vars_ = collections[cname]
    for gname, pred in GROUP_ORDER:
        lines = [
            f"  {css_name(v['n'])}: {css_value(v)};" + (f" /* {v['d']} */" if v.get("d") else "")
            for v in vars_
            if pred(v["n"]) and not (cname == "Semantic" and v["n"] in skip_semantic)
        ]
        if lines:
            css += section(gname, lines)

# shadows as variables
css.append("  /* ============ Effects ============ */")
css.append("")
shadow_lines = []


def css_shadow(effects):
    parts = []
    for e in effects:
        if e["type"] != "DROP_SHADOW" or not e["visible"]:
            continue
        b = e["b"]
        color = code_syntax(b["color"]) if "color" in b else e["color"]
        blur = code_syntax(b["radius"]) if "radius" in b else f"{fmt_num(e['radius'])}px"
        ox, oy = e["offset"]["x"], e["offset"]["y"]
        ox = "0" if ox == 0 else f"{fmt_num(ox)}px"
        oy = "0" if oy == 0 else f"{fmt_num(oy)}px"
        spread = "" if e["spread"] == 0 else f" {fmt_num(e['spread'])}px"
        parts.append(f"{ox} {oy} {blur}{spread} {color}")
    return ", ".join(parts)


def css_backdrop(effects):
    e = next((e for e in effects if e["type"] == "BACKGROUND_BLUR" and e["visible"]), None)
    if not e:
        return None
    return f"blur({code_syntax(e['b']['radius'])})" if "radius" in e["b"] else f"blur({fmt_num(e['radius'])}px)"


for s in styles["effect"]:
    sh, bd = css_shadow(s["effects"]), css_backdrop(s["effects"])
    base = css_name(s["n"])
    if sh and not bd:
        shadow_lines.append(f"  {base}: {sh};")
    else:
        if bd:
            shadow_lines.append(f"  {base}-backdrop-filter: {bd};")
        if sh:
            shadow_lines.append(f"  {base}-box-shadow: {sh};")
css += shadow_lines + [""]

css.append("  /* ============ Gradients ============ */")
css.append("")
for s in styles["paint"]:
    p = s["paints"][0]
    stops = ", ".join(f"{st['color']} {fmt_num(st['pos'] * 100)}%" for st in p["stops"])
    css.append(f"  {css_name(s['n'])}: linear-gradient({gradient_angle(p['transform'])}deg, {stops});")
css.append("}")
css.append("")

# typography classes
css.append("/* ============ Typography (Figma text styles) ============ */")
css.append("")
for s in styles["text"]:
    b = s["b"]
    ls = s["ls"]
    ls_val = (f"{fmt_num(ls['value'])}px" if ls["unit"] == "PIXELS" else f"{fmt_num(round(ls['value'] / 100, 4))}em")
    if ls["value"] == 0:
        ls_val = "0"
    css += [
        f".text-{css_name(s['n'])[2:]} {{",
        f"  font-family: {code_syntax(b['fontFamily'])}, sans-serif;",
        f"  font-weight: {code_syntax(b['fontWeight'])};",
        f"  font-size: {code_syntax(b['fontSize'])};",
        f"  line-height: {code_syntax(b['lineHeight'])};",
        f"  letter-spacing: {ls_val};",
        "}",
        "",
    ]

css.append("/* ============ Effect classes (Figma effect styles) ============ */")
css.append("")
for s in styles["effect"]:
    sh, bd = css_shadow(s["effects"]), css_backdrop(s["effects"])
    base = css_name(s["n"])
    body = []
    if sh and not bd:
        body.append(f"  box-shadow: var({base});")
    else:
        if bd:
            body += [f"  -webkit-backdrop-filter: var({base}-backdrop-filter);", f"  backdrop-filter: var({base}-backdrop-filter);"]
        if sh:
            body.append(f"  box-shadow: var({base}-box-shadow);")
    css += [f".effect-{base[2:]} {{"] + body + ["}", ""]

(ROOT / "dist").mkdir(exist_ok=True)
(ROOT / "dist" / "tokens.css").write_text("\n".join(css))

# ---------------------------------------------------------------- 4. flat resolved map
flat = {}
for cname in ("Primitive", "Semantic"):
    for v in collections[cname]:
        if cname == "Semantic" and v["n"] in skip_semantic:
            continue
        val = resolved_css(v)
        flat[css_name(v["n"])] = val.strip('"') if v["t"] == "STRING" else val


def resolve_in(text):
    return re.sub(r"var\((--[a-z0-9-]+)\)", lambda m: flat[m.group(1)], text)


for s in styles["effect"]:
    sh, bd = css_shadow(s["effects"]), css_backdrop(s["effects"])
    base = css_name(s["n"])
    if sh and not bd:
        flat[base] = resolve_in(sh)
    else:
        if bd:
            flat[f"{base}-backdrop-filter"] = resolve_in(bd)
        if sh:
            flat[f"{base}-box-shadow"] = resolve_in(sh)
for s in styles["paint"]:
    p = s["paints"][0]
    stops = ", ".join(f"{st['color']} {fmt_num(st['pos'] * 100)}%" for st in p["stops"])
    flat[css_name(s["n"])] = f"linear-gradient({gradient_angle(p['transform'])}deg, {stops})"

(ROOT / "dist" / "tokens.json").write_text(json.dumps(flat, ensure_ascii=False, indent=2) + "\n")
(ROOT / "dist" / "tokens.js").write_text(
    "// LoadCash tokens — resolved values keyed by CSS variable name.\n"
    "// Generated by scripts/build.py. Do not edit by hand.\n"
    "export const tokens = " + json.dumps(flat, ensure_ascii=False, indent=2) + ";\n\n"
    "export default tokens;\n"
)

# ---------------------------------------------------------------- 5. audit report
mism = [r for r in audit_rows if r[4] != "ok"]
rep = [
    "# Code Syntax 审计报告",
    "",
    "按 [docs/code-syntax-naming.md](../docs/code-syntax-naming.md) 用每个 token 自己的路径重新计算标准 code syntax，"
    "与 Figma 里现有的 WEB code syntax 对比。",
    "",
    "仓库里生成的 CSS 变量（`dist/tokens.css`）和 `tokens/loadcash_token.json` 里的 codeSyntax 都已经使用**标准命名**；"
    "下表列出的是 **Figma 文件中仍需覆盖** 的条目。",
    "",
    f"- 总计：{len(audit_rows)} 个变量",
    f"- 符合规范：{len(audit_rows) - len(mism)}",
    f"- 需覆盖：{len(mism)}",
    "",
]
if mism:
    rep += ["| Collection | Token path | Figma 现有 | 标准 |", "|---|---|---|---|"]
    rep += [f"| {c} | `{n}` | `{e or '—'}` | `{s}` |" for c, n, e, s, _ in mism]
    rep.append("")
if skip_semantic:
    rep += [
        "## 同名 token",
        "",
        "以下 Semantic token 的标准名与它引用的 Primitive 完全相同、值也相同，CSS 中只输出一次（Primitive 那份）：",
        "",
    ]
    rep += [f"- `{css_name(n)}` ← Semantic `{n}` = Primitive `{n}`" for n in sorted(skip_semantic, key=lambda x: (len(x), x))]
    rep.append("")
(ROOT / "reports").mkdir(exist_ok=True)
(ROOT / "reports" / "code-syntax-audit.md").write_text("\n".join(rep))

print(f"variables: {len(audit_rows)}  code-syntax mismatches: {len(mism)}  "
      f"css vars: {len(flat)}  text styles: {len(styles['text'])}  effects: {len(styles['effect'])}")
