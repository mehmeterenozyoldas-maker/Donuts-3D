import React from 'react';
import Sidebar from './components/Sidebar';
import Viewport from './components/Viewport';

const App: React.FC = () => {
  return (
    <div className="relative w-full h-screen overflow-hidden flex">
      {/* Floating Sidebar Container */}
      <div className="absolute left-0 top-0 bottom-0 z-10 pointer-events-none">
        <Sidebar />
      </div>

      {/* Main Viewport */}
      <main className="flex-1 relative ml-0 h-full w-full">
        <Viewport />
      </main>
    </div>
  );
};

export default App;