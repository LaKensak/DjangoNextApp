"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import NavBar from '@/app/section/navbar';
import Footer from '@/app/section/footer';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
// @ts-ignore
import Cookies from 'js-cookie';

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [canAccess, setCanAccess] = useState(false);

  useEffect(() => {
    const sessionToken = Cookies.get('accessToken');

    if (sessionToken) {
      // Si déjà authentifié, rediriger vers le dashboard
      router.push('/');
    } else {
      const clicked = sessionStorage.getItem('canAccessLogin');
      if (!clicked) {
        router.push('/');
      } else {
        setCanAccess(true);
      }
    }
  }, [router]);

  const handleLogin = async () => {
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        const data = await response.json();

        // Définir les cookies de session
        Cookies.set('accessToken', data.access, {
          secure: true,
          sameSite: 'strict',
          httpOnly: false, // Assurez-vous que les cookies HTTPOnly sont configurés côté backend pour plus de sécurité.
          expires: 1, // Durée de validité : 1 jour
        });
        Cookies.set('refreshToken', data.refresh, {
          secure: true,
          sameSite: 'strict',
          expires: 7, // Durée de validité : 7 jours
        });

        // Obtenir les informations utilisateur
        const userResponse = await fetch('http://127.0.0.1:8000/api/user/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${data.access}`,
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();

          // Sauvegarder le nom d'utilisateur dans un cookie
          Cookies.set('username', userData.username, {
            secure: true,
            sameSite: 'strict',
            expires: 1,
          });

          setSuccessMessage(`Connexion réussie ! Bienvenue ${userData.username}`);

          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setError('Impossible de récupérer les données utilisateur.');
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Une erreur est survenue. Veuillez réessayer.');
      }
    } catch (err) {
      console.error('Erreur de connexion :', err);
      setError('Une erreur s’est produite. Veuillez réessayer plus tard.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  if (!canAccess) return null;

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Connexion</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur
              </label>
              <input
                type="email"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="Entrez votre email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown} // Ajouté ici
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe
              </label>
              <input
                type="password"
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyDown} // Ajouté ici
              />
            </div>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-50 text-green-600 p-4 rounded-lg">
                {successMessage}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <button
              onClick={handleLogin}
              className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors duration-300"
            >
              Connexion
            </button>
            <button
              onClick={() => router.push('/register')}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Pas encore de compte ? S'inscrire
            </button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;
