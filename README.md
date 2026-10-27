# LoadCash Design System — Tokens

LoadCash 设计系统的 design token，来源：[Figma · LoadCash Design System](https://www.figma.com/design/J5Ho0HeSsONaT4wWdEmjLO/LoadCash-Design-System)

| 内容 | 数量 |
|---|---|
| Primitive 变量 | 151 |
| Semantic 变量 | 253 |
| Text styles | 24 |
| Effect styles | 8 |
| Gradient (paint style) | 1 |

## 目录

```
figma/                     Figma 原始导出快照（source of truth，勿手改）
  primitive.json
  semantic.json
  styles.json              text / effect / paint styles
tokens/
  loadcash_token.json      W3C DTCG 格式，Primitive → Semantic 引用关系完整保留
dist/
  tokens.css               CSS 变量 + .text-* 字体类 + .effect-* 效果类
  tokens.json              CSS 变量名 → 解析后的最终值
  tokens.js                同上，ES module
docs/
  code-syntax-naming.md    Code Syntax 自动命名规范
reports/
  code-syntax-audit.md     Figma 现有 code syntax 与规范的差异
scripts/
  build.py                 生成 tokens/ dist/ reports/（无依赖）
```

## 使用

```html
<link rel="stylesheet" href="dist/tokens.css">
```

```css
.card {
  background: var(--color-surface-card-default);
  border-radius: var(--radius-md);
  padding: var(--spacing-padding-lg);
  box-shadow: var(--shadow-default);
}
```

```html
<h1 class="text-title-lg">Loan amount</h1>
<nav class="effect-blur-glass-nav-effect">…</nav>
<button style="background: var(--gradient-cta)">Apply</button>
```

```js
import tokens from './dist/tokens.js';
tokens['--color-text-brand-default']; // "#0271a8"
```

## 命名

所有 CSS 变量名都按 [docs/code-syntax-naming.md](docs/code-syntax-naming.md) 从 **token 自己的路径** 生成，不使用引用值路径，不含 collection / mode：

```
Color / Text / Brand / Default  →  var(--color-text-brand-default)
Font / Weight / SemiBold        →  var(--font-weight-semi-bold)
```

Semantic 变量在 CSS 中引用 Primitive 变量（`--color-text-brand-default: var(--color-blue-500)`），引用链与 Figma 一致。

Figma 文件里有 42 个变量的 code syntax 与规范不一致（Yellow 色阶写成 green、Warning 写成 positive、`Radius/4` 写成 radius-8 等），仓库输出已使用标准命名，Figma 侧的待覆盖清单见 [reports/code-syntax-audit.md](reports/code-syntax-audit.md)。

## 单位转换

| Figma | CSS |
|---|---|
| 尺寸类 FLOAT（size / line-height / spacing / radius / blur / stroke） | `px` |
| Font weight | 无单位 |
| Layer opacity（Figma 存 0–100） | 0–1 |
| Letter spacing % | `em`（2% → `0.02em`） |
| Drop shadow radius | `box-shadow` blur |
| Background blur | `backdrop-filter: blur()` |

## 更新流程

1. 在 Figma 修改变量 / 样式
2. 重新导出到 `figma/*.json`
3. `python3 scripts/build.py`
4. 提交
