import React from 'react';
import { Kanban, Plus, Download, Github } from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';

const Welcome: React.FC = () => {
  const { createBoard, initializeSampleData } = useBoardStore();

  const handleCreateBoard = () => {
    const boardName = prompt('Enter board name:');
    if (boardName?.trim()) {
      createBoard(boardName.trim());
    }
  };

  const handleLoadSample = () => {
    initializeSampleData();
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-bg-primary p-8">
      <div className="text-center max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center space-x-3 mb-8">
          <Kanban className="h-16 w-16 text-accent-red" />
          <h1 className="text-4xl font-bold text-text-primary">MaverDash</h1>
        </div>

        {/* Description */}
        <p className="text-text-secondary text-lg mb-8 leading-relaxed">
          A modern, customizable Kanban board application inspired by GitHub's dark theme.
          Create boards, organize your work, and boost your productivity.
        </p>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8 text-sm">
          <div className="card p-4">
            <h3 className="font-semibold text-text-primary mb-2">🎨 Fully Customizable</h3>
            <p className="text-text-secondary">
              Customize boards, columns, cards, labels, and themes to match your workflow.
            </p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-text-primary mb-2">🔄 Drag & Drop</h3>
            <p className="text-text-secondary">
              Intuitive drag-and-drop interface for effortless task management.
            </p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-text-primary mb-2">💾 Local Storage</h3>
            <p className="text-text-secondary">
              Your data is stored locally and persists between sessions.
            </p>
          </div>
          <div className="card p-4">
            <h3 className="font-semibold text-text-primary mb-2">📊 Import/Export</h3>
            <p className="text-text-secondary">
              Export your boards to JSON and import them on other devices.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleCreateBoard}
              className="btn-primary flex items-center justify-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Your First Board</span>
            </button>
            <button
              onClick={handleLoadSample}
              className="btn-secondary flex items-center justify-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Load Sample Board</span>
            </button>
          </div>

          <p className="text-text-tertiary text-xs">
            Or use the header menu to import existing boards
          </p>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-border-primary">
          <p className="text-text-tertiary text-sm flex items-center justify-center space-x-2">
            <span>Built with React, TypeScript, and Tailwind CSS</span>
            <Github className="h-4 w-4" />
          </p>
        </div>
      </div>
    </div>
  );
};

export default Welcome;