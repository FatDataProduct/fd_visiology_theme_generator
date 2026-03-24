# Visiology Theme Builder (VTB)

Visual theme constructor for the Visiology BI platform. Build and customize dashboard themes through an intuitive GUI, then export a ready-to-import JSON file.

## Features

- **Palette Builder** — generate 10 harmonious colors from a single seed color, or customize each one manually
- **Live Preview** — SVG dashboard mockup with 8 widget types (bar, column, line, pie, gauge, indicator, table, filter) that updates instantly
- **Widget Shell Styler** — configure title, frame, background, and shadow for all widgets
- **Chart / Table / KPI / Filter Stylers** — fine-tune axes, legends, data labels, table borders, indicator trends, and filter appearance
- **Light ↔ Dark** — one-click palette reverse with WCAG-aware contrast handling
- **Import / Export JSON** — load existing Visiology themes and export valid JSON preserving all `$type` namespaces
- **Global Tokens** — fonts, font sizes, line height, border radius

## Tech Stack

- React 18, TypeScript, Vite
- Zustand (state management)
- culori (color manipulation)
- lucide-react (icons)
- react-hot-toast (notifications)

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
```

Output goes to `dist/` — deploy as static files to any hosting.

## Project Structure

```
src/
├── types/visiology.ts       # TypeScript interfaces for Visiology JSON schema
├── assets/
│   ├── defaultTheme.ts      # Default theme wrapper
│   └── referenceTheme.json  # Reference "Энергия" theme (full JSON)
├── store/themeStore.ts      # Zustand store — single source of truth
├── lib/
│   ├── paletteGen.ts        # HSL palette generator from seed color
│   ├── darkReverse.ts       # Light↔Dark color inversion
│   ├── exporter.ts          # Theme validation and JSON export
│   └── importer.ts          # JSON import and parsing
├── components/
│   ├── TopBar.tsx            # App header with import/export/mode toggle
│   ├── panels/
│   │   ├── PalettePanel.tsx  # Left panel — palette + global tokens
│   │   ├── DetailStyler.tsx  # Right panel — tab container
│   │   └── tabs/
│   │       ├── WidgetShellTab.tsx
│   │       ├── ChartStylerTab.tsx
│   │       ├── TableStylerTab.tsx
│   │       ├── IndicatorStylerTab.tsx
│   │       └── FilterStylerTab.tsx
│   └── preview/
│       ├── LivePreview.tsx   # Center panel — zoom/bg controls
│       └── DashboardPreview.tsx  # SVG dashboard with widget stubs
├── App.tsx
├── main.tsx
└── index.css
```
