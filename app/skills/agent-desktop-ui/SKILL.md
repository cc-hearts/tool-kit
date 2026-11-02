---
name: agent-desktop-ui
description: >-
  Design system, UI component specifications, layout architecture, color palette, dark mode tokens,
  and elevation system for modern desktop agent tools. Use whenever designing, building, or styling applications
  following modern Agent desktop tools, macOS-native aesthetic, Windows 11 precision chrome, Acrylic primary vibrancy, floating card layout, inset grouped settings, or term-fleet floating overlays.
---

# Agent Desktop UI Design System & Implementation Guide

This skill encapsulates the complete design system and UI engineering standards of modern desktop agent tools (derived from **term-fleet** and **macOS Human Interface Guidelines / Windows 11 Fluent Principles**). It merges **macOS HIG**, **Mitchell Hashimoto's Rex aesthetic**, and modern developer tool refinement.

When designing or building applications following this system, adhere strictly to the tokens, geometry, and component behaviors outlined below.

---

## 1. Core Philosophy & Aesthetic Principles

1. **Subtractive & Focused Aesthetic (减法设计)**:
   - Avoid excessive decorative color wash gradients. Focus squarely on **Acrylic Frosted Vibrancy (✨ 亚克力磨砂)** as the primary hero material, paired with a clean **Plain (纯色专注)** solid contrast mode.
   - Backgrounds are designed to serve content, keeping developer focus strictly on the active terminal cards and code.
2. **Acrylic Frosted Vibrancy as Primary Material**:
   - The system integrates native vibrancy (`NSVisualEffectView` on macOS, Acrylic on Windows 11).
   - **Four-Tier Vibrancy Scale**:
     - `none` (无模糊): `0px` (纯色专注模式)
     - `subtle` (柔和): `14px` (macOS `VibrancySidebar`)
     - `medium` (标准): `24px` (macOS `VibrancyPopover`)
     - `deep` / `acrylic` (强力 / 亚克力主色): `36px` 模糊 + `185%` 饱和度提亮 (macOS `VibrancyAcrylic` / Win11 Acrylic)
   - **Background Opacity Slider**: Range `30% ~ 100%` (default `78%`), providing real-time luminance regulation without degrading text contrast.
   - **Single-Layer Translucency**: Terminal cards maintain clean single-layer composition (`rgba` alpha fill over transparent backing), preventing muddy multi-layer stacking so wallpaper luminance cleanly diffuses through.
3. **Floating Card Canvas**: Windows do not use edge-to-edge flat panels or dividing border lines. The primary content lives on **rounded floating cards (`14px` radius)** maintaining a strict `8px` perimeter gap (`cardGap`) away from outer frames and the sidebar.
4. **Borderless Elevation**: In light mode, **avoid harsh 1px black stroke borders** (`border: none`); surfaces stand out via compound subtle drop shadows. In dark mode, employ a top-lit hairline (**Lit Edge**: `border: 1px solid rgba(236,236,240,0.12)`, 180° gradient from 18% to 6%) over tight multi-layer shadows.
5. **Windows 11 Precision Chrome & Vertical Centering (`items-center`)**:
   - macOS: AppKit native inset traffic lights (Close, Minimize, Zoom) live in the top-left of the sidebar (inside its 44px header at `X: 18, Y: 23`).
   - Windows 11:
     - Top-right window controls: `28px (W) × 26px (H)`, `2px` gap, `4px` corner radius (`radiusSmall`), pinned at `right: 18px` (`cardGap + 10px`), and strictly **vertically centered with `items-center`** on the 44px top bar.
     - Close Button Icon: Precise Lucide 16×16 diagonal cross (`<path d="M18 6 6 18"/><path d="m6 6 12 12"/>`). On hover and press, switches instantly to `pal.Danger` (`#d93a35` in light, `#ff6961` in dark) with a pure white glyph (`#ffffff`).
     - Card Header Clearance: Card header strictly reserves `106px` right clearance (`padding-right: 106px`), ensuring chips, status badges ("Agent Active"), and tools never collide with the window buttons.
6. **Term-Fleet Aligned Floating Surfaces**:
   - **Floating Settings Window**: Completely transparent backdrop (`backdrop.Background(ui.Transparent)`)—no darkening scrim! Workspace terminals stay 100% visible. The dialog uses a two-column layout with an embedded elevated card on the right and a rigid drag header with dirty state detection.
   - **Action Confirm Modals**: Dimmed scrim overlay, 430px fixed width, elevated floating panel with Esc/Enter keyboard mappings.
   - **Command Palette (⌘K)**: Inset 84px from top, 600px width, 50px search header.
   - **Popovers & Context Pickers**: 320px width, 14px radius, elevated floating panel placed directly over triggers.

---

## 2. Color System & Palettes

### 2.1 Base Surface & Typography

| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `sidebar` | `#eceef4` | `#141418` | Window under-surface & sidebar base |
| `card` | `#ffffff` | `#232328` | Main content card & terminal canvas |
| `popover` | `#ffffff` | `#232327` | Context menus, dropdown panels, dialogs |
| `text` | `#1d1d1f` | `#ececf0` | Primary labels, headers, active text |
| `textMuted` | `#6e6e78` | `#a9a9b4` | Secondary explanations, group subtitles |
| `textFaint` | `#a3a3ad` | `#83838f` | Hints, placeholders, inactive counts |
| `chip` | `rgba(0, 0, 0, 0.045)` | `rgba(255, 255, 255, 0.07)` | Settings group container background |
| `divider` | `rgba(0, 0, 0, 0.06)` | `rgba(255, 255, 255, 0.07)` | General visual boundaries |
| `rowDivider` | `rgba(0, 0, 0, 0.07)` | `rgba(255, 255, 255, 0.07)` | 1px hairline between rows in a group |
| `cardDim` | `rgba(255, 255, 255, 0.58)` | `rgba(35, 35, 40, 0.5)` | Unfocused pane surface |
| `veil` | `rgba(250, 248, 252, 0.28)` | `rgba(14, 13, 18, 0.42)` | Unfocused split opacity overlay |

### 2.2 Semantic & Accent Colors

| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `accent` | `#3b6cf6` | `#6b93ff` | Primary focus, active switch, icons |
| `accentSelection` | `rgba(59, 108, 246, 0.25)` | `rgba(107, 147, 255, 0.25)` | Text and list row selections |
| `attention` | `#c27b0f` | `#f0a33a` | Waiting for user, warnings, permission prompts |
| `attentionSoft`| `rgba(232, 154, 40, 0.13)`| `rgba(240, 163, 58, 0.15)`| Glowing background badge for attention |
| `done` | `#1d1d1f` | `#ececf0` | Completed process icon check |
| `onDone` | `#ffffff` | `#161618` | Foreground checkmark inside done icon |
| `danger` | `#d93a35` | `#ff6961` | Destructive buttons, error status, close button hover on Win/Linux |
| `success` | `#22863a` | `#4fd17a` | Active fleet status, connected relay, healthy process |
| `overlay` | `rgba(10, 10, 30, 0.12)` | `rgba(0, 0, 0, 0.35)` | Dialog & modal backdrop tint |

### 2.3 Acrylic Vibrancy Surface Tokens

| Token | Light Mode | Dark Mode | Usage |
| :--- | :--- | :--- | :--- |
| `acrylicBg` | `rgba(236, 238, 244, 0.78)` | `rgba(20, 20, 24, 0.78)` | Window base under-surface with backdrop blur |
| `acrylicCard` | `rgba(255, 255, 255, 0.85)` | `rgba(35, 35, 40, 0.82)` | Translucent floating terminal/content card |
| `acrylicPopover`| `rgba(255, 255, 255, 0.90)`| `rgba(35, 35, 39, 0.90)` | Floating dialogs, menus, and command palettes |
| `acrylicTint` | `rgba(255, 255, 255, 0.45)` | `rgba(255, 255, 255, 0.08)` | Highlight glow wash overlay |

---

## 3. Elevation & Surface Lighting

Surfaces are elevated using whole-pixel crisp bounds.

### 3.1 Raised (Cards, Main Buttons, Selected Rows)
- **Light**:
  ```css
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.07),
              0 1px 6px 0 rgba(0, 0, 0, 0.035);
  ```
- **Dark (Lit Edge + Dark Shadow)**:
  ```css
  /* 注意：在 CSS 标准规范中，border-image 会覆盖并禁用 border-radius 导致直角！
     在 Web/Electron/CSS 渲染层，必须使用 border + inset box-shadow 绘制 Lit Edge，
     既完美呈现 18% 顶光下射反射，又严格维持 14px/8px 圆角与硬件裁剪：*/
  border: 1px solid rgba(236, 236, 240, 0.10);
  box-shadow: inset 0 1px 0 0 rgba(236, 236, 240, 0.18),
              0 1px 1px 0 rgba(0, 0, 0, 0.2),
              0 2px 2px -1px rgba(0, 0, 0, 0.2),
              0 4px 6px -3px rgba(0, 0, 0, 0.24);
  ```

### 3.2 Chosen (Sidebar Nav Items)
- **Light**:
  ```css
  box-shadow: 0 0 0 0.5px rgba(0, 0, 0, 0.06),
              0 0.5px 2px 0 rgba(0, 0, 0, 0.05);
  ```
- **Dark**: Same as Raised.

### 3.3 Menu & Popover
- **Light**:
  ```css
  background: linear-gradient(180deg, #fbfbfb, #f4f4f5);
  box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.9),
              inset 0 -1px 0 0 rgba(255, 255, 255, 0.9),
              inset 0 0 0 0.5px rgba(0, 0, 0, 0.3),
              0 5px 10px 0 rgba(0, 0, 0, 0.22);
  ```
- **Dark**:
  ```css
  background: #232327;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.12),
              0 1px 3px 0 rgba(0, 0, 0, 0.25),
              0 4px 16px 0 rgba(0, 0, 0, 0.4);
  ```

### 3.4 Floating (Settings Dialog, Command Palette, Modals)
- **Light**:
  ```css
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.07),
              0 16px 40px 0 rgba(20, 20, 40, 0.14);
  ```
- **Dark**: Lit Edge + `box-shadow: 0 1px 1px 0 rgba(0,0,0,0.2), 0 2px 2px -1px rgba(0,0,0,0.2), 0 4px 6px -3px rgba(0,0,0,0.24), 0 16px 40px 0 rgba(0, 0, 0, 0.45);`

---

## 4. Cross-Platform Window Frame & Window Controls (macOS vs Windows 11)

```
macOS Frame (AppKit System Traffic Lights on Left)
┌────────────────────────────────────────────────────────┐
│ [•][•][•] (X:18, Y:23)     Card Header      Card Tools │
└────────────────────────────────────────────────────────┘

Windows / Linux Frame (Precision Flat Buttons on Right + Reserved Header Room + items-center)
┌──────────────────────────────────────────────────────────────────────────┐
│ [Icon] Term Fleet          Card Header      Card Tools    [-] [□] [×]    │
│ (Lead: 12px)                                (Pr: 106px)   (W:28, H:26)   │
└──────────────────────────────────────────────────────────────────────────┘
```

### 4.1 macOS Frame (Native Inset Traffic Lights)
- AppKit native traffic lights positioned at `X: 18, Y: 23` in the sidebar header.
- Header title lead starts at `titleBarLead = TitleBar.Left + 8px` (~76px).
- Zero duplicate custom window buttons drawn on macOS.

### 4.2 Windows & Linux Frame (Precision Flat Controls & Header Clearance)
- **Sidebar Top-Left Layout**:
  - No pseudo-Mac traffic lights.
  - Header starts at `titleBarLead = 12px` with app mark/icon and title (`Term Fleet`).
- **Top-Right Control Group Geometry & Centering (`items-center`)**:
  - Button container: `absolute right-[10px] top-0 bottom-0 my-auto flex h-[26px] items-center gap-[2px]`.
  - Individual Button: `28px (width) × 26px (height)`, `border-radius: 4px` (`radiusSmall`).
  - Strict internal centering: `display: flex; align-items: center; justify-content: center;`.
- **Three Button Behaviors (term-fleet 规范)**:
  1. **Minimize**:
     - SVG: `<path d="M5 12h14"/>` (Lucide 16×16 grid).
     - Hover: `pal.RowHover`.
  2. **Maximize / Restore**:
     - Normal: Single square `<rect width="14" height="14" x="5" y="5" rx="2"/>`.
     - Maximized: Double overlapping squares `<rect width="10" height="10" x="9" y="9" rx="1.5"/>...`.
     - Windows 11 Snap Layouts: hovering invokes the OS Snap Layouts popup.
  3. **Close (Dangerous Action)**:
     - SVG: Exact term-fleet Lucide 16×16 cross `<path d="M18 6 6 18"/><path d="m6 6 12 12"/>` with `stroke-width: 2`.
     - Normal: Quiet text color (`pal.TextMuted`).
     - **Hover & Pressed**: Surface switches to `pal.Danger` (`#d93a35` in light, `#ff6961` in dark), cross glyph switches to pure white (`#ffffff`).
- **Card Header Clearance Rule**:
  - Header right padding: `padding-right: var(--agent-win-header-pad-right, 106px);`.
  - Guarantees zero collision between card tool chips ("Agent Active", "UTF-8", split controls) and the window buttons.

---

## 5. Dialog & Floating Surfaces Architecture (Term-Fleet Aligned)

### 5.1 Type 1: Floating Settings Dialog (Transparent Backdrop, Rigid Drag & Embedded Card)
- **No Darkening Scrim (`backdrop.Background(ui.Transparent)`)**: The shells and terminals behind it remain clearly visible for real-time comparison.
- **Dimensions**: `780px ~ 820px` width, `550px ~ 620px` height, `Radius: 14px`, elevated with `floating` shadow.
- **Rigid Draggable Header (44px)**:
  - Drag handle with `items-center` alignment.
  - Left: Title `Settings` (14px, 600) + dirty indicator pill `● Unsaved changes` (amber warning text).
  - Right: `Restore defaults` button, `Apply` button (active when dirty), and `28 × 28px` close button.
- **Interior Two-Column Structure**:
  1. **Left Navigation Rail (`184px`)**:
     - Top Search Row: `Height: 28px`, `Radius: 7px`, `Background: pal.Chip`.
     - Navigation Items: `Height: 32px`, `Radius: 7px`, padding `0 10px`. Active row is raised with `pal.Card` background and `chosen` shadow.
  2. **Right Content Area (Embedded Floating Card)**:
     - Contains an independent elevated card: `Radius: 14px`, `Background: pal.Card`, elevated with `raised` shadow.
     - Card Header: `Height: 44px`, `Padding: 0 18px`, `FontSize: 14.5px`, `FontWeight: 600`.
     - Card Body: Grouped inset setting panels (`Radius: 12px`, `Background: pal.Chip`, vertical padding `4px`, horizontal padding `16px`).
- **Status Footer (`34px`)**:
  - `items-center` aligned, 1px top hairline, 6px status dot (green or red) + 11.5px text.

### 5.2 Type 2: Action & Confirmation Modal (reachDialog 风格)
- Width `430px`, `Radius: 14px`, inner padding `20px`, elevated with `floating` shadow over `pal.Overlay` scrim.

### 5.3 Type 3: Command Palette (palette_panel 风格)
- Inset `84px` from top, width `600px`, max height `460px`, `Radius: 14px`, `50px` search header.

### 5.4 Type 4: Popovers & Quick Pickers (leasePopover 风格)
- Width `320px`, `Radius: 14px`, padding `14px`, elevated with `floating` shadow.

---

## 6. File References

- Ready-to-import CSS variables: [tokens.css](file:///Users/carl/.gemini/config/skills/agent-desktop-ui/references/tokens.css)
- Raw JSON token dictionary: [tokens.json](file:///Users/carl/.gemini/config/skills/agent-desktop-ui/references/tokens.json)
