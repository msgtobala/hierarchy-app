import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, CircleDot } from 'lucide-react';
import { login } from '../lib/auth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (error: any) {
      setError(error.message === 'Access denied. Only admin can login.' 
        ? error.message 
        : 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#FFBB7E] to-[#FFF0E3] flex items-center justify-center">
      {/* Decorative circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-96 h-96 rounded-full bg-white/10" />
        <div className="absolute top-1/4 -right-20 w-72 h-72 rounded-full bg-white/10" />
        <div className="absolute bottom-1/4 left-1/3 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -bottom-20 right-1/4 w-64 h-64 rounded-full bg-white/10" />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 rounded-full bg-white/10" />
      </div>
      
      <div className="w-full max-w-md">
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-xl p-8 mx-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-[#FFBB7E] to-[#FF9F57] bg-clip-text text-transparent">
              Sign In
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email and password to login into admin panel
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50/80 backdrop-blur-sm text-red-500 text-sm p-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-full border-gray-300 shadow-sm focus:border-[#FFBB7E] focus:ring-[#FFBB7E] px-4 py-3 bg-white/50 backdrop-blur-sm"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-full border-gray-300 shadow-sm focus:border-[#FFBB7E] focus:ring-[#FFBB7E] px-4 py-3 pr-10 bg-white/50 backdrop-blur-sm"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#FFBB7E] to-[#FF9F57] hover:from-[#FF9F57] hover:to-[#FF8930] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FFBB7E] disabled:opacity-50 transition-all duration-200"
            >
              {isLoading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}