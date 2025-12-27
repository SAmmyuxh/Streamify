import { Routes, Route, Navigate } from 'react-router'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SignupPage from './pages/SignupPage.jsx'
import NotificationsPage from './pages/NotificationsPage.jsx'
import CallPage from './pages/CallPage.jsx'
import ChatPage from './pages/ChatPage.jsx'
import { useQuery } from '@tanstack/react-query'
import { axiosInstance } from './lib/axios.js'
import { useThemeStore } from './store/useThemeStore.js';
import Layout from './components/Layout.jsx';
import LoadingSpinner from './components/LoadingSpinner.jsx'

import ProfilePage from './pages/ProfilePage.jsx';
import FriendsPage from './pages/FriendsPage.jsx';

const App = () => {
  const { theme } = useThemeStore();
  const { data: authData, isLoading } = useQuery({
        queryKey:['authUser'],
        queryFn: async () => {
            const response = await axiosInstance.get('/auth/me')
            return response.data
        },
        retry: false,//auth check
    })
    
  const authUser = authData?.user || null
  
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
          
          {/* UPDATED: Added /:id so the call link works */}
          <Route path='/call/:id' element={authUser ? <CallPage /> : <Navigate to="/login" />} />
          
          <Route path='/chat/:id' element={authUser ? <ChatPage /> : <Navigate to="/login" />} />
        </Routes>
      </Layout>
    </div>
  )
}

export default App