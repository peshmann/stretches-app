import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { BottomNav } from './components/ui/BottomNav';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import WorkoutPage from './pages/WorkoutPage';
import PostWorkoutPage from './pages/PostWorkoutPage';
import ProgressPage from './pages/ProgressPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/workout') || location.pathname.startsWith('/post-workout');

  return (
    <div className="min-h-dvh bg-bg text-text">
      <ScrollToTop />
      <main className={`max-w-lg mx-auto ${hideNav ? '' : 'pb-20'} px-4`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/workout/:workoutId" element={<WorkoutPage />} />
          <Route path="/post-workout" element={<PostWorkoutPage />} />
        </Routes>
      </main>
      {!hideNav && <BottomNav />}
    </div>
  );
}
