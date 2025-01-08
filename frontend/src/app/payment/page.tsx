'use client';

import React, {useEffect, useState} from 'react';
import {loadStripe} from '@stripe/stripe-js';
import {jwtDecode} from 'jwt-decode';
// @ts-ignore
import Cookies from "js-cookie";
import {CardElement, Elements, useElements, useStripe} from '@stripe/react-stripe-js';
import {useRouter, useSearchParams} from 'next/navigation';
import {
    ArrowRight,
    CheckCircle2,
    Clock,
    CreditCard,
    Euro,
    Gift,
    Loader2,
    Lock,
    MessageCircle,
    ShieldCheck,
    Star,
    Tag
} from 'lucide-react';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import NavBar from "@/app/section/navbar";
import Footer from "@/app/section/footer";

// Stripe configuration
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

// Types
interface Reservation {
    first_name: string;
    email: string;
    phone: string;
    address: string;
}

interface JwtPayload {
    user_id: string;
    exp: number;
}

const PaymentForm = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const stripe = useStripe();
    const elements = useElements();

    // State Management
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [promoCode, setPromoCode] = useState('');
    const [discount, setDiscount] = useState(0);
    const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
    const [reservationsList, setReservationsList] = useState<Reservation[]>([]);
    const [formData, setFormData] = useState<Reservation>({
        first_name: '',
        email: '',
        phone: '',
        address: ''
    });

    // Retrieve Session Parameters
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

    const originalPrice = parseFloat(price || '0');
    const finalPrice = originalPrice * (1 - discount);

    // Fetch Reservations
    const fetchReservations = async (): Promise<void> => {
        const apiUrl = 'http://127.0.0.1:8000/api/reservations/';
        const accessToken = Cookies.get('accessToken');

        if (!accessToken) {
            setError('Veuillez vous connecter');
            return;
        }

        try {
            const {user_id} = jwtDecode<JwtPayload>(accessToken);

            const response = await fetch(`${apiUrl}?user_id=${user_id}&session_id=${sessionId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erreur ${response.status}: ${response.statusText}`);
            }

            const data: Reservation[] = await response.json();
            setReservationsList(data);

            if (data.length > 0) {
                setFormData(data[0]);
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des données:', (error as Error).message);
            setError('Impossible de charger vos informations');
        }
    };

    useEffect(() => {
        fetchReservations();
    }, []);

    // Handle Input Changes
    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;

        // Formater le numéro de téléphone (ajout d'espaces ou autres séparateurs si nécessaire)
        if (name === "phone") {
            const formattedPhone = formatPhoneNumber(value);
            setFormData((prevData) => ({
                ...prevData,
                [name]: formattedPhone,
            }));
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };
    const formatPhoneNumber = (phone: string): string => {
        // Supprimer les caractères non numériques
        let cleaned = phone.replace(/\D/g, '');

        // Vérifier la longueur du numéro (en France, un numéro a 10 chiffres)
        if (cleaned.length !== 10) {
            return phone; // Retourner tel quel si ce n'est pas un numéro valide à 10 chiffres
        }

        // Formater : (XX) XX XX XX XX
        cleaned = cleaned.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '($1) $2 $3 $4 $5');

        return cleaned;
    };

    // Promo Code Validation
    const validatePromoCode = async () => {
        if (!promoCode.trim()) {
            setError('Veuillez entrer un code promo');
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/validate-promo/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('accessToken')}`
                },
                body: JSON.stringify({
                    code: promoCode,
                    sessionType,
                    sessionId
                })
            });

            const data = await response.json();

            if (data.valid) {
                setDiscount(data.discount);
                setIsPromoDialogOpen(false);
                setError(null);
            } else {
                setError(data.message || 'Code promo invalide');
            }
        } catch (error) {
            setError('Erreur lors de la validation du code promo');
            console.error('Promo code validation error:', error);
        }
    };

    // Payment Handling
    const handlePayment = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(null);

        if (!stripe || !elements) {
            setError('Stripe.js n\'est pas charger');
            setLoading(false);
            return;
        }

        try {
            const cardElement = elements.getElement(CardElement);
            if (!cardElement) {
                setError('Élément de carte non trouvé');
                setLoading(false);
                return;
            }
            const createPaymentIntentResponse = await fetch('http://localhost:8000/api/create-payment-intent/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    amount: Math.round(finalPrice * 100),
                    currency: 'eur',
                    session_id: sessionId,
                }),
            });

            const paymentIntentData = await createPaymentIntentResponse.json();

            if (paymentIntentData.error) {
                setError(paymentIntentData.error);
                setLoading(false);
                return;
            }

            const {error: paymentError, paymentIntent} = await stripe.confirmCardPayment(
                paymentIntentData.client_secret,
                {
                    payment_method: {
                        card: cardElement,
                        billing_details: {},
                    },
                }
            );

            if (paymentError) {
                setError(paymentError.message || 'Paiement échoué');
                setLoading(false);
                return;
            }

            const confirmPaymentResponse = await fetch('http://localhost:8000/api/confirm-payment/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payment_intent_id: paymentIntent?.id,
                    session_id: sessionId,
                }),
            });

            const confirmationData = await confirmPaymentResponse.json();

            if (confirmationData.status === 'success') {
                router.push('/confirmation');
            } else {
                setError(confirmationData.message || 'Échec de la confirmation du paiement');
            }
        } catch (err: any) {
            setError(err.message || "Une erreur est survenue lors du paiement");
        } finally {
            setLoading(false);
        }
    };

    if (!sessionId || !sessionTitle || !price) {
        return (
            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-md w-full text-center space-y-6">
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>
                            Les informations de la séance sont incomplètes.
                        </AlertDescription>
                    </Alert>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        Retour aux prestations
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen">
            <NavBar/>
            <div
                className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-2xl p-6">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Informations de réservation</h2>
                        <form className="space-y-2">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Nom complet</label>
                                <input
                                    type="text"
                                    value={formData.first_name.charAt(0).toUpperCase() + formData.first_name.slice(1).toLowerCase()}
                                    onChange={handleInputChange} // Nom de l'attribut pour identifier le champ
                                    placeholder="Entrez votre nom"
                                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={formData.email.charAt(0).toUpperCase() + formData.email.slice(1).toLowerCase()}
                                    onChange={handleInputChange}
                                    placeholder="Entrez votre email"
                                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500"

                                />
                            </div>

                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Numéro de téléphone</label>
                                <input
                                    type="tel"  // Utilisez 'tel' pour les numéros de téléphone
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    placeholder="Entrez votre numéro de téléphone"
                                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-2">Addresse</label>
                                <input
                                    type="text"
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    placeholder="Entrez votre Addresse"
                                    className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500"

                                />
                            </div>
                        </form>
                    </div>
                    <div className="w-full max-w-md">
                        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                            <div className="bg-gradient-to-r from-rose-500 to-rose-600 text-white p-6 text-center">
                                <h1 className="text-2xl font-bold flex items-center justify-center gap-3">
                                    <CreditCard className="h-7 w-7"/>
                                    Paiement et Réservation
                                </h1>
                            </div>

                            <div className="p-6 space-y-6">
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="flex flex-col items-center text-green-600">
                                        <Lock className="h-6 w-6"/>
                                        <span className="text-xs mt-1">Crypté</span>
                                    </div>
                                    <div className="flex flex-col items-center text-blue-600">
                                        <ShieldCheck className="h-6 w-6"/>
                                        <span className="text-xs mt-1">Sécurisé</span>
                                    </div>
                                    <div className="flex flex-col items-center text-rose-600">
                                        <Star className="h-6 w-6"/>
                                        <span className="text-xs mt-1">Garanti</span>
                                    </div>
                                </div>

                                <div
                                    className="bg-blue-50 rounded-xl p-4 border border-blue-200 flex justify-between items-center">
                                    <div className="flex items-center">
                                        <Gift className="h-6 w-6 text-blue-500 mr-3"/>
                                        <span>Code promo ?</span>
                                    </div>
                                    <button
                                        onClick={() => setIsPromoDialogOpen(true)}
                                        className="text-blue-600 hover:text-blue-800 transition-colors"
                                    >
                                        <ArrowRight className="h-5 w-5"/>
                                    </button>
                                </div>

                                <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 space-y-3">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <MessageCircle className="h-5 w-5 mr-2 text-rose-500"/>
                                        Détails de la séance
                                    </h2>
                                    <div className="space-y-2 text-gray-700">
                                        <div className="flex justify-between items-center">
                                    <span className="font-medium flex items-center">
                                        <Clock className="h-4 w-4 mr-2 text-rose-500"/>
                                        Séance
                                    </span>
                                            <span>{sessionTitle}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Type</span>
                                            <span>{sessionType}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium">Durée</span>
                                            <span>{duration}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="font-medium">Prix</span>
                                            <div className="flex items-center">
                                                <Euro className="h-4 w-4 text-rose-600 mr-1"/>
                                                <span>{originalPrice.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {discount > 0 && (
                                    <div className="text-center text-sm text-green-600">
                                        Réduction appliquée : {(discount * 100).toFixed(0)}%
                                        (Nouveau prix : {finalPrice.toFixed(2)}€)
                                    </div>
                                )}

                                <form onSubmit={handlePayment} className="space-y-4">
                                    <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                                        <CreditCard className="h-5 w-5 mr-2 text-rose-500"/>
                                        Informations de paiement
                                    </h2>

                                    <div className="form-group">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Détails de la carte
                                        </label>
                                        <CardElement
                                            options={{
                                                style: {
                                                    base: {
                                                        fontSize: '16px',
                                                        color: '#424770',
                                                        '::placeholder': {
                                                            color: '#aab7c4',
                                                        },
                                                    },
                                                    invalid: {
                                                        color: '#9e2146',
                                                    },
                                                },
                                            }}
                                            className="p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-rose-500 transition-all duration-300"
                                        />
                                    </div>

                                    {error && (
                                        <Alert variant="destructive" className="rounded-xl">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={loading || !stripe}
                                        className={`w-full px-6 py-3 rounded-xl transition-all duration-300 flex items-center justify-center ${
                                            loading || !stripe
                                                ? 'bg-gray-400 cursor-not-allowed'
                                                : 'bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white shadow-lg hover:shadow-xl'
                                        }`}
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="animate-spin h-5 w-5 mr-2"/>
                                                Traitement en cours...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle2 className="h-5 w-5 mr-2"/>
                                                Procéder au paiement
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="text-center text-xs text-gray-500 mt-4 space-y-2">
                                    <p className="flex items-center justify-center">
                                        <ShieldCheck className="h-4 w-4 mr-2 text-green-500"/>
                                        Paiement 100% sécurisé
                                    </p>
                                    <p className="flex items-center justify-center">
                                        <Tag className="h-4 w-4 mr-2 text-rose-500"/>
                                        Aucune information bancaire n'est conservée
                                    </p>
                                </div>

                                <button
                                    onClick={() => router.push('/')}
                                    className="w-full text-gray-600 hover:text-gray-800 text-center underline transition-colors duration-300"
                                >
                                    Retour aux prestations
                                </button>
                            </div>
                        </div>
                    </div>

                    <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Code Promo</DialogTitle>
                                <DialogDescription>
                                    Entrez votre code promo pour bénéficier d'une réduction
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    placeholder="Votre code promo"
                                    className="w-full p-2 border rounded"
                                />
                                <button
                                    onClick={validatePromoCode}
                                    className="w-full bg-rose-500 text-white p-2 rounded hover:bg-rose-600"
                                >
                                    Valider
                                </button>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

            </div>
            <Footer/>
        </div>
    );
};

const StripePaymentPage = () => {
    return (
        <Elements stripe={stripePromise}>
            <PaymentForm/>
        </Elements>
    );
};

export default StripePaymentPage;