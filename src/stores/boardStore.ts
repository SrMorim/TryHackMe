import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { Board, Card, Column, Label, User, AppState, BoardSettings } from '../types';

interface BoardActions {
  // Board actions
  createBoard: (title: string, description?: string) => string;
  updateBoard: (boardId: string, updates: Partial<Board>) => void;
  deleteBoard: (boardId: string) => void;
  setCurrentBoard: (boardId: string | null) => void;
  duplicateBoard: (boardId: string) => string;
  
  // Column actions
  createColumn: (boardId: string, title: string, color?: string) => string;
  updateColumn: (boardId: string, columnId: string, updates: Partial<Column>) => void;
  deleteColumn: (boardId: string, columnId: string) => void;
  reorderColumns: (boardId: string, startIndex: number, endIndex: number) => void;
  
  // Card actions
  createCard: (boardId: string, columnId: string, title: string, description?: string) => string;
  updateCard: (boardId: string, cardId: string, updates: Partial<Card>) => void;
  deleteCard: (boardId: string, cardId: string) => void;
  moveCard: (boardId: string, cardId: string, sourceColumnId: string, targetColumnId: string, position: number) => void;
  reorderCards: (boardId: string, columnId: string, startIndex: number, endIndex: number) => void;
  
  // Label actions
  createLabel: (boardId: string, name: string, color: string) => string;
  updateLabel: (boardId: string, labelId: string, updates: Partial<Label>) => void;
  deleteLabel: (boardId: string, labelId: string) => void;
  
  // User actions
  createUser: (boardId: string, name: string, email?: string, avatar?: string) => string;
  updateUser: (boardId: string, userId: string, updates: Partial<User>) => void;
  deleteUser: (boardId: string, userId: string) => void;
  
  // Utility actions
  setSearchQuery: (query: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Import/Export actions
  exportData: () => string;
  importData: (data: string, mergeStrategy?: 'replace' | 'merge') => void;
  
  // Initialize with sample data
  initializeSampleData: () => void;
}

const createDefaultBoardSettings = (): BoardSettings => ({
  allowDescriptions: true,
  allowLabels: true,
  allowAssignees: true,
  allowDueDates: true,
  allowPriorities: true,
  wipLimitsEnabled: false,
  theme: 'github-dark',
});

export const useBoardStore = create<AppState & BoardActions>()(
  persist(
    (set, get) => ({
      // Initial state
      boards: {},
      currentBoardId: null,
      searchQuery: '',
      isLoading: false,
      error: null,

      // Board actions
      createBoard: (title: string, description?: string) => {
        const boardId = uuidv4();
        const now = new Date();
        
        const newBoard: Board = {
          id: boardId,
          title,
          description,
          columns: [],
          cards: {},
          labels: [],
          users: [],
          settings: createDefaultBoardSettings(),
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          boards: { ...state.boards, [boardId]: newBoard },
          currentBoardId: boardId,
        }));

        return boardId;
      },

      updateBoard: (boardId: string, updates: Partial<Board>) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                ...updates,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      deleteBoard: (boardId: string) => {
        set((state) => {
          const { [boardId]: deletedBoard, ...remainingBoards } = state.boards;
          const newCurrentBoardId = state.currentBoardId === boardId 
            ? Object.keys(remainingBoards)[0] || null 
            : state.currentBoardId;

          return {
            boards: remainingBoards,
            currentBoardId: newCurrentBoardId,
          };
        });
      },

      setCurrentBoard: (boardId: string | null) => {
        set({ currentBoardId: boardId });
      },

      duplicateBoard: (boardId: string) => {
        const state = get();
        const originalBoard = state.boards[boardId];
        if (!originalBoard) return '';

        const newBoardId = uuidv4();
        const now = new Date();
        
        const duplicatedBoard: Board = {
          ...originalBoard,
          id: newBoardId,
          title: `${originalBoard.title} (Copy)`,
          createdAt: now,
          updatedAt: now,
          columns: originalBoard.columns.map(col => ({ ...col, id: uuidv4(), boardId: newBoardId })),
          cards: Object.fromEntries(
            Object.entries(originalBoard.cards).map(([_, card]) => {
              const newCardId = uuidv4();
              return [newCardId, { ...card, id: newCardId, createdAt: now, updatedAt: now }];
            })
          ),
        };

        set((state) => ({
          boards: { ...state.boards, [newBoardId]: duplicatedBoard },
          currentBoardId: newBoardId,
        }));

        return newBoardId;
      },

      // Column actions
      createColumn: (boardId: string, title: string, color = '#6b7280') => {
        const columnId = uuidv4();
        const now = new Date();

        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const newColumn: Column = {
            id: columnId,
            title,
            color,
            cardIds: [],
            position: board.columns.length,
            boardId,
          };

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: [...board.columns, newColumn],
                updatedAt: now,
              },
            },
          };
        });

        return columnId;
      },

      updateColumn: (boardId: string, columnId: string, updates: Partial<Column>) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: board.columns.map(col =>
                  col.id === columnId ? { ...col, ...updates } : col
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      deleteColumn: (boardId: string, columnId: string) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const column = board.columns.find(col => col.id === columnId);
          if (!column) return state;

          // Remove cards that belong to this column
          const newCards = Object.fromEntries(
            Object.entries(board.cards).filter(([_, card]) => card.columnId !== columnId)
          );

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: board.columns.filter(col => col.id !== columnId),
                cards: newCards,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      reorderColumns: (boardId: string, startIndex: number, endIndex: number) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const newColumns = [...board.columns];
          const [reorderedColumn] = newColumns.splice(startIndex, 1);
          newColumns.splice(endIndex, 0, reorderedColumn);

          // Update positions
          newColumns.forEach((col, index) => {
            col.position = index;
          });

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: newColumns,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // Card actions
      createCard: (boardId: string, columnId: string, title: string, description?: string) => {
        const cardId = uuidv4();
        const now = new Date();

        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const column = board.columns.find(col => col.id === columnId);
          if (!column) return state;

          const newCard: Card = {
            id: cardId,
            title,
            description,
            labels: [],
            assignees: [],
            priority: 'medium',
            createdAt: now,
            updatedAt: now,
            columnId,
            position: column.cardIds.length,
          };

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                cards: { ...board.cards, [cardId]: newCard },
                columns: board.columns.map(col =>
                  col.id === columnId
                    ? { ...col, cardIds: [...col.cardIds, cardId] }
                    : col
                ),
                updatedAt: now,
              },
            },
          };
        });

        return cardId;
      },

      updateCard: (boardId: string, cardId: string, updates: Partial<Card>) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board || !board.cards[cardId]) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                cards: {
                  ...board.cards,
                  [cardId]: {
                    ...board.cards[cardId],
                    ...updates,
                    updatedAt: new Date(),
                  },
                },
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      deleteCard: (boardId: string, cardId: string) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board || !board.cards[cardId]) return state;

          const card = board.cards[cardId];
          const { [cardId]: deletedCard, ...remainingCards } = board.cards;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                cards: remainingCards,
                columns: board.columns.map(col =>
                  col.id === card.columnId
                    ? { ...col, cardIds: col.cardIds.filter(id => id !== cardId) }
                    : col
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      moveCard: (boardId: string, cardId: string, sourceColumnId: string, targetColumnId: string, position: number) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board || !board.cards[cardId]) return state;

          const updatedColumns = board.columns.map(col => {
            if (col.id === sourceColumnId) {
              return { ...col, cardIds: col.cardIds.filter(id => id !== cardId) };
            }
            if (col.id === targetColumnId) {
              const newCardIds = [...col.cardIds];
              newCardIds.splice(position, 0, cardId);
              return { ...col, cardIds: newCardIds };
            }
            return col;
          });

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                cards: {
                  ...board.cards,
                  [cardId]: {
                    ...board.cards[cardId],
                    columnId: targetColumnId,
                    position,
                    updatedAt: new Date(),
                  },
                },
                columns: updatedColumns,
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      reorderCards: (boardId: string, columnId: string, startIndex: number, endIndex: number) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const column = board.columns.find(col => col.id === columnId);
          if (!column) return state;

          const newCardIds = [...column.cardIds];
          const [reorderedCardId] = newCardIds.splice(startIndex, 1);
          newCardIds.splice(endIndex, 0, reorderedCardId);

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                columns: board.columns.map(col =>
                  col.id === columnId ? { ...col, cardIds: newCardIds } : col
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // Label actions
      createLabel: (boardId: string, name: string, color: string) => {
        const labelId = uuidv4();

        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const newLabel: Label = { id: labelId, name, color };

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                labels: [...board.labels, newLabel],
                updatedAt: new Date(),
              },
            },
          };
        });

        return labelId;
      },

      updateLabel: (boardId: string, labelId: string, updates: Partial<Label>) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                labels: board.labels.map(label =>
                  label.id === labelId ? { ...label, ...updates } : label
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      deleteLabel: (boardId: string, labelId: string) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                labels: board.labels.filter(label => label.id !== labelId),
                cards: Object.fromEntries(
                  Object.entries(board.cards).map(([cardId, card]) => [
                    cardId,
                    { ...card, labels: card.labels.filter(label => label.id !== labelId) }
                  ])
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // User actions
      createUser: (boardId: string, name: string, email?: string, avatar?: string) => {
        const userId = uuidv4();

        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          const newUser: User = { id: userId, name, email, avatar };

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                users: [...board.users, newUser],
                updatedAt: new Date(),
              },
            },
          };
        });

        return userId;
      },

      updateUser: (boardId: string, userId: string, updates: Partial<User>) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                users: board.users.map(user =>
                  user.id === userId ? { ...user, ...updates } : user
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      deleteUser: (boardId: string, userId: string) => {
        set((state) => {
          const board = state.boards[boardId];
          if (!board) return state;

          return {
            boards: {
              ...state.boards,
              [boardId]: {
                ...board,
                users: board.users.filter(user => user.id !== userId),
                cards: Object.fromEntries(
                  Object.entries(board.cards).map(([cardId, card]) => [
                    cardId,
                    { ...card, assignees: card.assignees.filter(assigneeId => assigneeId !== userId) }
                  ])
                ),
                updatedAt: new Date(),
              },
            },
          };
        });
      },

      // Utility actions
      setSearchQuery: (query: string) => set({ searchQuery: query }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),

      // Import/Export actions
      exportData: () => {
        const state = get();
        const exportData = {
          version: '1.0.0',
          exportDate: new Date(),
          boards: state.boards,
        };
        return JSON.stringify(exportData, null, 2);
      },

      importData: (data: string, mergeStrategy = 'merge') => {
        try {
          const importData = JSON.parse(data);
          
          set((state) => {
            if (mergeStrategy === 'replace') {
              return {
                ...state,
                boards: importData.boards,
                currentBoardId: Object.keys(importData.boards)[0] || null,
              };
            } else {
              // Merge strategy
              return {
                ...state,
                boards: { ...state.boards, ...importData.boards },
              };
            }
          });
        } catch (error) {
          console.error('Failed to import data:', error);
          set({ error: 'Failed to import data. Please check the file format.' });
        }
      },

      // Initialize with sample data
      initializeSampleData: () => {
        const boardId = get().createBoard('My First Board', 'Welcome to MaverDash! This is your first Kanban board.');
        
        // Create sample columns
        const todoColumnId = get().createColumn(boardId, 'To Do', '#6b7280');
        const inProgressColumnId = get().createColumn(boardId, 'In Progress', '#f59e0b');
        const doneColumnId = get().createColumn(boardId, 'Done', '#10b981');

        // Create sample labels
        // Create sample labels
        get().createLabel(boardId, 'Bug', '#dc2626');
        get().createLabel(boardId, 'Feature', '#3b82f6');
        get().createLabel(boardId, 'Improvement', '#8b5cf6');

        // Create sample cards
        get().createCard(boardId, todoColumnId, 'Welcome to MaverDash', 'This is your first card! Click to edit and customize it.');
        get().createCard(boardId, todoColumnId, 'Explore the features', 'Try creating new boards, columns, and cards to organize your work.');
        get().createCard(boardId, inProgressColumnId, 'Customize your board', 'Add labels, set due dates, and assign team members to cards.');
        get().createCard(boardId, doneColumnId, 'Install MaverDash', 'Congratulations! You have successfully set up MaverDash.');
      },
    }),
    {
      name: 'maverdash-storage',
      version: 1,
    }
  )
);