# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MaverDash is a modern, customizable Kanban board web application built with React, TypeScript, and Tailwind CSS. It features a GitHub dark theme-inspired design with red accent colors and provides comprehensive project management capabilities.

## Technology Stack

- **React 18** with TypeScript for type-safe development
- **Vite 5.4.10** for development and build tooling
- **Tailwind CSS** for styling with custom GitHub dark theme
- **Zustand** for lightweight state management with persistence
- **@dnd-kit** for drag-and-drop functionality
- **Lucide React** for consistent iconography
- **date-fns** for date formatting utilities

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code (if configured)
npm run lint

# Type check
npm run type-check
```

## Project Architecture

### Directory Structure
```
src/
├── components/          # React components
│   ├── Board/          # Main kanban board view
│   ├── Column/         # Column component with drag-drop
│   ├── Card/           # Card component with modal
│   ├── Header/         # Navigation and board selector
│   ├── Modals/         # Modal components (CardModal)
│   └── Welcome/        # Welcome screen for new users
├── hooks/              # Custom React hooks
├── stores/             # Zustand state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── App.tsx            # Main application component
```

### Key Features
- Drag-and-drop Kanban boards with columns and cards
- Local data persistence using Zustand persist middleware
- Import/export functionality for cross-device synchronization
- Customizable boards, columns, cards, labels, and users
- Priority system with visual indicators
- Due date tracking with calendar integration
- Search functionality across all boards and cards
- Keyboard shortcuts (Ctrl+N for new board, Ctrl+E for export)

### State Management
- Uses Zustand for global state with automatic persistence
- Main store: `useBoardStore` in `src/stores/boardStore.ts`
- Handles all CRUD operations for boards, columns, cards, labels, and users
- Automatic data validation and error handling

### Data Models
- **Board**: Contains columns, cards, labels, users, and settings
- **Column**: Ordered container for cards with customizable properties
- **Card**: Rich task items with title, description, labels, assignees, priority, due dates
- **Label**: Colored tags for categorization
- **User**: Team members that can be assigned to cards

### Drag & Drop
- Implemented using @dnd-kit library for React 19 compatibility
- Supports card reordering within columns
- Supports card movement between columns
- Supports column reordering
- Visual feedback during drag operations

## Development Guidelines

### Component Structure
- Components are organized by feature in separate directories
- Each component directory contains the main component file
- Use TypeScript interfaces from `src/types/index.ts`
- Follow the established design system using Tailwind CSS classes

### State Updates
- All state mutations go through Zustand store actions
- Use the provided CRUD operations rather than direct state manipulation
- State is automatically persisted to localStorage

### Styling
- Use the custom color palette defined in `tailwind.config.js`
- Leverage component classes like `.btn-primary`, `.btn-secondary`, `.card`, `.input`
- Follow GitHub dark theme color scheme with red accents

### Data Persistence
- Data is automatically saved to localStorage via Zustand persist
- Export functionality creates JSON files for manual backup
- Import functionality supports JSON file uploads with conflict resolution

## Keyboard Shortcuts

- `Ctrl+N` - Create new board
- `Ctrl+E` - Export all data
- `Escape` - Close modals
- `Enter` - Save forms (cards, columns)
- `Ctrl+Enter` - Save multi-line inputs

## Local Development

The application runs entirely in the browser with no backend dependencies. All data is stored locally using browser localStorage. The development server runs on `http://localhost:5173/` by default.

To add new features:
1. Define TypeScript types in `src/types/index.ts`
2. Add store actions in `src/stores/boardStore.ts`
3. Create components following the established patterns
4. Use the custom hooks and utilities provided