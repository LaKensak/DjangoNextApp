"use client";

import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import NavBar from '@/app/section/navbar';
import Footer from '@/app/section/footer';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    try {
      // Simulate API login
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* NavBar placée en haut */}
      <NavBar />

      {/* Contenu principal */}
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Login</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <button
              onClick={handleLogin}
              className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors duration-300"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/register')}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Tu n'as pas de compte? Register
            </button>
          </CardFooter>
        </Card>
      </main>

      {/* Footer en bas */}
      <Footer />
    </div>
  );
};

export default LoginPage;
