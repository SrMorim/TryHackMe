import React, { useState, useEffect } from 'react';
import { 
  X, 
  Calendar, 
  Tag, 
  User, 
  AlertCircle, 
  Save,
  Trash2,
} from 'lucide-react';
import type { Card, Priority } from '../../types';
import { useBoardStore } from '../../stores/boardStore';
import { useEscapeKey } from '../../hooks/useKeyboard';
import { formatDate } from '../../utils';

interface CardModalProps {
  card: Card;
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const priorityOptions: { value: Priority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-blue-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
];

const CardModal: React.FC<CardModalProps> = ({ card, boardId, isOpen, onClose }) => {
  const { updateCard, deleteCard, boards } = useBoardStore();
  const [formData, setFormData] = useState({
    title: card.title,
    description: card.description || '',
    priority: card.priority,
    dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
    assignees: card.assignees,
    labels: card.labels.map(l => l.id),
  });

  const board = boards[boardId];

  useEscapeKey(onClose);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: card.title,
        description: card.description || '',
        priority: card.priority,
        dueDate: card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '',
        assignees: card.assignees,
        labels: card.labels.map(l => l.id),
      });
    }
  }, [card, isOpen]);

  const handleSave = () => {
    if (!formData.title.trim()) return;

    const updatedCard: Partial<Card> = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      assignees: formData.assignees,
      labels: board.labels.filter(label => formData.labels.includes(label.id)),
    };

    updateCard(boardId, card.id, updatedCard);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCard(boardId, card.id);
      onClose();
    }
  };

  const toggleLabel = (labelId: string) => {
    setFormData(prev => ({
      ...prev,
      labels: prev.labels.includes(labelId)
        ? prev.labels.filter(id => id !== labelId)
        : [...prev.labels, labelId]
    }));
  };

  const toggleAssignee = (userId: string) => {
    setFormData(prev => ({
      ...prev,
      assignees: prev.assignees.includes(userId)
        ? prev.assignees.filter(id => id !== userId)
        : [...prev.assignees, userId]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-primary">
          <h2 className="text-lg font-semibold text-text-primary">Edit Card</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-bg-elevated rounded text-text-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="input w-full"
              placeholder="Enter card title..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="input w-full resize-none"
              rows={4}
              placeholder="Add a description..."
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <AlertCircle className="inline h-4 w-4 mr-1" />
              Priority
            </label>
            <div className="flex space-x-2">
              {priorityOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, priority: option.value }))}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md border transition-colors ${
                    formData.priority === option.value
                      ? 'border-accent-red bg-accent-red text-white'
                      : 'border-border-primary bg-bg-tertiary text-text-primary hover:bg-bg-elevated'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full ${option.color}`} />
                  <span className="text-sm">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              <Calendar className="inline h-4 w-4 mr-1" />
              Due Date
            </label>
            <input
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
              className="input"
            />
          </div>

          {/* Labels */}
          {board.labels.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <Tag className="inline h-4 w-4 mr-1" />
                Labels
              </label>
              <div className="flex flex-wrap gap-2">
                {board.labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => toggleLabel(label.id)}
                    className={`px-3 py-1 text-sm rounded-full transition-opacity ${
                      formData.labels.includes(label.id) ? 'opacity-100' : 'opacity-50'
                    }`}
                    style={{ 
                      backgroundColor: label.color,
                      color: 'white'
                    }}
                  >
                    {label.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assignees */}
          {board.users.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Assignees
              </label>
              <div className="space-y-2">
                {board.users.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleAssignee(user.id)}
                    className={`flex items-center space-x-3 w-full p-2 rounded-md border transition-colors ${
                      formData.assignees.includes(user.id)
                        ? 'border-accent-red bg-accent-red bg-opacity-10'
                        : 'border-border-primary hover:bg-bg-elevated'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-red flex items-center justify-center text-white text-sm font-medium">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        user.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-text-primary">{user.name}</div>
                      {user.email && (
                        <div className="text-xs text-text-secondary">{user.email}</div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="text-xs text-text-secondary space-y-1">
            <div>Created: {formatDate(card.createdAt)}</div>
            <div>Last updated: {formatDate(card.updatedAt)}</div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border-primary">
          <button
            onClick={handleDelete}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={!formData.title.trim()}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardModal;