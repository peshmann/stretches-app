import { Routes, Route } from 'react-router-dom';
import { BottomNav } from './components/ui/BottomNav';
import LibraryPage from './pages/LibraryPage';

export default function App() {
  return (
    <div className="min-h-dvh bg-bg text-text">
      <main className="max-w-lg mx-auto pb-20 px-4">
        <Routes>
          <Route path="/" element={<div className="pt-6 font-display text-2xl font-bold">Workout Tracker</div>} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/progress" element={<div className="pt-6 font-display text-2xl font-bold">Progress</div>} />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}
