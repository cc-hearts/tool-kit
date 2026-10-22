---
name: agent-desktop-ui
description: >-
  Design system, UI component specifications, layout architecture, color palette, dark mode tokens,
  and elevation system for modern desktop agent tools. Use whenever designing, building, or styling applications
  following modern Agent desktop tools, macOS-native aesthetic, floating card layout, inset grouped settings, or custom color wash gradients.
---

# Agent Desktop UI Design System & Implementation Guide

This skill encapsulates the complete design system and UI engineering standards of modern desktop agent tools. It merges **macOS Human Interface Guidelines (HIG)**, **Mitchell Hashimoto's Rex aesthetic**, and modern developer tool refinement.

When designing or building applications following this system, adhere strictly to the tokens, geometry, and component behaviors outlined below.

---

## 1. Core Philosophy & Aesthetic Principles

1. **Floating Card Canvas**: Windows do not use edge-to-edge flat panels or dividing border lines. The primary content and terminal views live on **rounded floating cards (`14px` radius)** that maintain a strict `8px` perimeter gap (`cardGap`) away from all window outer frames and the sidebar.
2. **Solid Background First (Plain by Default)**: The window background **defaults to and prioritizes a clean, distraction-free solid color** (`#eceef4` in light mode, `#141418` in dark mode). This ensures maximum visual contrast and keeps focus strictly on the active terminal cards and code. Optional color wash gradients (Rex, Mist, Meadow, Dusk) are available for personalized themes and interpolate smoothly in **Oklab color space**. When system translucency (Vibrancy) is enabled, the solid base gracefully allows desktop wallpaper luminance to breathe through (`alpha: 0.82 ~ 0.95`).
3. **Borderless Elevation**: In light mode, **avoid harsh 1px black stroke borders** (`border: none`); surfaces stand out via compound subtle shadows. Do not place horizontal dividing lines under the titlebar, vertical borders between the sidebar and canvas, or borderlines above the sidebar footer. In dark mode, employ a top-lit hairline (**Lit Edge**) over tight shadows.
4. **Unified macOS Structure**: Traffic lights (Close, Minimize, Maximize) live in the top-left of the sidebar (inside its 44px header), aligning horizontally with the card's internal header.
5. **AppKit-Grade Micro-Interactions**: Controls feature native macOS tactile feedback—including spring physics on toggles, lens enlargement on sliders, hard-edged scroll frosts, and popups that open directly over their trigger button.

---

## 2. Color System & Palettes

All colors are paired with their exact hexadecimal or RGBA values across Light and Dark appearances.

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

### 2.3 Terminal 16-Color Palette (Apple Tuned)

Derived from Apple's system palette tuned to read sharply against the card surface (`#ffffff` light, `#232328` dark):

| Color Index | Light Hex | Dark Hex | Role |
| :--- | :--- | :--- | :--- |
| **0 (Black)** | `#1d1d1f` | `#3a3a40` | Base black / background dark shade |
| **1 (Red)** | `#d3302f` | `#ff6b64` | Standard error / git deleted |
| **2 (Green)** | `#22863a` | `#4fd17a` | Git added / success / prompt branch |
| **3 (Yellow)** | `#b08800` | `#f2c14e` | Warnings / commit sha |
| **4 (Blue)** | `#2f5bd8` | `#6b9bff` | Directories / info |
| **5 (Magenta)** | `#a033c4` | `#d07cf0` | Keywords / language symbols |
| **6 (Cyan)** | `#0f8199` | `#4cc9e0` | Special characters / links |
| **7 (White)** | `#8e8e93` | `#c9c9cf` | Light grey / foreground mute |
| **Selection** | `#cfdcfb` | `#2f4170` | Text highlight selection background |

### 2.4 Window Background Appearance (Plain Preferred + 4 Washes)

The design system prioritizes a **quiet, solid background by default** to minimize eye strain and preserve maximum content hierarchy. Decorative wash gradients remain supported as user-selectable options.

1. **Plain (Solid, Default & Preferred)**:
   - Light: `#eceef4` (no glow)
   - Dark: `#141418` (no glow)
   - With Vibrancy enabled: background alpha adjusts to `0.82` (light) or `0.88` (dark) to allow subtle desktop material to show through.

2. **Rex (Optional Wash - Lavender, rose, and butter cream)**:
   - Light Base: `['#ebe0f3', '#f3e7f1', '#f7eee4', '#f6efcf']` | Glow: `rgba(247, 220, 241, 0.75)`
   - Dark Base: `['#17141f', '#191620', '#1b1916']` | Glow: `rgba(120, 70, 120, 0.22)`
3. **Mist (Optional Wash - Cool slate blue)**:
   - Light Base: `['#e3e9f4', '#ebeff6', '#f1f2f3', '#f2f1ec']` | Glow: `rgba(210, 225, 248, 0.75)`
   - Dark Base: `['#12151b', '#14171d', '#17181b']` | Glow: `rgba(70, 100, 150, 0.22)`
4. **Meadow (Optional Wash - Fresh grass green)**:
   - Light Base: `['#e2eee5', '#ebf2e7', '#f3f2e2', '#f5f0d6']` | Glow: `rgba(214, 240, 222, 0.75)`
   - Dark Base: `['#111814', '#141a16', '#181a14']` | Glow: `rgba(70, 130, 95, 0.2)`
5. **Dusk (Optional Wash - Sunset rose & peach)**:
   - Light Base: `['#e4dbf3', '#efdeee', '#f6e3dc', '#f7e6cf']` | Glow: `rgba(246, 206, 222, 0.8)`
   - Dark Base: `['#191321', '#1e161e', '#221a17']` | Glow: `rgba(150, 80, 110, 0.25)`

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
  border: 1px solid rgba(236, 236, 240, 0.12);
  border-image: linear-gradient(180deg, rgba(236, 236, 240, 0.18), rgba(236, 236, 240, 0.06)) 1;
  box-shadow: 0 1px 1px 0 rgba(0, 0, 0, 0.2),
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

### 3.4 Floating (Command Palette, Confirm Dialogs)
- **Light**: `box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 16px 40px 0 rgba(20, 20, 40, 0.14);`
- **Dark**: Lit Edge + `box-shadow: 0 1px 1px 0 rgba(0,0,0,0.2), 0 2px 2px -1px rgba(0,0,0,0.2), 0 4px 6px -3px rgba(0,0,0,0.24), 0 16px 40px 0 rgba(0, 0, 0, 0.45);`

---

## 4. Cross-Platform Window Frame & Window Controls

To deliver a true desktop-native feel across OS environments, window chrome MUST diverge between macOS and Windows/Linux. Do not render generic pseudo-Mac traffic lights on Windows, and do not draw duplicate close buttons on macOS.

```
macOS Frame (AppKit System Traffic Lights on Left)
┌────────────────────────────────────────────────────────┐
│ [•][•][•] (X:18, Y:23)     Card Header      Card Tools │
└────────────────────────────────────────────────────────┘

Windows / Linux Frame (Custom Precision Flat Buttons on Right)
┌────────────────────────────────────────────────────────┐
│ App Icon / Title           Card Header    [-] [□] [×]  │
│                                           (W:28, H:26) │
└────────────────────────────────────────────────────────┘
```

### 4.1 macOS Frame (Native Inset Traffic Lights)
- **Window Configuration**:
  ```go
  o.TitleBarStyle = mygo.TitleBarHiddenInset
  o.TrafficLightPosition = &mygo.Point{X: 18, Y: uitokens.TopBar/2 - 7} // X:18, Y:23
  ```
- **AppKit Native Integrity**:
  - The three dots (Close, Minimize, Zoom) are drawn entirely by macOS AppKit, preserving OS-native hover icons, color nuances, and disabled greying when unfocused.
  - **No Duplicate Controls**: Never draw a custom close or minimize icon on macOS in the top chrome.
- **Header Lead & Spacing**:
  - The view lays out its content around `c.TitleBar.Left`.
  - Leading content must start at `titleBarLead = TitleBar.Left + 8px` (default fallback `12px`), guaranteeing zero collision with the system traffic lights.

### 4.2 Windows & Linux Frame (Precision Flat Controls)
- **Window Configuration**:
  ```go
  o.TitleBarStyle = mygo.TitleBarHidden
  o.HideWindowButtons = true
  o.AutoHideMenuBar = true // Menu bar hides until Alt is pressed
  ```
- **Control Group Geometry**:
  - Position: Absolute pinned at top-right:
    ```go
    Right: uitokens.CardGap + 10 // 18px from right edge
    Top:   (uitokens.TopBar - 26) / 2 // 17px vertically centered on 60px bar
    ```
  - Layout: `Height: 26px`, `Gap: 2px`, `AlignItems: Center`.
  - Individual Button Size: `28px (width) × 26px (height)`, `border-radius: 4px ~ 6px`.
- **Three Button Behaviors**:
  1. **Minimize**:
     - SVG Glyph: `<path d="M5 12h14"/>` (Lucide 24-unit grid).
     - Hover: `pal.RowHover`, Text: `pal.Text`.
  2. **Maximize / Restore**:
     - State-aware icon:
       - Normal: `<rect width="14" height="14" x="5" y="5" rx="2"/>` (Maximize).
       - Maximized: Double overlapping squares `<rect width="10" height="10" x="9" y="9" rx="1.5"/>...` (Restore).
     - **Windows 11 Snap Layouts**: MUST attach native maximize behavior (e.g. `b.MaximizeButton()`). On Windows 11, hovering over this button automatically invokes the OS Snap Layouts popup; regular tooltips must be suppressed to avoid obscuring snap presets.
  3. **Close (Dangerous Action)**:
     - SVG Glyph: Standard diagonal cross (`iconClose`).
     - Normal: Quiet text color (`pal.TextMuted`).
     - **Hover & Pressed**: Surface switches to `pal.Danger` (`#d93a35` in light, `#ff6961` in dark), and the cross glyph switches to pure white (`#ffffff`).

---

## 5. Dialog & Modal Surfaces Architecture

Agent desktop applications employ three distinct dialog archetypes depending on context and consequence.

```
1. Floating Settings Dialog (No Scrim, Rigid Drag)
┌────────────────────────────────────────────────────────┐
│ ┌────────────────────────────────────────────────────┐ │
│ │ ⠶ Settings (Draggable)            [Apply] [✕]      │ │ <- Transparent backdrop,
│ │ ────────────────────────────────────────────────── │ │    workplace stays visible!
│ │ Navigation   │ Settings Content Card               │ │
│ └────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘

2. Action Confirm Modal (Scrim Overlay)   3. Command Palette (Top Inset)
┌────────────────────────┐                ┌────────────────────────┐
│ Delete Machine?        │                │ 🔍 Type a command...   │
│ This action is final.  │                ├────────────────────────┤
│         [Cancel] [OK]  │                │ > Session 1 · dev      │
└────────────────────────┘                │ > Settings · Appearance│
  (380px - 430px, Dim Scrim)              └────────────────────────┘
```

### 5.1 Type 1: Floating Settings Dialog (Transparent Backdrop & Rigid Drag)
- **Core Philosophy (No Scrim)**:
  - Setting changes (appearance wash, terminal font, line height, theme colors) affect the active workspace directly.
  - **No darkening scrim (`backdrop.Background(ui.Transparent)`)**: The dialog acts as an independent floating window. The shells and workspace behind it remain clearly visible for real-time visual comparison.
- **Dimensions & Responsive Fitting**:
  - `panelWidth = min(820, windowWidth - 64)`
  - `panelHeight = min(620, windowHeight - 64)`
  - Surface: `Radius: 14px`, `Clip()`, elevated with `floating` shadow, filled with the active window's `Wash.Base`.
- **Rigid Draggable Header**:
  - Header is the drag handle (`Height: 44px`, `Cursor: CursorGrab`).
  - **Margin Bounds Rule**: Dragging must be bound to prevent the dialog from escaping the viewport:
    ```go
    dragBounds = ui.Rect{
        X: 12 - (width - panelW)/2,
        Y: 12 - (height - panelH)/2,
        W: max(0, width - panelW - 24),
        H: max(0, height - panelH - 24),
    }
    ```
- **Header Actions & Close Button**:
  - Left: Title `Settings` (`14px`, `font-weight: 600`, `pal.Text`).
  - Right:
    - Status marker: if dirty, display amber warning text `● Unsaved changes`.
    - Secondary: `Restore defaults` button.
    - Primary: `Apply` button (only enabled/offered when dirty).
    - Close Icon Button: `28 × 28px` square button with `iconClose` (`size * 0.55`).

### 5.2 Type 2: Action & Confirmation Modal (Scrim Overlay)
- **Use Case**: Destructive actions (Restart daemon, Delete session, Reset configuration, Network takeover permission).
- **Backdrop Scrim**: `pal.Overlay` (`rgba(10, 10, 30, 0.12)` in light, `rgba(0, 0, 0, 0.35)` in dark).
- **Geometry**: Fixed width `380px ~ 430px`, `Radius: 14px`, inner padding `18px ~ 22px`, gap `8px ~ 10px`.
- **Vertical Hierarchy**:
  1. Title: `14px ~ 15px`, `font-weight: 600`, `pal.Text`.
  2. Detail / Warning: `11px ~ 13px`, `pal.TextMuted`, `line-height: 1.4`.
  3. Error banner (if active): `11px`, `pal.Danger`.
  4. Button Row: Margined top `14px`, right-aligned (`Justify: End`), gap `8px`:
     - Cancel button (mapped to `Esc`).
     - Action button (mapped to `Enter`, marked primary or danger).

### 5.3 Type 3: Command Palette (Floating Dropdown)
- **Use Case**: `Cmd+K` / `Cmd+P` quick switcher for sessions, machines, and commands.
- **Position**: Dropped `84px` from the window top, centered horizontally.
- **Geometry**: Width `560px ~ 600px`, max height `460px`, `Radius: 14px`, `floating` shadow.
- **Header Search Row**: `Height: 50px`, auto-focused 15px text field with search icon, no border.
- **Interactive List**: Tracked scroll list, fuzzy match score ranking, keyboard arrow navigation (`Up/Down`, `Ctrl+P/N`), `Enter` to run, `Esc` to close.

---

## 6. Settings View Architecture

### 6.1 Window Geometry & Layout Architecture

- **Window Dimensions**: `820 × 620` (Min: `700 × 480`, Default preview: `1060 × 720`).
- **Unified Borderless Layout**:
  - The window under-surface is by default a clean, distraction-free solid color (`#eceef4` in light mode, `#141418` in dark mode), with optional Oklab wash gradients available as user preferences.
  - Do NOT divide the window with horizontal top lines or vertical sidebar lines.
  - Left navigation sidebar: `212px` fixed width, full window height.
  - Traffic lights (Close, Minimize, Zoom): located in the sidebar header at `height: 44px`, vertically centered at `y = 22px`, `padding-left: 14px`.
- **Right Floating Content Card**:
  - `14px` border-radius (`--agent-radius-card`).
  - Strict `8px` perimeter gap (`--agent-gap-card`) on all 4 sides: top, right, bottom, and left (from sidebar).
  - Inner scroll content constrained to `max-width: 620px ~ 640px`.
  - Borderless elevation in light mode (`--agent-shadow-raised`), top-lit hairline in dark mode.
- **Card Header & Dynamic Hard Scroll Edge**:
  - Header bar: `44px` height (`barMid = 30px`, `cardGap = 8px`), aligns horizontally with sidebar header.
  - Houses the view title, subtitle, and card tools (theme mode switcher, wash gradient selector, primary/secondary action buttons).
  - Dynamic Hard Scroll Edge: when scrolled down (`Y > 0.5`), the header gains frosted backdrop-blur (`backdrop-filter: blur(16px)`) with a 160ms fade.
- **Corner Preservation Rule (Backdrop-Filter Clipping Gotcha)**:
  - In Chromium and WebKit, elements with `backdrop-filter` create an isolated GPU compositing surface that can bypass an ancestor's `overflow: hidden; border-radius`.
  - **MANDATORY**: The `.card-header` element MUST explicitly declare:
    ```css
    border-top-left-radius: var(--agent-radius-card);
    border-top-right-radius: var(--agent-radius-card);
    ```
  - **MANDATORY**: The parent `.agent-floating-card` container MUST declare:
    ```css
    isolation: isolate;
    transform: translateZ(0);
    ```
    This ensures that when the user scrolls and the frosted glass header activates, the card's top rounded corners remain strictly preserved at `14px` without squaring off.

### 6.2 Grouped Inset List Pattern
```
┌────────────────────────────────────────────────────────┐
│ GROUP TITLE (12px, font-weight: 600, pal.textMuted)    │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Setting Label 1                        [ Control ] │ │
│ │ Optional description below label                   │ │
│ │ ────────────────────────────────────────────────── │ │ <- 1px pal.text.Alpha(0.07)
│ │ Setting Label 2                        [ Control ] │ │
│ └────────────────────────────────────────────────────┘ │ <- Radius 12px, Background pal.chip
│ Footer note (12px, pal.textFaint, line-height 1.4)     │
└────────────────────────────────────────────────────────┘
```
- Group Panel: `Radius(12)`, `Background(pal.chip)`, vertical padding `4px`, horizontal padding `16px`.
- Setting Row: vertical padding `11px`, gap `16px`, row height approx `44px`.
- Dividers: `1px` high, placed between consecutive rows (never at top or bottom outer edge).

---

## 7. Form Control Specifications

### 7.1 Toggle Switch (`toggle`)
- **Dimensions**: `38 × 22px`, `radius: 11px`, `padding: 2px`.
- **Thumb**: `18 × 18px`, `radius: 9px`, `#ffffff`, shadow: `0 1px 2px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.06)`.
- **Physics**: Travels `16px`. Spring animation: `Duration: 260ms`, `Bounce: 0.15`.
- **Track**: Inactive `pal.text.Alpha(0.14)` (dark: `0.20`), Active `pal.accent`.

### 7.2 Segmented Control (`segmented`)
- **Track**: `height: 24px`, `radius: 7px`, `padding: 2px`, background `rgba(0,0,0,0.06)` (dark: `rgba(255,255,255,0.07)`).
- **Segment Thumb**: `radius: 5px`, `#ffffff`, shadow: `0 0.5px 1.5px rgba(0,0,0,0.16), 0 0 0 0.5px rgba(0,0,0,0.04)` (dark: `rgba(255,255,255,0.2)` with dark drop shadow).
- **Separators**: `1px` wide, `12px` tall, hidden adjacent to selected segment.

### 7.3 Pop-up Button (`popup`)
- **Dimensions**: `height: 28px`, capsule `radius: 14px`, padding `0 3px 0 10px`, gap `6px`.
- **Chevron Disc**: `22 × 22px` circle with `lucide-chevrons-up-down` icon (`16 × 16px`).
- **Placement Logic**: The menu opens **directly over the button**, with the currently selected menu row aligning directly on top of the button text.

### 7.4 Slider (`slider`)
- **Dimensions**: `height: 24px`, track `height: 4px`, track radius `2px`.
- **Thumb**: `20 × 16px`, capsule radius `8px`.
- **Lens Effect**: When pressed (`held > 0`), the thumb expands by `35%` (`1 + 0.35 * held`) in `150ms`, transforming into a semi-transparent glass lens (`rgba(255,255,255,0.1)`) that shows the track beneath it.

### 7.5 Text Input (`textField`)
- **Dimensions**: `height: 26px`, `radius: 7px`, padding `0 8px`.
- **Frame**: Inset border `rgba(0,0,0,0.13)` (dark: `rgba(255,255,255,0.13)`).
- **Focus Glow**: `120ms` transition into `box-shadow: 0 0 0 3.5px pal.accent.Alpha(0.32), inset 0 0 0 1px pal.accent.Alpha(0.75)`.

### 7.6 Button (`button`)
- **Dimensions**: `height: 30px`, `radius: 8px`, padding `0 14px`, gap `8px`.
- **Primary**: `pal.accent` fill, white text, lighten by 8% on hover.
- **Secondary**: `pal.control` fill with control shadow, darken by 8% on press.

---

## 8. Search & Highlighting Engine

- **Three-Way Matching**: Settings entries match against user-visible label, config file key (e.g. `session-name`), and search aliases.
- **Auto-Navigation & Scroll**: Typing in the sidebar search switches to the first matching page and executes `ScrollIntoView()` on the top hit.
- **Highlight Pill (`searchHighlight`)**:
  - The matched row displays an animated focus pill:
  - Radius: `8px`, expanded `dx` / `dy` around content.
  - Background: `pal.accent.Alpha(0.13 * t)`.
  - Inset stroke: `pal.accent.Alpha(0.28 * t)`.
  - Transition: `180ms`.

---

## 9. Motion & Physics Reference

- **Sidebar Slide**: `260ms`, `CubicBezier(0.25, 1, 0.5, 1)`.
- **Card Relocation / Pane Drag**: Spring `Duration: 420ms`, `Bounce: 0.18`.
- **Color Transitions (Hover/Active)**: `90ms ~ 120ms` linear or ease-out.
- **Unfocused Pane Veil**: `160ms` fade.

---

## 10. File References

- Ready-to-import CSS variables: [tokens.css](file:///Users/carl/.gemini/config/skills/agent-desktop-ui/references/tokens.css)
- Raw JSON token dictionary: [tokens.json](file:///Users/carl/.gemini/config/skills/agent-desktop-ui/references/tokens.json)
