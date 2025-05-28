'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gamepad2, LogOut, User, ShoppingBag } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  phone?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (error) {
      console.error('Error parsing user data:', error);
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-lg mr-3">
                <Gamepad2 className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold">
                <span className="text-red-500">Pasar</span>
                <span className="text-blue-600">Game</span>
                <span className="text-gray-900">X</span>
              </h1>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-700">
                <User className="w-4 h-4 mr-2" />
                <span className="font-medium">{user.username}</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-500 hover:text-red-600 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Welcome Section */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, {user.username}! 🎮
            </h2>
            <p className="text-gray-600">
              Your gaming marketplace dashboard is ready.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                  <ShoppingBag className="w-6 h-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Products</h3>
                  <p className="text-sm text-gray-500">Manage your listings</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg">
                  <Gamepad2 className="w-6 h-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">Browse Games</h3>
                  <p className="text-sm text-gray-500">Find what you need</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
                  <User className="w-6 h-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-semibold text-gray-900">My Profile</h3>
                  <p className="text-sm text-gray-500">Account settings</p>
                </div>
              </div>
            </div>
          </div>

          {/* User Info Card */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-sm text-gray-900">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <p className="mt-1 text-sm text-gray-900">{user.username}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-sm text-gray-900 font-mono">{user.id}</p>
              </div>
              {user.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{user.phone}</p>
                </div>
              )}
            </div>
          </div>

          {/* Debug Info */}
          <div className="mt-6 bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Debug Info</h4>
            <p className="text-xs text-gray-500">
              Token stored: {localStorage.getItem('token') ? '✅ Yes' : '❌ No'}
            </p>
            <p className="text-xs text-gray-500">
              Refresh token: {localStorage.getItem('refreshToken') ? '✅ Yes' : '❌ No'}
            </p>
          </div>

        </div>
      </main>
    </div>
  );
}