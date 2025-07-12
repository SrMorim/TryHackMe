import React, { useState } from 'react';
import { 
  Plus, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Palette
} from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { Column as ColumnType, Card as CardType } from '../../types';
import { useBoardStore } from '../../stores/boardStore';
import Card from '../Card/Card';

interface ColumnProps {
  column: ColumnType;
  cards: CardType[];
  boardId: string;
}

const colorOptions = [
  '#6b7280', '#ef4444', '#f97316', '#f59e0b', 
  '#eab308', '#84cc16', '#22c55e', '#10b981', 
  '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', 
  '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e'
];

const Column: React.FC<ColumnProps> = ({ column, cards, boardId }) => {
  const { createCard, updateColumn, deleteColumn } = useBoardStore();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState(column.title);
  const [showMenu, setShowMenu] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    },
  });

  const handleAddCard = () => {
    if (newCardTitle.trim()) {
      createCard(boardId, column.id, newCardTitle.trim());
      setNewCardTitle('');
      setIsAddingCard(false);
    }
  };

  const handleUpdateTitle = () => {
    if (editTitle.trim() && editTitle !== column.title) {
      updateColumn(boardId, column.id, { title: editTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleDeleteColumn = () => {
    if (confirm(`Are you sure you want to delete "${column.title}"? This will also delete all cards in this column.`)) {
      deleteColumn(boardId, column.id);
    }
  };

  const handleColorChange = (color: string) => {
    updateColumn(boardId, column.id, { color });
    setShowColorPicker(false);
    setShowMenu(false);
  };

  const wipLimitExceeded = column.wipLimit && cards.length > column.wipLimit;

  return (
    <div className="flex flex-col w-80 flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between p-4 bg-bg-secondary rounded-t-lg border border-border-primary">
        <div className="flex items-center space-x-2 flex-1">
          <div 
            className="w-3 h-3 rounded-full flex-shrink-0" 
            style={{ backgroundColor: column.color }}
          />
          
          {isEditingTitle ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleUpdateTitle}
              onKeyPress={(e) => e.key === 'Enter' && handleUpdateTitle()}
              className="input text-sm font-medium bg-transparent border-none px-0 py-0 focus:ring-0"
              autoFocus
            />
          ) : (
            <h3 
              className="font-medium text-text-primary cursor-pointer hover:text-accent-red transition-colors"
              onClick={() => setIsEditingTitle(true)}
            >
              {column.title}
            </h3>
          )}
          
          <span className="text-text-secondary text-sm bg-bg-tertiary px-2 py-1 rounded-full">
            {cards.length}
            {column.wipLimit && `/${column.wipLimit}`}
          </span>

          {wipLimitExceeded && (
            <span className="text-accent-red text-xs font-medium">
              WIP Exceeded!
            </span>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-bg-elevated rounded text-text-secondary hover:text-text-primary"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>

          {showMenu && (
            <div className="absolute top-full right-0 mt-2 w-48 card shadow-lg z-50">
              <div className="p-2 space-y-1">
                <button
                  onClick={() => {
                    setIsEditingTitle(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-bg-elevated rounded text-text-primary"
                >
                  <Edit3 className="h-4 w-4" />
                  <span>Edit title</span>
                </button>
                
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-bg-elevated rounded text-text-primary"
                >
                  <Palette className="h-4 w-4" />
                  <span>Change color</span>
                </button>

                <hr className="border-border-primary my-1" />
                
                <button
                  onClick={handleDeleteColumn}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-left hover:bg-bg-elevated rounded text-accent-red"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete column</span>
                </button>
              </div>

              {showColorPicker && (
                <div className="border-t border-border-primary p-3">
                  <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleColorChange(color)}
                        className="w-6 h-6 rounded-full border-2 border-border-primary hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Cards Area */}
      <div 
        ref={setNodeRef}
        className={`flex-1 min-h-24 p-4 bg-bg-tertiary rounded-b-lg border-l border-r border-b border-border-primary space-y-3 ${
          wipLimitExceeded ? 'border-accent-red border-2' : ''
        }`}
      >
        <SortableContext items={cards.map(card => card.id)} strategy={verticalListSortingStrategy}>
          {cards.map((card) => (
            <Card key={card.id} card={card} boardId={boardId} />
          ))}
        </SortableContext>

        {/* Add Card Form */}
        {isAddingCard ? (
          <div className="space-y-2">
            <textarea
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="input w-full resize-none"
              rows={3}
              autoFocus
              onKeyPress={(e) => {
                if (e.key === 'Enter' && e.ctrlKey) {
                  handleAddCard();
                }
              }}
            />
            <div className="flex items-center space-x-2">
              <button
                onClick={handleAddCard}
                className="btn-primary text-sm"
                disabled={!newCardTitle.trim()}
              >
                Add Card
              </button>
              <button
                onClick={() => {
                  setIsAddingCard(false);
                  setNewCardTitle('');
                }}
                className="btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
            <p className="text-xs text-text-secondary">
              Press Ctrl+Enter to save
            </p>
          </div>
        ) : (
          <button
            onClick={() => setIsAddingCard(true)}
            className="w-full flex items-center justify-center space-x-2 p-3 border-2 border-dashed border-border-primary hover:border-accent-red rounded-lg text-text-secondary hover:text-accent-red transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>Add a card</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default Column;