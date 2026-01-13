# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a client-side PDF management tool built as a single HTML file (`Pro_PDF_Manager.html`). It runs entirely in the browser with no build process or server required.

## Development

To work on this project, simply open `Pro_PDF_Manager.html` in a web browser. No build commands, package manager, or development server needed.

## Architecture

**Single-file application** using:
- **pdf-lib** (CDN): PDF manipulation - merging documents, adding page numbers, watermarks
- **SortableJS** (CDN): Drag-and-drop file reordering

**Key components in the HTML file:**
- CSS variables and styles in `<style>` block
- UI with settings (page numbers, watermarks), file list, and action buttons
- JavaScript managing:
  - `fileStore[]` - array of file objects with unique IDs
  - `indexData[]` - metadata for Excel/CSV export
  - SortableJS instance for drag-drop ordering
  - Merge process that combines PDFs in UI-specified order
  - Export functions for merged PDF and CSV index

**Data flow:** Files selected -> stored with IDs -> UI list rendered -> user reorders via drag -> merge reads order from DOM -> processes files in that order -> generates merged PDF + index data.