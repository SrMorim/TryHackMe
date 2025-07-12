import React, { useState } from 'react';
import { 
  Calendar, 
  User, 
  AlertCircle, 
  Edit3, 
  Trash2,
  Clock
} from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card as CardType } from '../../types';
import { useBoardStore } from '../../stores/boardStore';
import { format } from 'date-fns';
import CardModal from '../Modals/CardModal';

interface CardProps {
  card: CardType;
  boardId: string;
}

const priorityColors = {
  low: 'bg-blue-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
} as const;

const priorityIcons = {
  low: Clock,
  medium: AlertCircle,
  high: AlertCircle,
} as const;

const CardComponent: React.FC<CardProps> = ({ card, boardId }) => {
  const { updateCard, deleteCard, boards } = useBoardStore();
  const [isEditing, setIsEditing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: card.id,
    data: {
      type: 'card',
      card,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const board = boards[boardId];
  const assignedUsers = card.assignees.map(assigneeId => 
    board?.users.find(user => user.id === assigneeId)
  ).filter(Boolean);

  const handleSave = () => {
    if (editTitle.trim()) {
      updateCard(boardId, card.id, {
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(boardId, card.id);
    }
  };

  const PriorityIcon = priorityIcons[card.priority];

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="card p-4 opacity-50 rotate-3 scale-105"
      >
        <div className="h-20 bg-bg-tertiary rounded animate-pulse" />
      </div>
    );
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        onClick={() => !isEditing && setShowModal(true)}
        className="card p-4 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow group"
      >
      {isEditing ? (
        <div className="space-y-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="input w-full font-medium"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Add a description..."
            className="input w-full resize-none"
            rows={3}
            onKeyPress={(e) => e.key === 'Enter' && e.ctrlKey && handleSave()}
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 text-sm btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-3 py-1 text-sm btn-primary"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Header with title and actions */}
          <div className="flex items-start justify-between">
            <h3 className="font-medium text-text-primary text-sm leading-tight flex-1">
              {card.title}
            </h3>
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="p-1 hover:bg-bg-elevated rounded text-text-secondary hover:text-text-primary"
                title="Edit card"
              >
                <Edit3 className="h-3 w-3" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete();
                }}
                className="p-1 hover:bg-bg-elevated rounded text-text-secondary hover:text-accent-red"
                title="Delete card"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>

          {/* Description */}
          {card.description && (
            <p className="text-text-secondary text-xs leading-relaxed">
              {card.description}
            </p>
          )}

          {/* Labels */}
          {card.labels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {card.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-2 py-1 text-xs rounded-full text-white font-medium"
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          {/* Footer with metadata */}
          <div className="flex items-center justify-between text-xs text-text-secondary">
            <div className="flex items-center space-x-2">
              {/* Priority */}
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${priorityColors[card.priority]}`} />
                <PriorityIcon className="h-3 w-3" />
              </div>

              {/* Due date */}
              {card.dueDate && (
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(card.dueDate), 'MMM d')}</span>
                </div>
              )}
            </div>

            {/* Assignees */}
            {assignedUsers.length > 0 && (
              <div className="flex items-center -space-x-1">
                {assignedUsers.slice(0, 3).map((user) => (
                  <div
                    key={user?.id}
                    className="w-6 h-6 rounded-full bg-accent-red flex items-center justify-center text-white text-xs font-medium border-2 border-bg-secondary"
                    title={user?.name}
                  >
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-3 w-3" />
                    )}
                  </div>
                ))}
                {assignedUsers.length > 3 && (
                  <div className="w-6 h-6 rounded-full bg-bg-tertiary flex items-center justify-center text-text-secondary text-xs font-medium border-2 border-bg-secondary">
                    +{assignedUsers.length - 3}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>

      <CardModal
        card={card}
        boardId={boardId}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default CardComponent;