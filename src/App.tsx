import { Routes, Route } from 'react-router-dom';

export default function App() {
  return (
    <div className="min-h-dvh bg-bg text-text">
      <main className="max-w-lg mx-auto pb-20">
        <Routes>
          <Route path="/" element={<div className="p-4 font-display text-2xl">Workout Tracker</div>} />
        </Routes>
      </main>
    </div>
  );
}
