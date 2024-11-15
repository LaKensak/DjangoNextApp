'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Clock, Euro, Video, Users } from 'lucide-react';

interface Session {
  id: string;
  title: string;
  duration: string;
  price: number;
  description: string;
  type: string;
  icon: React.ElementType;
  available: boolean;
}

const PricingPage = () => {
  const router = useRouter();

  const sessions: Session[] = [
    {
      id: 'discovery',
      title: "Séance Découverte",
      duration: "30 minutes",
      price: 30,
      description: "Un premier rendez-vous pour faire connaissance et définir vos objectifs",
      type: "En ligne",
      icon: Video,
      available: true
    },
    {
      id: 'individual',
      title: "Séance Individuelle",
      duration: "1 heure",
      price: 60,
      description: "Un accompagnement personnalisé pour atteindre vos objectifs",
      type: "Présentiel",
      icon: Users,
      available: true
    },
    {
      id: 'package',
      title: "Pack 5 Séances",
      duration: "5 × 1 heure",
      price: 250,
      description: "Un suivi régulier à tarif avantageux (-17%)",
      type: "Présentiel ou en ligne",
      icon: Clock,
      available: true
    }
  ];

  const handleBooking = (session: Session) => {
  if (!session.available) return;

  const bookingDetails = {
    sessionId: session.id,
    sessionTitle: encodeURIComponent(session.title),
    sessionType: encodeURIComponent(session.type),
    duration: encodeURIComponent(session.duration),
    price: session.price.toString()
  };

  // Construire l'URL de manière plus sûre
  const params = new URLSearchParams();
  Object.entries(bookingDetails).forEach(([key, value]) => {
    params.append(key, value);
  });

  router.push(`/payment?${params.toString()}`);
};

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
          Mes Prestations
        </h2>
        <p className="text-center text-gray-600 mb-12">
          Choisissez la formule qui vous convient le mieux
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {sessions.map((session) => {
            const Icon = session.icon;
            return (
              <Card
                key={session.id}
                className={`border ${
                  session.id === 'individual' ? 'border-rose-300 ring-2 ring-rose-500' : 'border-rose-100'
                } hover:shadow-lg transition-all duration-300`}
              >
                <CardHeader>
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mx-auto mb-4">
                    <Icon className="h-6 w-6 text-rose-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-center text-gray-800">
                    {session.title}
                  </h3>
                  {session.id === 'individual' && (
                    <span className="absolute -top-2 right-4 bg-rose-600 text-white px-3 py-1 rounded-full text-sm">
                      Plus populaire
                    </span>
                  )}
                </CardHeader>
                <CardContent className="text-center space-y-4">
                  <div className="flex items-center justify-center space-x-1">
                    <Euro className="h-5 w-5 text-rose-600" />
                    <span className="text-2xl font-bold text-gray-900">{session.price}</span>
                  </div>
                  <p className="text-gray-600">{session.duration}</p>
                  <p className="text-sm text-gray-500">{session.description}</p>
                  <p className="text-sm font-medium text-gray-700">{session.type}</p>
                </CardContent>
                <CardFooter className="flex justify-center">
                  <button
                    onClick={() => handleBooking(session)}
                    disabled={!session.available}
                    className={`w-full px-6 py-2 rounded-lg transition-colors duration-300 ${
                      session.available
                        ? 'bg-rose-600 text-white hover:bg-rose-700'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {session.available ? 'Réserver et payer' : 'Indisponible'}
                  </button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PricingPage;