# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PDF Master Tool - A desktop PDF management application built with Electron. Allows merging PDFs, adding page numbers, watermarks, and exporting an index.

## Development

### Commands
```bash
npm install        # Install dependencies
npm start          # Run the app in development
npm run build      # Build for current platform
npm run build:win  # Build Windows portable exe
npm run build:mac  # Build macOS dmg
npm run build:linux # Build Linux AppImage
```

### Project Structure
```
manthan-pdf/
├── main.js                 # Electron main process
├── package.json            # Dependencies and build config
├── src/
│   ├── index.html          # Main HTML file
│   ├── css/
│   │   └── styles.css      # Application styles
│   ├── js/
│   │   └── renderer.js     # Renderer process logic
│   └── assets/
│       └── ca-logo.jpg     # ICAI logo
├── node_modules/
│   ├── pdf-lib/            # PDF manipulation library
│   └── sortablejs/         # Drag-and-drop library
└── dist/                   # Build output
```

## Architecture

**Electron app** with separated concerns:

- **main.js**: Electron main process - creates browser window
- **src/index.html**: UI structure with semantic HTML
- **src/css/styles.css**: CSS with variables for theming
- **src/js/renderer.js**: Application logic

**Dependencies (npm):**
- **pdf-lib**: PDF manipulation - merging, page numbers, watermarks
- **sortablejs**: Drag-and-drop file reordering

**Key components in renderer.js:**
- `fileStore[]` - Array of file objects with unique IDs
- `indexData[]` - Metadata for Excel/CSV export
- SortableJS instance for drag-drop ordering
- Merge process combining PDFs in UI-specified order

**Data flow:**
Files selected -> stored with IDs -> UI list rendered -> user reorders via drag -> merge reads order from DOM -> processes files in that order -> generates merged PDF + index data.

## Branding

- **Firm**: Manthan Ruparelia & Associates
- **Subtitle**: Chartered Accountants (green)
- **Logo**: ICAI CA logo from icaiahmedabad.com
