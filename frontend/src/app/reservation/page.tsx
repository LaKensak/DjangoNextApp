'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
// @ts-ignore
import Cookies from "js-cookie";

const ReservationPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    gdprConsent: false,
  });
  const [sessionDetails, setSessionDetails] = useState({
    sessionId: '',
    sessionTitle: '', // Laissez-le vide pour qu'on le mette à jour après
    sessionType: '',
    duration: '',
    price: '',
  });

  // État pour gérer le chargement et le succès/échec de la soumission
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    // Récupérer les valeurs des paramètres de l'URL
    const sessionId = queryParams.get('sessionId') || '';
    const sessionTitle = queryParams.get('sessionTitle') || '';
    const sessionType = queryParams.get('sessionType') || '';
    const duration = queryParams.get('duration') || '';
    const price = queryParams.get('price') || '';

    // Décoder le titre après récupération du paramètre
    setSessionDetails({
      sessionId,
      sessionTitle: decodeURIComponent(sessionTitle), // Décodage ici
      sessionType,
      duration,
      price,
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // Validation des champs du formulaire
  if (!formData.first_name || !formData.email || !formData.gdprConsent) {
    alert('Tous les champs sont requis, y compris l\'acceptation des conditions RGPD.');
    return;
  }

  setIsLoading(true);
  setErrorMessage('');

  try {
    const accessToken = Cookies.get('accessToken');

    // Assurez-vous que l'ID de la session est envoyé correctement
    const response = await fetch('http://127.0.0.1:8000/api/reservations/', {
      method: 'POST',
      body: JSON.stringify({
        sessionId: sessionDetails.sessionId, // L'ID de la session
        first_name: formData.first_name,
        email: formData.email,
      }),
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      setIsSuccess(true);
      setTimeout(() => {
        router.push(`/payment?sessionId=${sessionDetails.sessionId}`);
      }, 1500); // Attendre avant la redirection
    } else {
      const errorData = await response.json();
      setErrorMessage(errorData.message || 'Erreur lors de la réservation');
    }
  } catch (error) {
    setErrorMessage('Erreur lors de la connexion au serveur');
  } finally {
    setIsLoading(false);
  }
};



  return (
    <section className="py-16 bg-white" id="reservation-form">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Réservez votre séance : {sessionDetails.sessionTitle}
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Veuillez remplir les informations nécessaires pour finaliser votre réservation.
        </p>

        {/* Affichage des messages de succès, erreur et chargement */}
        {isLoading && <div className="text-center">Chargement...</div>}
        {isSuccess && <div className="text-center text-green-600">Réservation confirmée ! Redirection vers le paiement...</div>}
        {errorMessage && <div className="text-center text-red-600">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              E-mail
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Case à cocher RGPD */}
          <div>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={formData.gdprConsent}
                onChange={() => setFormData({ ...formData, gdprConsent: !formData.gdprConsent })}
                required
                className="h-4 w-4 text-rose-600 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-600">
                J'accepte la{' '}
                <a href="/terms" className="text-rose-600 hover:underline">
                  politique de confidentialité
                </a>{' '}
                et{' '}
                <a href="/terms" className="text-rose-600 hover:underline">
                  les conditions d'utilisation
                </a>.
              </span>
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full px-6 py-2 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors duration-300"
            >
              Confirmer la réservation
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ReservationPage;
