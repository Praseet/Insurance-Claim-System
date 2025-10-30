import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  FileText, 
  LogOut, 
  Settings,
  Shield
} from 'lucide-react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">
                Insurance Claims
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-secondary flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <Link
              to="/dashboard"
              className="flex items-center space-x-2 px-3 py-4 border-b-2 border-transparent hover:border-primary-500 text-gray-700 hover:text-primary-600 transition-colors"
            >
              <LayoutDashboard className="h-5 w-5" />
              <span>Dashboard</span>
            </Link>
            
            {user.role === 'user' && (
              <Link
                to="/submit-claim"
                className="flex items-center space-x-2 px-3 py-4 border-b-2 border-transparent hover:border-primary-500 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <FileText className="h-5 w-5" />
                <span>Submit Claim</span>
              </Link>
            )}
            
            {(user.role === 'insurer' || user.role === 'admin') && (
              <Link
                to="/insurer"
                className="flex items-center space-x-2 px-3 py-4 border-b-2 border-transparent hover:border-primary-500 text-gray-700 hover:text-primary-600 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Manage Claims</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
