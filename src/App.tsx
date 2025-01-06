import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AddLevel } from './pages/AddLevel';
import { ViewLevels } from './pages/ViewLevels';
import { ViewSwapLevels } from './pages/ViewSwapLevels';
import { Login } from './pages/Login';
import { ProtectedRoute } from './components/ProtectedRoute';
import { auth, logout } from './lib/auth';
import { LogOut } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { LevelProvider } from './contexts/LevelContext';

export function App() {
  const { user } = useAuth();

  return (
    <Router>
      <LevelProvider>
        <div className="min-h-screen bg-gray-50">
          {user && (
            <nav className="bg-white shadow-sm">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                  <div className="flex">
                    <NavLink
                      to="/"
                      className={({ isActive }) =>
                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                          isActive
                            ? 'border-coral-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`
                      }
                    >
                      Add Level
                    </NavLink>
                    <NavLink
                      to="/view"
                      className={({ isActive }) =>
                        `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ml-8 ${
                          isActive
                            ? 'border-coral-500 text-gray-900'
                            : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                        }`
                      }
                    >
                      View Levels
                    </NavLink>
                  </div>
                  <div className="flex items-center">
                    <button
                      onClick={() => logout()}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none transition"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
              </div>
            </nav>
          )}

          <main className="py-10">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AddLevel />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view"
                element={
                  <ProtectedRoute>
                    <ViewLevels />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/view-swap"
                element={
                  <ProtectedRoute>
                    <ViewSwapLevels />
                  </ProtectedRoute>
                }
              />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </LevelProvider>
    </Router>
  );
}