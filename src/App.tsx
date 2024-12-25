import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { AddLevel } from './pages/AddLevel';
import { ViewLevels } from './pages/ViewLevels';

const getLinkClassName = ({ isActive }: { isActive: boolean }) => {
  return `border-transparent hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
    isActive
      ? 'border-coral-500 text-coral-600'
      : 'text-gray-500'
  }`;
};

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <nav className="bg-white shadow-sm">
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
            </div>
          </div>
        </nav>

        <div className="py-10">
          <Routes>
            <Route path="/" element={<AddLevel />} />
            <Route path="/view" element={<ViewLevels />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;