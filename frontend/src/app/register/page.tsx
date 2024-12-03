"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { AlertDialog, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import Footer from "@/app/section/footer";
import NavBar from "@/app/section/navbar";

const RegisterPage = () => {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [last_name, setLastname] = useState('');
  const [first_name, setFirstname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      setError('Le mot de passe ne correspond pas. Réessayer.');
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:8000/api/register/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          // adresse : adresse
          first_name: first_name,
          last_name: last_name,
          username: username,
          email: email,
          password: password,
          confirm_password: confirmPassword, // Envoyez confirm_password
        }),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        // Afficher le message de succès
        setShowSuccessDialog(true);
        setError(null);

        // Attendre 3 secondes avant de réinitialiser ou rediriger
        setTimeout(() => {
          // Réinitialiser les champs du formulaire
          setUsername('');
          setFirstname('');
          setLastname('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
          setShowSuccessDialog(false);

          // Rediriger vers la page de connexion ou une autre page
          router.push('/login');
        }, 3000); // 3 secondes d'attente
      } else {
        setError(data.detail || 'Une erreur s’est produite lors de l’inscription.');
      }
    } catch (err) {
      setError('Une erreur est survenue durant l\'inscription. Réessayer s\'il vous plaît.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />

      <main className="flex-grow flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Register</h1>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom
              </label>
              <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Jean-Pierre"
                  value={last_name}
                  onChange={(e) => setLastname(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prénom
              </label>
              <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Jean-Pierre"
                  value={first_name}
                  onChange={(e) => setFirstname(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom d'utilisateur
              </label>
              <input
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Jean-Pierre"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
              />
            </div>
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
            <div className="form-group">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                  type="password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg">
                  {error}
                </div>
            )}
            {showSuccessDialog && (
                <div className="bg-green-50 text-green-600 p-4 rounded-lg">
                  Votre compte a bien été créé ! Vous allez être redirigé vers la page de connexion.
                </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <button
                onClick={handleRegister}
                className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors duration-300"
            >
              Register
            </button>
            <button
                onClick={() => router.push('/login')}
                className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Tu es inscrit connecte-toi? Login
            </button>
          </CardFooter>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default RegisterPage;
