"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
// @ts-ignore
import Cookies from "js-cookie";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

const SettingsPage = () => {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [first_name, setFirstName] = useState("");
    const [last_name, setLastName] = useState("");
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Récupérer les informations utilisateur
    useEffect(() => {
        const fetchUserData = async () => {
            const token = Cookies.get("accessToken");

            if (!token) {
                router.push("/login");
                return;
            }

            try {
                const response = await fetch("http://127.0.0.1:8000/api/user/", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUsername(data.username);
                    setEmail(data.email);
                    setFirstName(data.first_name);
                    setLastName(data.last_name);
                } else {
                    router.push("/login");
                }
            } catch (err) {
                console.error("Erreur de chargement des données utilisateur :", err);
                router.push("/login");
            }
        };

        fetchUserData();
    }, [router]);

    // Mettre à jour les informations utilisateur
    const handleUpdateProfile = async () => {
        setError(null);
        setSuccessMessage(null);

        const token = Cookies.get("accessToken");

        if (!token) {
            setError("Votre session a expiré. Veuillez vous reconnecter.");
            router.push("/login");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/update-profile/", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    username,
                    first_name,
                    last_name,
                    email,
                }),
            });

            if (response.ok) {
                setSuccessMessage("Vos paramètres ont été mis à jour avec succès.");
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "Une erreur est survenue. Veuillez réessayer.");
            }
        } catch (err) {
            console.error("Erreur de mise à jour :", err);
            setError("Une erreur s'est produite. Veuillez réessayer plus tard.");
        }
    };

    // Changer le mot de passe
    const handlePasswordChange = async () => {
        setError(null);
        setSuccessMessage(null);

        if (newPassword !== confirmNewPassword) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }

        const token = Cookies.get("accessToken");

        if (!token) {
            setError("Votre session a expiré. Veuillez vous reconnecter.");
            router.push("/login");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:8000/api/change-password/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    current_password: password,
                    new_password: newPassword,
                }),
            });

            if (response.ok) {
                setSuccessMessage("Votre mot de passe a été changé avec succès.");
                setPassword("");
                setNewPassword("");
                setConfirmNewPassword("");
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "Une erreur est survenue. Veuillez réessayer.");
            }
        } catch (err) {
            console.error("Erreur lors du changement de mot de passe :", err);
            setError("Une erreur s'est produite. Veuillez réessayer plus tard.");
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-grow flex items-center justify-center bg-gray-50">
                <Card className="w-full max-w-lg">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-center">Paramètres</h1>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom d'utilisateur
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Prénom
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={first_name}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nom
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={last_name}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <hr className="my-4" />
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Mot de passe actuel
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Confirmer le nouveau mot de passe
                            </label>
                            <input
                                type="password"
                                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="••••••••"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                            />
                        </div>
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
                        )}
                        {successMessage && (
                            <div className="bg-green-50 text-green-600 p-4 rounded-lg">
                                {successMessage}
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        <button
                            onClick={handleUpdateProfile}
                            className="bg-rose-600 text-white px-6 py-3 rounded-lg hover:bg-rose-700 transition-colors duration-300"
                        >
                            Enregistrer les informations
                        </button>
                        <button
                            onClick={handlePasswordChange}
                            className="bg-rose-200 text-rose-600 px-6 py-3 rounded-lg hover:bg-rose-300 transition-colors duration-300"
                        >
                            Changer le mot de passe
                        </button>
                    </CardFooter>
                </Card>
            </main>
        </div>
    );
};

export default SettingsPage;
