# Sourdough Lab — 项目级 Claude 约定

## 项目定位
**纯 Sourdough 创意实验室**。不做其他面包类型（如日式吐司）。所有"不同配方"都是同一 base recipe × 不同 modifier 组合。

## 核心架构：三层数据模型

```
Base Recipe (sourdough-classic.js)
  × numUnits
  × Modifiers [{ id, dose }]
  → calculator.calculateRecipe()
  → { ingredients, water, actualHydration, warnings, notes, processAdjust }
```

所有 UI 组件从这个计算结果派生，零硬编码食材/警告/色号。

**关键规则**：任何产品层面的新功能（加色粉、混入料、预设、警告），**改 domain 层 JSON 数据**就行，不要改 UI。

## 文件结构约定

- `src/design/` —— 设计 tokens + 字体 + 渐变引擎 + 纸纹
- `src/domain/` —— 业务逻辑纯函数，零 React 导入
- `src/components/primitives/` —— 通用 UI（Card/Button/Pill/NumberField/Slider/...）
- `src/components/{recipe,starter,process}/` —— 按 Tab 分包的业务组件

## 视觉 / UI 约定

- **底色 `#F5F1EA` 暖米纸 + 单一麦色 `#B08968`**，不加其他 accent
- **禁用 emoji 作 UI 图标**（吴老师全局规则），用 lucide-react 线条图标
- **禁用硬编码渐变颜色**，用 [design/gradient.js](src/design/gradient.js) 的 `buildGradientBackground(prediction, modifiers)` 生成多层 radial
- **Tailwind palette 被彻底覆盖**，只有 tokens 里定义的颜色可用。**不要用 `bg-neutral-*` / `bg-orange-*` / `bg-gray-*`**，只能 `bg-bg / bg-surface / bg-sunken / bg-accent / bg-warn-bg / bg-ok-bg`
- Fraunces 用于标题，Inter 用于正文，IBM Plex Mono 用于数字（`tabular-nums`）
- 1px hairline 边框优先于 shadow
- 圆角只有 `rounded-sm/md/lg/pill/full`，**不要用 `rounded-2xl/3xl`**（不存在）

## 扩展操作

- **加色粉** → [src/domain/modifiers/colorants.js](src/domain/modifiers/colorants.js) 追加对象
- **加混入料** → [src/domain/modifiers/addins.js](src/domain/modifiers/addins.js)
- **加创意预设** → [src/domain/modifiers/flavors.js](src/domain/modifiers/flavors.js)（引用已有 modifier id）
- **改基础配方** → [src/domain/base-recipes/sourdough-classic.js](src/domain/base-recipes/sourdough-classic.js)

Schema 参考 README.md 的"扩展指南"章节。

## 命令

```bash
npm run dev      # 本地开发
npm run build    # 生产构建（gzip ~122KB）
npm test         # vitest，calculator 单元测试（14 用例）
```

`npm test` **必须全绿**后才能改 calculator / modifiers / breadColor。

## 新增 modifier 后的自检清单

1. `npm test` 全绿（现有 14 个 calculator 测试不应被破坏）
2. dev server 打开，在 Formula Tab 选中新 modifier → 确认：
   - BreadPreview 椭圆颗粒/色有变化
   - IngredientTable 出现新行 + 对应克数
   - 水合度 delta 合理（差值在 0~10% 内）
   - warnings 弹出（如设了 fermentation/gluten 影响）

## 已知禁区

- ❌ 不要加"日式吐司""恰巴塔"等新面包类型，除非吴老师明确要求；当前只做 sourdough
- ❌ 不要加后端 / 账号系统 / 云同步；保持纯 PWA + localStorage
- ❌ 不要加 emoji 图标
- ❌ 不要用 Tailwind 默认色名
- ❌ 不要在 components/ 里直接写配方数据；所有数据在 domain/
