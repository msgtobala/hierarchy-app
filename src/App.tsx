import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AddLevel } from './pages/AddLevel';
import { ViewLevels } from './pages/ViewLevels';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { auth, logout } from './lib/auth';
import { LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';

const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
  return `border-transparent hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
    isActive
      ? 'border-coral-500 text-coral-600'
      : 'text-gray-500'
  }`;
};

function App() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && <nav className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <h1 className="text-xl font-bold text-gray-900">Hierarchy App</h1>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <NavLink
                    to="/"
                    className={getLinkClassName}
                  >
                    Add Level
                  </NavLink>
                  <NavLink
                    to="/view"
                    className={getLinkClassName}
                  >
                    View Levels
                  </NavLink>
                </div>
              </div>
              <div className="flex items-center">
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-full text-sm font-medium text-white bg-[rgb(255,127,80)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(255,127,80)] shadow-sm"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>}

        <div className={user ? "py-10" : ""}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AddLevel />
              </ProtectedRoute>
            } />
            <Route path="/view" element={
              <ProtectedRoute>
                <ViewLevels />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;