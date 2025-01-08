"use client";
import React, {useState, useEffect} from 'react';
import {useRouter} from 'next/navigation';
// @ts-ignore
import Cookies from 'js-cookie';
import NavBar from "@/app/section/navbar";
import Footer from "@/app/section/footer";

interface SessionDetails {
    sessionId: string;
    sessionTitle: string;
    sessionType: string;
    duration: string;
    price: string;
}

interface FormData {
    first_name: string;
    email: string;
    phone: string;
    address: string;
    gdprConsent: boolean;
    rdv: string;
}

const ReservationPage: React.FC = () => {
    const [isDateAvailable, setIsDateAvailable] = useState<boolean | null>(null);
    const [isValidTime, setIsValidTime] = useState<boolean>(true);

    const checkAvailability = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:8000/api/check_availability?rdv=${encodeURIComponent(formData.rdv)}`);
            const data = await response.json();
            setIsDateAvailable(data.available);
            return data.available;
        } catch (error) {
            console.error('Erreur lors de la vérification de disponibilité :', error);
            setErrorMessage('Erreur lors de la vérification de la disponibilité.');
            return false;
        }
    };

    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        first_name: '',
        email: '',
        phone: '',
        address: '',
        gdprConsent: false,
        rdv: ''
    });

    const [sessionDetails, setSessionDetails] = useState<SessionDetails>({
        sessionId: '',
        sessionTitle: '',
        sessionType: '',
        duration: '',
        price: '',
    });

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');

    useEffect(() => {
        const queryParams = new URLSearchParams(window.location.search);
        const sessionId = queryParams.get('sessionId') || '';
        const sessionTitle = queryParams.get('sessionTitle') || '';
        const sessionType = queryParams.get('sessionType') || '';
        const duration = queryParams.get('duration') || '';
        const price = queryParams.get('price') || '';

        setSessionDetails({
            sessionId,
            sessionTitle: decodeURIComponent(sessionTitle),
            sessionType,
            duration,
            price,
        });
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const selectedDateTime = new Date(formData.rdv);
        const hours = selectedDateTime.getHours();
        if (hours < 8 || hours >= 18) {
            setErrorMessage('Les rendez-vous sont uniquement disponibles entre 8h00 et 18h00.');
            return;
        }

        const isAvailable = await checkAvailability();
        if (!isAvailable) {
            setErrorMessage('Cette date et heure sont déjà réservées. Veuillez choisir une autre plage horaire.');
            return;
        }

        if (!formData.first_name.trim()) {
            setErrorMessage('Veuillez saisir votre nom.');
            return;
        }

        if (!formData.rdv) {
            setErrorMessage('Veuillez sélectionner une date et une heure pour le rendez-vous.');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData.email)) {
            setErrorMessage('Veuillez saisir une adresse e-mail valide.');
            return;
        }

        const phoneRegex = /^(\+\d{1,3}[- ]?)?\d{10,13}$/;
        if (!phoneRegex.test(formData.phone)) {
            setErrorMessage('Veuillez saisir un numéro de téléphone valide.');
            return;
        }

        if (!formData.address.trim()) {
            setErrorMessage('Veuillez saisir votre adresse.');
            return;
        }

        if (!formData.gdprConsent) {
            setErrorMessage('Vous devez accepter les conditions d\'utilisation.');
            return;
        }

        setIsLoading(true);
        setErrorMessage('');

        try {
            const accessToken = Cookies.get('accessToken');

            if (!accessToken) {
                throw new Error('Aucun jeton d\'accès trouvé');
            }

            const response = await fetch('http://127.0.0.1:8000/api/reservations/', {
                method: 'POST',
                body: JSON.stringify({
                    sessionId: sessionDetails.sessionId,
                    first_name: formData.first_name.trim(),
                    email: formData.email.trim(),
                    phone: formData.phone.trim(),
                    address: formData.address.trim(),
                    rdv: formData.rdv
                }),
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                setIsSuccess(true);
                setTimeout(() => {
                    router.push(`/payment?sessionId=${sessionDetails.sessionId}&sessionTitle=${encodeURIComponent(sessionDetails.sessionTitle)}&sessionType=${encodeURIComponent(sessionDetails.sessionType)}&duration=${encodeURIComponent(sessionDetails.duration)}&price=${encodeURIComponent(sessionDetails.price)}`);
                }, 1500);
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Erreur lors de la réservation');
            }
        } catch (error) {
            console.error('Reservation error:', error);
            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : 'Erreur lors de la connexion au serveur'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const generateMinMaxDateTime = () => {
        const now = new Date();
        const minDateTime = now.toISOString().slice(0, 16);

        // Date maximale dans 3 mois
        const maxDateTime = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate(), 18, 0)
            .toISOString().slice(0, 16);

        return {minDateTime, maxDateTime};
    };

    const {minDateTime, maxDateTime} = generateMinMaxDateTime();

    const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedDateTime = new Date(e.target.value);
        const hours = selectedDateTime.getHours();

        // Vérification des heures autorisées
        if (hours < 8 || hours >= 18) {
            setIsValidTime(false);
            setErrorMessage('Les rendez-vous sont uniquement disponibles entre 8h00 et 18h00.');
            setFormData({...formData, rdv: ''}); // Réinitialiser la valeur non valide
            return;
        }

        // Réinitialiser les messages d'erreur
        setIsValidTime(true);
        setErrorMessage('');
        setFormData({...formData, rdv: e.target.value});
    };

    const handleHourChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const hour = parseInt(e.target.value, 10);
        const currentRdv = new Date(formData.rdv);
        currentRdv.setHours(hour);
        setFormData({...formData, rdv: currentRdv.toISOString()});
    };

    const handleMinuteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const minute = parseInt(e.target.value, 10);
        const currentRdv = new Date(formData.rdv);
        currentRdv.setMinutes(minute);
        setFormData({...formData, rdv: currentRdv.toISOString()});
    };

    useEffect(() => {
        const adjustDateTimePicker = () => {
            const datetimeInput = document.getElementById('appointmentDateTime') as HTMLInputElement;

            if (datetimeInput) {
                // Ajouter un gestionnaire d'événements pour filtrer les heures
                datetimeInput.addEventListener('change', () => {
                    const selectedDateTime = new Date(datetimeInput.value);
                    const hours = selectedDateTime.getHours();

                    // Heures non autorisées
                    const invalidHours = Array.from({length: 24}, (_, i) => i)
                        .filter(hour => hour < 8 || hour >= 18);

                    // Modifier le min et max pour exclure certaines heures
                    invalidHours.forEach(hour => {
                        const optionToRemove = datetimeInput.querySelector(`option[value="${hour}"]`);
                        if (optionToRemove) {
                            optionToRemove.remove();
                        }
                    });
                });
            }
        };

        adjustDateTimePicker();
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            <NavBar/>
            <main className="flex-grow py-8 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-2xl sm:text-3xl font-bold text-center text-gray-800 mb-4">
                        Réservez votre séance : {sessionDetails.sessionTitle}
                    </h2>
                    <p className="text-center text-gray-600 mb-8 px-4">
                        Veuillez remplir les informations nécessaires pour finaliser votre réservation.
                    </p>

                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Section des détails de la séance */}
                        <section
                            className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl">
                            <div className="flex items-center mb-4">
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-8 w-8 text-rose-500 mr-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                </svg>
                                <h3 className="text-xl font-bold text-gray-800">Détails de la Séance</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    {label: "Séance", value: sessionDetails.sessionTitle},
                                    {label: "Type", value: sessionDetails.sessionType},
                                    {label: "Durée", value: `${sessionDetails.duration}`},
                                    {label: "Prix", value: `${sessionDetails.price} €`},
                                ].map(({label, value}) => (
                                    <div
                                        key={label}
                                        className="bg-white rounded-lg px-4 py-3 shadow-sm border border-gray-100 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium text-gray-600">{label}</span>
                                            <span
                                                className="text-gray-800 font-semibold">{decodeURI(value || "N/A")}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Section du formulaire */}
                        <section>
                            {isLoading && (
                                <div className="text-center text-blue-600 mb-4">
                                    Chargement en cours...
                                </div>
                            )}
                            {isSuccess && (
                                <div className="text-center text-green-600 mb-4">
                                    Réservation confirmée ! Redirection vers le paiement...
                                </div>
                            )}
                            {errorMessage && (
                                <div className="text-center text-red-600 mb-4">{errorMessage}</div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Nom
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.first_name}
                                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                        required
                                        placeholder="Votre nom complet"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                        E-mail
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                        placeholder="nom@exemple.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                                        Numéro de téléphone
                                    </label>
                                    <input
                                        type="text"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/\D/g, "");
                                            setFormData({...formData, phone: value});
                                        }}
                                        inputMode="numeric"
                                        pattern="[0-9]*"
                                        required
                                        placeholder="06 12 34 56 78"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Adresse
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        value={formData.address}
                                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                                        required
                                        rows={3}
                                        placeholder="123 Rue de l'Exemple, 75001 Paris"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="appointmentDateTime"
                                           className="block text-sm font-medium text-gray-700 mb-2">
                                        Date et heure du rendez-vous
                                    </label>
                                    <input
                                        type="datetime-local"
                                        id="appointmentDateTime"
                                        name="appointmentDateTime"
                                        value={formData.rdv}
                                        onChange={handleDateTimeChange}
                                        min={minDateTime}
                                        max={maxDateTime}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                                    />
                                    {(!isValidTime || isDateAvailable === false) && (
                                        <p className="text-red-600 text-sm mt-2">
                                            {errorMessage || "Cette date et heure sont déjà réservées."}
                                        </p>
                                    )}
                                </div>

                                <div>
                                    <label className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            checked={formData.gdprConsent}
                                            onChange={() =>
                                                setFormData({...formData, gdprConsent: !formData.gdprConsent})
                                            }
                                            required
                                            className="h-4 w-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
                                        />
                                        <span className="text-sm text-gray-600">
                                        J'accepte la{" "}
                                            <a
                                                href="/terms"
                                                className="text-rose-600 hover:underline focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            >
                                            politique de confidentialité
                                        </a>{" "}
                                            et{" "}
                                            <a
                                                href="/terms"
                                                className="text-rose-600 hover:underline focus:outline-none focus:ring-2 focus:ring-rose-500"
                                            >
                                            les conditions d'utilisation
                                        </a>.
                                    </span>
                                    </label>
                                </div>

                                <div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full px-6 py-3 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? "Confirmation en cours..." : "Confirmer la réservation"}
                                    </button>
                                </div>
                            </form>
                        </section>
                    </div>
                </div>
            </main>
            <Footer/>
        </div>
    );

};

export default ReservationPage;