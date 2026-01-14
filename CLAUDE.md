# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF Master Tool - A desktop PDF management application built with Electron, React, and Vite. Allows merging PDFs, adding page numbers, watermarks, and exporting an index.

## Development

### Commands
```bash
npm install          # Install dependencies
npm run dev          # Start Vite dev server (browser only)
npm run electron:dev # Start with Electron (hot reload)
npm run build        # Build for current platform
npm run build:win    # Build Windows portable exe
npm run build:mac    # Build macOS dmg
npm run build:linux  # Build Linux AppImage
```

### Project Structure
```
manthan-pdf/
├── electron/
│   └── main.js              # Electron main process
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Main App component
│   ├── components/
│   │   ├── Header.jsx       # Branding header
│   │   ├── Settings.jsx     # Page numbers & watermark options
│   │   ├── FileList.jsx     # Drag-and-drop file list
│   │   ├── ActionButtons.jsx # Add/Clear/Merge buttons
│   │   ├── DownloadButtons.jsx # PDF & CSV download
│   │   └── Status.jsx       # Processing status display
│   ├── hooks/
│   │   └── usePdfMerger.js  # PDF merge logic hook
│   ├── styles/
│   │   └── index.css        # Global styles
│   └── assets/
│       └── ca-logo.jpg      # ICAI logo
├── index.html               # Vite entry HTML
├── vite.config.js           # Vite + Electron config
├── package.json             # Dependencies and scripts
└── .github/workflows/
    └── release.yml          # Auto-release on push to main
```

## Architecture

**Tech Stack:**
- **React 19** - UI components
- **Vite 7** - Build tool with HMR
- **Electron 39** - Desktop wrapper
- **pdf-lib** - PDF manipulation
- **SortableJS** - Drag-and-drop

**Component Structure:**
- `App.jsx` - State management, orchestrates child components
- `usePdfMerger` hook - PDF processing logic (merge, page numbers, watermarks)
- Components are pure/presentational where possible

**Data Flow:**
1. User adds files → stored in `files` state array
2. User reorders via drag → `onReorder` updates state
3. User clicks merge → `usePdfMerger.mergePdfs()` processes files
4. On success → download buttons appear

## CI/CD

GitHub Actions workflow (`.github/workflows/release.yml`):
- Triggers on push to `main`
- Auto-increments version
- Builds Windows (.exe) and macOS (.dmg)
- Creates GitHub Release with artifacts

## Branding

- **Firm**: Manthan Ruparelia & Associates
- **Subtitle**: Chartered Accountants (green)
- **Logo**: ICAI CA logo
