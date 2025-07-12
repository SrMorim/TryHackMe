import { useEffect } from 'react';
import { useBoardStore } from './stores/boardStore';
import { useKeyboard } from './hooks/useKeyboard';
import Header from './components/Header/Header';
import Board from './components/Board/Board';

function App() {
  const { boards, initializeSampleData, createBoard, exportData } = useBoardStore();

  // Keyboard shortcuts
  useKeyboard([
    {
      key: 'n',
      ctrlKey: true,
      callback: () => {
        const name = prompt('Board name:');
        if (name?.trim()) createBoard(name.trim());
      }
    },
    {
      key: 'e',
      ctrlKey: true,
      callback: () => {
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
      }
    }
  ]);

  useEffect(() => {
    // Initialize with sample data if no boards exist
    if (Object.keys(boards).length === 0) {
      initializeSampleData();
    }
  }, [boards, initializeSampleData]);

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      <Header />
      <Board />
    </div>
  );
}

export default App;