import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Settings, 
  Upload, 
  Download, 
  ChevronDown,
  Kanban
} from 'lucide-react';
import { useBoardStore } from '../../stores/boardStore';

const Header: React.FC = () => {
  const {
    boards,
    currentBoardId,
    searchQuery,
    createBoard,
    setCurrentBoard,
    setSearchQuery,
    exportData,
    importData,
  } = useBoardStore();

  const [showBoardSelector, setShowBoardSelector] = useState(false);
  const [showCreateBoard, setShowCreateBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const currentBoard = currentBoardId ? boards[currentBoardId] : null;
  const boardList = Object.values(boards);

  const handleCreateBoard = () => {
    if (newBoardTitle.trim()) {
      createBoard(newBoardTitle.trim());
      setNewBoardTitle('');
      setShowCreateBoard(false);
    }
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `maverdash-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = e.target?.result as string;
        importData(data);
      };
      reader.readAsText(file);
    }
  };

  return (
    <header className="bg-bg-secondary border-b border-border-primary px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Board Selector */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Kanban className="h-8 w-8 text-accent-red" />
            <h1 className="text-xl font-bold text-text-primary">MaverDash</h1>
          </div>

          {/* Board Selector */}
          <div className="relative">
            <button
              onClick={() => setShowBoardSelector(!showBoardSelector)}
              className="flex items-center space-x-2 btn-secondary"
            >
              <span>{currentBoard?.title || 'Select Board'}</span>
              <ChevronDown className="h-4 w-4" />
            </button>

            {showBoardSelector && (
              <div className="absolute top-full left-0 mt-2 w-64 card shadow-lg z-50">
                <div className="p-2">
                  <div className="mb-2">
                    <button
                      onClick={() => {
                        setShowCreateBoard(true);
                        setShowBoardSelector(false);
                      }}
                      className="flex items-center space-x-2 w-full btn-primary text-sm"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Create New Board</span>
                    </button>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {boardList.map((board) => (
                      <button
                        key={board.id}
                        onClick={() => {
                          setCurrentBoard(board.id);
                          setShowBoardSelector(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          board.id === currentBoardId
                            ? 'bg-accent-red text-white'
                            : 'text-text-primary hover:bg-bg-elevated'
                        }`}
                      >
                        <div className="font-medium">{board.title}</div>
                        {board.description && (
                          <div className="text-xs text-text-secondary truncate">
                            {board.description}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
            <input
              type="text"
              placeholder="Search cards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-64"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExport}
              className="btn-secondary"
              title="Export data"
            >
              <Download className="h-4 w-4" />
            </button>

            <label className="btn-secondary cursor-pointer" title="Import data">
              <Upload className="h-4 w-4" />
              <input
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>

            <button className="btn-secondary" title="Settings">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Create Board Modal */}
      {showCreateBoard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="card p-6 w-96">
            <h2 className="text-lg font-semibold mb-4">Create New Board</h2>
            <input
              type="text"
              placeholder="Board title"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              className="input w-full mb-4"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleCreateBoard()}
            />
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowCreateBoard(false);
                  setNewBoardTitle('');
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateBoard}
                className="btn-primary"
                disabled={!newBoardTitle.trim()}
              >
                Create Board
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;