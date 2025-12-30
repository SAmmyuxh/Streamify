import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import CallPage from './pages/CallPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import AITutorPage from './pages/AITutorPage.jsx'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from './lib/axios.js'
import { updateStreak } from './lib/api.js'
import { useThemeStore } from './store/useThemeStore.js';
import Layout from './components/Layout.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx'
import MapPage from './pages/MapPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';
import VoicePage from './pages/VoicePage.jsx';

const App = () => {
  const { theme } = useThemeStore();
  const queryClient = useQueryClient();
  
  const { data: authData, isLoading } = useQuery({
        queryKey:['authUser'],
        queryFn: async () => {
            const response = await axiosInstance.get('/auth/me')
            return response.data
        },
        retry: false,//auth check
    })
    
  const authUser = authData?.user || null
  
  // Update streak on app load when user is authenticated
  useEffect(() => {
    if (authUser) {
      updateStreak()
        .then((data) => {
          console.log('Streak updated:', data);
          // Refetch auth user to update streak in navbar
          queryClient.invalidateQueries({ queryKey: ['authUser'] });
        })
        .catch((err) => {
          console.warn('Streak update failed:', err);
        });
    }
  }, [authUser?._id]); // Only run when user ID changes (login/logout)
  
  if (isLoading) return <LoadingSpinner />;
  
  return (
    <div className='h-screen' data-theme={theme}>
      <Layout>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <SignupPage /> : <Navigate to="/" />} />
          <Route path="/notifications" element={authUser ? <NotificationsPage /> : <Navigate to="/login" />} />
          <Route path="/friends" element={authUser ? <FriendsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path="/leaderboard" element={authUser ? <LeaderboardPage /> : <Navigate to="/login" />} />
          <Route path="/ai-tutor" element={authUser ? <AITutorPage /> : <Navigate to="/login" />} />
          <Route path="/map" element={authUser ? <MapPage /> : <Navigate to="/login" />} />
          <Route path="/voice-lab" element={authUser ? <VoicePage /> : <Navigate to="/login" />} />
          
          {/* UPDATED: Added /:id so the call link works */}
          <Route path='/call/:id' element={authUser ? <CallPage /> : <Navigate to="/login" />} />
          
          <Route path='/chat/:id' element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App