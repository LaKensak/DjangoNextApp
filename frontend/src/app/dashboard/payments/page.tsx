"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import Cookies from "js-cookie";

const PaymentsPage = () => {
    const router = useRouter();
    const [payments, setPayments] = useState<any[]>([]);  // Spécifier le type pour la liste des paiements
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPayments = async () => {
            setLoading(true);
            try {
                // Récupérer le token d'accès dans les cookies
                const token = Cookies.get("accessToken");  // Utiliser Cookies.get pour récupérer le token

                if (!token) {
                    // Si aucun token n'est trouvé, redirigez vers la page de connexion
                    router.push("/login");
                    return;
                }

                const response = await fetch('http://127.0.0.1:8000/api/payments/', {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,  // Ajouter le token dans les headers
                    },
                    credentials: 'include',  // Utiliser 'include' pour envoyer les cookies au serveur
                });

                if (response.ok) {
                    const data = await response.json();
                    setPayments(data.payments);
                } else {
                    setError('Impossible de récupérer les paiements.');
                }
            } catch (err) {
                console.error("Erreur lors de la récupération des paiements :", err);
                setError('Une erreur s’est produite. Veuillez réessayer plus tard.');
            } finally {
                setLoading(false);  // Fin du chargement
            }
        };

        fetchPayments();
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
                <p className="ml-4">Chargement des paiements...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <div className="flex flex-1 p-6">
                <div className="w-full max-w-4xl mx-auto">
                    <h1 className="text-2xl font-bold text-gray-700 mb-4">Vos paiements</h1>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
                            {error}
                        </div>
                    )}

                    {payments.length === 0 ? (
                        <div className="bg-gray-100 text-gray-600 p-4 rounded-lg">
                            Aucun paiement trouvé.
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white shadow-md rounded-lg">
                            <table className="min-w-full table-auto">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="px-4 py-2 text-left">Date</th>
                                        <th className="px-4 py-2 text-left">Montant</th>
                                        <th className="px-4 py-2 text-left">Statut</th>
                                        <th className="px-4 py-2 text-left">Référence</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {payments.map((payment) => (
                                        <tr key={payment.id} className="border-b">
                                            <td className="px-4 py-2">{new Date(payment.date).toLocaleDateString()}</td>
                                            <td className="px-4 py-2">{payment.amount.toFixed(2)} €</td>  {/* Format du montant avec 2 décimales */}
                                            <td className="px-4 py-2">{payment.status}</td>
                                            <td className="px-4 py-2">{payment.reference}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentsPage;
