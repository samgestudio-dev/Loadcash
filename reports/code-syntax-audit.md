# Code Syntax 审计报告

按 [docs/code-syntax-naming.md](../docs/code-syntax-naming.md) 用每个 token 自己的路径重新计算标准 code syntax，与 Figma 里现有的 WEB code syntax 对比。

仓库里生成的 CSS 变量（`dist/tokens.css`）和 `tokens/loadcash_token.json` 里的 codeSyntax 都已经使用**标准命名**；下表列出的是 **Figma 文件中仍需覆盖** 的条目。

- 总计：404 个变量
- 符合规范：362
- 需覆盖：42

| Collection | Token path | Figma 现有 | 标准 |
|---|---|---|---|
| Primitive | `Color/Yellow/50` | `var(--color-green-50)` | `var(--color-yellow-50)` |
| Primitive | `Color/Yellow/100` | `var(--color-green-100)` | `var(--color-yellow-100)` |
| Primitive | `Color/Yellow/200` | `var(--color-green-200)` | `var(--color-yellow-200)` |
| Primitive | `Color/Yellow/300` | `var(--color-green-300)` | `var(--color-yellow-300)` |
| Primitive | `Color/Yellow/400` | `var(--color-green-400)` | `var(--color-yellow-400)` |
| Primitive | `Color/Yellow/500` | `var(--color-green-500)` | `var(--color-yellow-500)` |
| Primitive | `Color/Yellow/600` | `var(--color-green-600)` | `var(--color-yellow-600)` |
| Primitive | `Color/Yellow/700` | `var(--color-green-700)` | `var(--color-yellow-700)` |
| Primitive | `Color/Yellow/800` | `var(--color-green-800)` | `var(--color-yellow-800)` |
| Primitive | `Color/Yellow/900` | `var(--color-green-900)` | `var(--color-yellow-900)` |
| Primitive | `Radius/4` | `var(--radius-8)` | `var(--radius-4)` |
| Primitive | `Stroke/Width/10` | `var(--stroke-width-1)` | `var(--stroke-width-10)` |
| Semantic | `Color/Surface/Card/Warning` | `var(--color-surface-card-positive)` | `var(--color-surface-card-warning)` |
| Semantic | `Color/Surface/Card/Warning-subtle` | `var(--color-surface-card-positive-subtle)` | `var(--color-surface-card-warning-subtle)` |
| Semantic | `Color/Surface/Icon/Warning/Default` | `var(--color-surface-icon-positive-default)` | `var(--color-surface-icon-warning-default)` |
| Semantic | `Color/Surface/Icon/Warning/Disabled` | `var(--color-surface-icon-positive-disabled)` | `var(--color-surface-icon-warning-disabled)` |
| Semantic | `Color/Action/Bg/Brand/Default` | `var(--color-action-bg-primary-default)` | `var(--color-action-bg-brand-default)` |
| Semantic | `Color/Action/Bg/Brand/Disabled` | `var(--color-action-bg-primary-disabled)` | `var(--color-action-bg-brand-disabled)` |
| Semantic | `Color/Action/Bg/Brand/Pressed` | `var(--color-action-bg-primary-pressed)` | `var(--color-action-bg-brand-pressed)` |
| Semantic | `Color/Action/Bg/Primary/Gradient 1` | `var(--color-action-bg-primary-default)` | `var(--color-action-bg-primary-gradient-1)` |
| Semantic | `Color/Action/Bg/Primary/Gradient 2` | `var(--color-action-bg-primary-disabled)` | `var(--color-action-bg-primary-gradient-2)` |
| Semantic | `Color/Action/Text/Inverse` | `var(--color-action-text-brand)` | `var(--color-action-text-inverse)` |
| Semantic | `Color/Icon/Warning/Default` | `var(--color-icon-positive-default)` | `var(--color-icon-warning-default)` |
| Semantic | `Color/Icon/Warning/Heavy` | `var(--color-icon-positive-heavy)` | `var(--color-icon-warning-heavy)` |
| Semantic | `Color/Icon/Warning/Light` | `var(--color-icon-positive-light)` | `var(--color-icon-warning-light)` |
| Semantic | `Color/Warning/50` | `var(--color-positive-50)` | `var(--color-warning-50)` |
| Semantic | `Color/Warning/100` | `var(--color-positive-100)` | `var(--color-warning-100)` |
| Semantic | `Color/Warning/200` | `var(--color-positive-200)` | `var(--color-warning-200)` |
| Semantic | `Color/Warning/300` | `var(--color-positive-300)` | `var(--color-warning-300)` |
| Semantic | `Color/Warning/400` | `var(--color-positive-400)` | `var(--color-warning-400)` |
| Semantic | `Color/Warning/500` | `var(--color-positive-500)` | `var(--color-warning-500)` |
| Semantic | `Color/Warning/600` | `var(--color-positive-600)` | `var(--color-warning-600)` |
| Semantic | `Color/Warning/700` | `var(--color-positive-700)` | `var(--color-warning-700)` |
| Semantic | `Color/Warning/800` | `var(--color-positive-800)` | `var(--color-warning-800)` |
| Semantic | `Color/Warning/900` | `var(--color-positive-900)` | `var(--color-warning-900)` |
| Semantic | `Font/Weight/SemiBold` | `var(--font-weight-semibold)` | `var(--font-weight-semi-bold)` |
| Semantic | `Radius/xxs` | `var(--radius-xs)` | `var(--radius-xxs)` |
| Semantic | `Color/Text/Warning/Default` | `var(--color-text-positive-default)` | `var(--color-text-warning-default)` |
| Semantic | `Color/Text/Warning/Heavy` | `var(--color-text-positive-heavy)` | `var(--color-text-warning-heavy)` |
| Semantic | `Color/Text/Warning/Light` | `var(--color-text-positive-light)` | `var(--color-text-warning-light)` |
| Semantic | `Color/Stroke/Warning/Default` | `var(--color-stroke-positive-default)` | `var(--color-stroke-warning-default)` |
| Semantic | `Color/Stroke/Warning/Subtle` | `var(--color-stroke-positive-subtle)` | `var(--color-stroke-warning-subtle)` |

## 同名 token

以下 Semantic token 的标准名与它引用的 Primitive 完全相同、值也相同，CSS 中只输出一次（Primitive 那份）：

- `--color-neutral-0` ← Semantic `Color/Neutral/0` = Primitive `Color/Neutral/0`
- `--color-neutral-50` ← Semantic `Color/Neutral/50` = Primitive `Color/Neutral/50`
- `--color-neutral-100` ← Semantic `Color/Neutral/100` = Primitive `Color/Neutral/100`
- `--color-neutral-200` ← Semantic `Color/Neutral/200` = Primitive `Color/Neutral/200`
- `--color-neutral-300` ← Semantic `Color/Neutral/300` = Primitive `Color/Neutral/300`
- `--color-neutral-400` ← Semantic `Color/Neutral/400` = Primitive `Color/Neutral/400`
- `--color-neutral-500` ← Semantic `Color/Neutral/500` = Primitive `Color/Neutral/500`
- `--color-neutral-600` ← Semantic `Color/Neutral/600` = Primitive `Color/Neutral/600`
- `--color-neutral-700` ← Semantic `Color/Neutral/700` = Primitive `Color/Neutral/700`
- `--color-neutral-800` ← Semantic `Color/Neutral/800` = Primitive `Color/Neutral/800`
- `--color-neutral-900` ← Semantic `Color/Neutral/900` = Primitive `Color/Neutral/900`
