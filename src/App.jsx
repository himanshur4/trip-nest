import { Routes, Route, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './firebase/config';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import DashboardPage from './pages/DashboardPage';
import Navbar from './components/common/Navbar';
import ItineraryDetailPage from './pages/ItineraryDetailPage';
import LandingPage from './pages/LandingPage';
import DiscoverPage from './pages/DiscoverPage';
import WishlistPage from './pages/WishlistPage';
import AppBackground from './components/common/AppBackground';

function App() {
  const { data: user, isLoading } = useQuery({
    queryKey: ['user'],
    queryFn: () => {
      return new Promise((resolve) => {
        onAuthStateChanged(auth, (user) => {
          resolve(user);
        });
      });
    },
    staleTime: Infinity,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center h-screen animate-spin"></div>;
  }

  return (
    <AppBackground>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={!user ? <LandingPage /> : <Navigate to="/dashboard" />} />
        <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/dashboard" />} />
        <Route path="/signup" element={!user ? <SignupPage /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={user ? <DashboardPage /> : <Navigate to="/" />} />
        <Route path="/discover" element={<DiscoverPage />} />
        <Route path="/wishlist" element={user ? <WishlistPage /> : <Navigate to="/login" />} />
        <Route path="/itinerary/:id" element={user ? <ItineraryDetailPage /> : <Navigate to="/login" />} />
      </Routes>
    </AppBackground>
  );
}
export default App;