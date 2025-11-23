import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Chat from './components/Chat';
import ProtectedRoute from './utils/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import useAuthStore from './store/useAuthStore';

function App() {
  const { isAuthenticated, token } = useAuthStore();
  
  // Log auth state for debugging
  React.useEffect(() => {
    console.log('[App] Auth state changed:', { isAuthenticated, hasToken: !!token });
  }, [isAuthenticated, token]);
  
  return (
    <ErrorBoundary>
      <Router>
        <div className="App">
          <Routes>
            <Route
              path="/login"
              element={isAuthenticated && token ? <Navigate to="/chat" replace /> : <Login />}
            />
            <Route
              path="/signup"
              element={isAuthenticated && token ? <Navigate to="/chat" replace /> : <Signup />}
            />
            <Route
              path="/chat"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/chat" replace />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

