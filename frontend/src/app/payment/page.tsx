'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Euro, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessionId = searchParams.get('sessionId');
  const sessionTitle = searchParams.get('sessionTitle')
    ? decodeURIComponent(searchParams.get('sessionTitle')!)
    : null;
  const sessionType = searchParams.get('sessionType')
    ? decodeURIComponent(searchParams.get('sessionType')!)
    : null;
  const duration = searchParams.get('duration')
    ? decodeURIComponent(searchParams.get('duration')!)
    : null;
  const price = searchParams.get('price');

  // Validation des paramètres requis
  if (!sessionId || !sessionTitle || !price) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>
              Les informations de la séance sont incomplètes.
            </AlertDescription>
          </Alert>
          <button
            onClick={() => router.push('/pricing')}
            className="bg-rose-600 text-white px-6 py-2 rounded-lg hover:bg-rose-700 transition-colors duration-300"
          >
            Retour aux prestations
          </button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Simulation d'un appel API de paiement
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirection vers une page de confirmation après le paiement réussi
      router.push('/confirmation');
    } catch (err) {
      setError("Une erreur est survenue lors du paiement. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4">
        <Card>
          <CardHeader>
            <h1 className="text-2xl font-bold text-center">Paiement et Réservation</h1>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold mb-4">Récapitulatif de votre réservation</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Séance :</span> {sessionTitle}</p>
                <p><span className="font-medium">Type :</span> {sessionType}</p>
                <p><span className="font-medium">Durée :</span> {duration}</p>
                <div className="flex items-center">
                  <span className="font-medium mr-2">Prix :</span>
                  <Euro className="h-4 w-4 text-rose-600" />
                  <span>{price}</span>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Informations de paiement</h2>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Titulaire de la carte
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="Nom sur la carte"
                  />
                </div>
                <div className="form-group">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Numéro de carte
                  </label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                    placeholder="1234 5678 9012 3456"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'expiration
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="MM/AA"
                    />
                  </div>
                  <div className="form-group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <button
              onClick={handlePayment}
              disabled={loading}
              className={`w-full px-6 py-3 rounded-lg transition-colors duration-300 ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-rose-600 hover:bg-rose-700'
              } text-white flex items-center justify-center`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Traitement en cours...
                </>
              ) : (
                'Procéder au paiement'
              )}
            </button>
            <button
              onClick={() => router.push('/pricing')}
              className="text-gray-600 hover:text-gray-800 transition-colors duration-300"
            >
              Retour aux prestations
            </button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage;