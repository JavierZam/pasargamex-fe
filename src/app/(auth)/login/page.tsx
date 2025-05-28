'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock, Loader2, Gamepad2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user types
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
        general: ''
      }));
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = { email: '', password: '', general: '' };
    let isValid = true;

    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle login submission
  const handleLogin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({ email: '', password: '', general: '' });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      
      const response = await fetch(`${API_URL}/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Success - store tokens
        if (data.token) {
          localStorage.setItem('token', data.token);
          localStorage.setItem('refreshToken', data.refresh_token);
          localStorage.setItem('user', JSON.stringify(data.user));
          
          console.log('Login successful:', data);
          
          // Redirect to dashboard
          router.push('/dashboard');
        }
      } else {
        // Error response from backend
        setErrors(prev => ({
          ...prev,
          general: data.error?.message || data.message || 'Login failed'
        }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => ({
        ...prev,
        general: 'Network error. Please check if backend is running on port 8080.'
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Fill demo credentials
  const fillDemo = () => {
    setFormData({
      email: 'demo@pasargamex.com',
      password: 'demo123'
    });
    setErrors({ email: '', password: '', general: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            <span className="text-red-500">Pasar</span>
            <span className="text-blue-600">Game</span>
            <span className="text-gray-900">X</span>
          </h1>
          <p className="text-gray-600">Sign in to your gaming marketplace</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <div className="space-y-6">
            
            {/* General Error Alert */}
            {errors.general && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                  <p className="text-red-600 text-sm font-medium">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:border-blue-500 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                      : 'border-gray-300 focus:border-blue-500 bg-white hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="w-1 h-1 bg-red-500 rounded-full mr-2"></span>
                  {errors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="ml-2 text-sm text-gray-600 select-none">Remember me</span>
              </label>
              <button 
                type="button" 
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"
              >
                Forgot password?
              </button>
            </div>

            {/* Login Button */}
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-400 disabled:to-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </div>

          {/* Register Link */}
          <div className="mt-6 text-center pt-6 border-t border-gray-100">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => router.push('/register')}
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                Sign up here
              </button>
            </p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="mt-6 space-y-4">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Demo Credentials
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Email:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">demo@pasargamex.com</code>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-medium">Password:</span>
                <code className="bg-white px-2 py-1 rounded text-xs">demo123</code>
              </div>
            </div>
          </div>

          {/* Quick Fill Button */}
          <div className="text-center">
            <button
              onClick={fillDemo}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
            >
              👆 Click to fill demo credentials
            </button>
          </div>
        </div>

        {/* Backend Status */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500 mb-2">
            Backend endpoint: <code className="bg-gray-100 px-1 rounded">localhost:8080</code>
          </p>
          <div className="flex justify-center space-x-6 text-xs text-gray-400">
            <span>🎮 Game Accounts</span>
            <span>💎 In-Game Items</span>
            <span>⚡ Instant Delivery</span>
          </div>
        </div>
      </div>
    </div>
  );
}