"use client";
import React from 'react';
import { CheckCircle2, Home } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavBar from "@/app/section/navbar";
import Footer from "@/app/section/footer";

const ConfirmationPage = () => {
    const router = useRouter();

    return (
        <div className="flex flex-col min-h-screen">
            <NavBar />
            <div className="flex-grow bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center space-y-6">
                    <CheckCircle2 className="mx-auto h-24 w-24 text-green-500" />

                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-4">Paiement Confirmé !</h1>
                        <p className="text-gray-600 mb-6">
                            Merci pour votre réservation. Votre paiement a été traité avec succès.
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                        <h2 className="text-xl font-semibold text-green-700 mb-2">Détails de la réservation</h2>
                        <div className="space-y-2 text-gray-700">
                            <div className="flex justify-between">
                                <span className="font-medium">Statut</span>
                                <span className="text-green-600 font-bold">Payé</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Méthode</span>
                                <span>Carte Bancaire</span>
                            </div>
                        </div>
                    </div>

                    <div className="text-sm text-gray-500 space-y-2">
                        <p>Un email de confirmation va vous être envoyé.</p>
                        <p>Pour toute question, contactez notre support.</p>
                    </div>

                    <button
                        onClick={() => router.push('/')}
                        className="w-full bg-gradient-to-r from-rose-500 to-rose-600 text-white px-6 py-3 rounded-xl hover:from-rose-600 hover:to-rose-700 transition-all duration-300 flex items-center justify-center"
                    >
                        <Home className="h-5 w-5 mr-2" />
                        Retour à l'accueil
                    </button>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ConfirmationPage;