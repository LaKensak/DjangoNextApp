'use client';

import React, {useEffect, useState, useRef} from 'react';
import {useRouter} from 'next/navigation';
import {Card, CardHeader, CardContent, CardFooter} from '@/components/ui/card';
import {Clock, Euro, Video, Users} from 'lucide-react';

// @ts-ignore
import Cookies from "js-cookie";

interface Session {
    id: string;
    title: string;
    duration: string;
    price: number;
    description: string;
    type: string;
    icon: string;  // Maintenant, 'icon' est une chaîne qui représente l'icône
    available: boolean;
}

const PricingPage = () => {
    const router = useRouter();
    const [sessions, setSessions] = useState<Session[]>([]); // Initialiser le tableau de sessions
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false); // Nouveau state pour l'authentification
    const [showAuthMessage, setShowAuthMessage] = useState<boolean>(false); // Nouvel état pour afficher le message d'authentification
    const authMessageRef = useRef<HTMLDivElement | null>(null); // Référence pour le message d'authentification

    // Mapping des icônes à leurs composants respectifs
    const iconMap: { [key: string]: React.ElementType } = {
        Video: Video,
        Users: Users,
        Clock: Clock,
    };

    // Fonction pour récupérer les sessions depuis l'API
    const fetchSessions = async () => {
        try {
            const response = await fetch('http://127.0.0.1:8000/api/sessions/');  // Assurez-vous que l'URL est correcte
            if (!response.ok) {
                throw new Error('Erreur lors de la récupération des sessions');
            }
            const data = await response.json();
            setSessions(data);  // Mettre à jour les sessions avec les données de l'API
        } catch (err) {
            console.error(err);
            setError('Impossible de charger les sessions.');
        } finally {
            setLoading(false);  // Fin du chargement
        }
    };

    // Vérification si l'utilisateur est authentifié
    const checkAuthentication = () => {
        const token = Cookies.get('accessToken');
        if (token) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        fetchSessions();  // Récupérer les sessions lors du montage du composant
        checkAuthentication();  // Vérifier l'authentification lors du montage
    }, []);

    const handleBooking = (session: Session) => {
        if (!session.available) return;

        if (!isAuthenticated) {
            // Si l'utilisateur n'est pas connecté, afficher le message et rediriger vers la page de connexion
            setShowAuthMessage(true); // Afficher le message d'authentification
            // Attendre un moment pour laisser l'élément s'afficher avant de défiler
            setTimeout(() => {
                if (authMessageRef.current) {
                    // Effectuer un défilement en douceur vers le message
                    authMessageRef.current.scrollIntoView({
                        behavior: 'smooth', // Défilement en douceur
                        block: 'start', // L'élément sera aligné en haut de la page
                    });
                }
            }, 50); // Attente avant de défiler, pour laisser le DOM se mettre à jour

            setTimeout(() => {
                router.push('/login');  // Redirige l'utilisateur vers la page de connexion via Next.js
            }, 2500); // Redirection après un petit délai
            return;
        }

        // Rediriger vers le formulaire de réservation
        const bookingDetails = {
            sessionId: session.id,
            sessionTitle: encodeURIComponent(session.title),
            sessionType: encodeURIComponent(session.type),
            duration: encodeURIComponent(session.duration),
            price: session.price.toString(),
        };

        // Construire l'URL de manière plus sûre
        const params = new URLSearchParams();
        Object.entries(bookingDetails).forEach(([key, value]) => {
            params.append(key, value);
        });

        // Rediriger vers le formulaire de réservation
        router.push(`/reservation?${params.toString()}`);
    };

    if (loading) {
        return <div>Chargement des sessions...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <section className="py-16 bg-white" id="prestation">
            <div className="max-w-7xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center text-gray-800 mb-4">
                    Mes Prestations
                </h2>
                <p className="text-center text-gray-600 mb-12">
                    Choisissez la formule qui vous convient le mieux
                </p>

                {/* Message d'authentification visible et explicite */}
                {showAuthMessage && (
                    <div
                        ref={authMessageRef} // Cibler cet élément avec la référence
                        className="w-full bg-red-600 text-white p-4 text-center font-semibold mb-4"
                    >
                        <p>Vous devez être connecté pour réserver une séance. Redirection vers la page de
                            connexion...</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sessions.map((session) => {
                        const Icon = iconMap[session.icon] || Clock; // Utiliser le mapping pour obtenir l'icône

                        return (
                            <Card
                                key={session.id}
                                className={`border ${session.id === 'individual' ? 'border-rose-300 ring-2 ring-rose-500' : 'border-rose-100'} hover:shadow-lg transition-all duration-300`}
                            >
                                <CardHeader>
                                    <div
                                        className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-100 mx-auto mb-4">
                                        <Icon className="h-6 w-6 text-rose-600"/>
                                    </div>
                                    <h3 className="text-xl font-semibold text-center text-gray-800">
                                        {session.title}
                                    </h3>
                                </CardHeader>
                                <CardContent className="text-center space-y-4">
                                    <div className="flex items-center justify-center space-x-1">
                                        <Euro className="h-5 w-5 text-rose-600"/>
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
                                        className={`w-full px-6 py-2 rounded-lg transition-colors duration-300 ${session.available ? 'bg-rose-600 text-white hover:bg-rose-700' : 'bg-gray-300 text-gray-500 cursor-not-allowed'}`}
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
