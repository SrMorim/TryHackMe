import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { useBoardStore } from '../../stores/boardStore';
import type { Card as CardType, Column as ColumnType } from '../../types';
import Column from '../Column/Column';
import Card from '../Card/Card';
import Welcome from '../Welcome/Welcome';

const Board: React.FC = () => {
  const {
    boards,
    currentBoardId,
    createColumn,
    moveCard,
    reorderCards,
    reorderColumns,
  } = useBoardStore();

  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const currentBoard = currentBoardId ? boards[currentBoardId] : null;

  if (!currentBoard) {
    return <Welcome />;
  }

  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(currentBoard.id, newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const activeData = active.data.current;

    if (activeData?.type === 'card') {
      setActiveCard(activeData.card);
    } else if (activeData?.type === 'column') {
      setActiveColumn(activeData.column);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle card movement
    if (activeData?.type === 'card' && overData?.type === 'column') {
      const activeCard = activeData.card as CardType;
      const overColumn = overData.column as ColumnType;

      if (activeCard.columnId !== overColumn.id) {
        moveCard(
          currentBoard.id,
          activeCard.id,
          activeCard.columnId,
          overColumn.id,
          0
        );
      }
    }

    // Handle column reordering
    if (activeData?.type === 'column' && overData?.type === 'column') {
      const activeColumn = activeData.column as ColumnType;
      const overColumn = overData.column as ColumnType;

      const activeIndex = currentBoard.columns.findIndex(col => col.id === activeColumn.id);
      const overIndex = currentBoard.columns.findIndex(col => col.id === overColumn.id);

      if (activeIndex !== overIndex) {
        reorderColumns(currentBoard.id, activeIndex, overIndex);
      }
    }

    setActiveCard(null);
    setActiveColumn(null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over) return;

    const activeData = active.data.current;
    const overData = over.data.current;

    // Handle card reordering within the same column
    if (activeData?.type === 'card' && overData?.type === 'card') {
      const activeCard = activeData.card as CardType;
      const overCard = overData.card as CardType;

      if (activeCard.columnId === overCard.columnId) {
        const column = currentBoard.columns.find(col => col.id === activeCard.columnId);
        if (column) {
          const activeIndex = column.cardIds.indexOf(activeCard.id);
          const overIndex = column.cardIds.indexOf(overCard.id);

          if (activeIndex !== overIndex) {
            reorderCards(currentBoard.id, column.id, activeIndex, overIndex);
          }
        }
      }
    }
  };

  const getCardsForColumn = (columnId: string): CardType[] => {
    const column = currentBoard.columns.find(col => col.id === columnId);
    if (!column) return [];

    return column.cardIds
      .map(cardId => currentBoard.cards[cardId])
      .filter(Boolean)
      .sort((a, b) => a.position - b.position);
  };

  return (
    <div className="flex-1 bg-bg-primary overflow-hidden">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full flex overflow-x-auto p-6 space-x-6">
          <SortableContext
            items={currentBoard.columns.map(col => col.id)}
            strategy={horizontalListSortingStrategy}
          >
            {currentBoard.columns
              .sort((a, b) => a.position - b.position)
              .map((column) => (
                <Column
                  key={column.id}
                  column={column}
                  cards={getCardsForColumn(column.id)}
                  boardId={currentBoard.id}
                />
              ))}
          </SortableContext>

          {/* Add Column */}
          <div className="flex flex-col w-80 flex-shrink-0">
            {isAddingColumn ? (
              <div className="p-4 bg-bg-secondary rounded-lg border border-border-primary">
                <input
                  type="text"
                  value={newColumnTitle}
                  onChange={(e) => setNewColumnTitle(e.target.value)}
                  placeholder="Enter column title..."
                  className="input w-full mb-3"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleAddColumn()}
                />
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleAddColumn}
                    className="btn-primary text-sm"
                    disabled={!newColumnTitle.trim()}
                  >
                    Add Column
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingColumn(false);
                      setNewColumnTitle('');
                    }}
                    className="btn-secondary text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingColumn(true)}
                className="flex items-center justify-center space-x-2 p-4 bg-bg-secondary hover:bg-bg-elevated rounded-lg border-2 border-dashed border-border-primary hover:border-accent-red text-text-secondary hover:text-accent-red transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Add another column</span>
              </button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard && (
            <Card card={activeCard} boardId={currentBoard.id} />
          )}
          {activeColumn && (
            <div className="w-80 opacity-80">
              <Column
                column={activeColumn}
                cards={getCardsForColumn(activeColumn.id)}
                boardId={currentBoard.id}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  );
};

export default Board;