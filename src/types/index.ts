export interface Label {
  id: string;
  name: string;
  color: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  email?: string;
}

export type Priority = 'low' | 'medium' | 'high';

export interface Card {
  id: string;
  title: string;
  description?: string;
  labels: Label[];
  assignees: string[];
  dueDate?: Date;
  priority: Priority;
  createdAt: Date;
  updatedAt: Date;
  columnId: string;
  position: number;
}

export interface Column {
  id: string;
  title: string;
  color: string;
  cardIds: string[];
  wipLimit?: number;
  position: number;
  boardId: string;
}

export interface BoardSettings {
  allowDescriptions: boolean;
  allowLabels: boolean;
  allowAssignees: boolean;
  allowDueDates: boolean;
  allowPriorities: boolean;
  wipLimitsEnabled: boolean;
  theme: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  columns: Column[];
  cards: Record<string, Card>;
  labels: Label[];
  users: User[];
  settings: BoardSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppState {
  boards: Record<string, Board>;
  currentBoardId: string | null;
  searchQuery: string;
  isLoading: boolean;
  error: string | null;
}

export interface DragEndEvent {
  active: {
    id: string;
    data: {
      current?: {
        type: 'card' | 'column';
        columnId?: string;
        boardId?: string;
      };
    };
  };
  over: {
    id: string;
    data: {
      current?: {
        type: 'card' | 'column';
        columnId?: string;
        boardId?: string;
      };
    };
  } | null;
}

export interface ExportData {
  version: string;
  exportDate: Date;
  boards: Record<string, Board>;
}

export interface ImportOptions {
  mergeStrategy: 'replace' | 'merge' | 'skip';
  includeSettings: boolean;
}