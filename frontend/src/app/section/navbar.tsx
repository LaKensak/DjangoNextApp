import React, { useState, useEffect } from 'react';
import {useRouter} from "next/navigation";
// @ts-ignore
import Cookies from "js-cookie";

const NavBar = () => {
    const [username, setUsername] = useState<string | null>(null);
    const router = useRouter();

    // Vérifier si l'utilisateur est connecté et obtenir son nom d'utilisateur depuis les cookies
    useEffect(() => {
        const storedUsername = Cookies.get('username'); // Récupérer le cookie "username"
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    const handleLoginClick = () => {
        sessionStorage.setItem('canAccessLogin', 'true'); // Permet l'accès temporaire
        router.push('/login'); // Redirige vers la page login
    };


   return (
        <nav className="bg-rose-50 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold text-rose-600">CoachConjugal</div>
                <div className="space-x-6">
                    <a href="/" className="text-gray-600 hover:text-rose-600">Accueil</a>
                    <a href="/#services" className="text-gray-600 hover:text-rose-600">Services</a>
                    <a href="#" className="text-gray-600 hover:text-rose-600">À propos</a>
                    <a href="#contact" className="text-gray-600 hover:text-rose-600">Contact</a>
                    <a
                        href={username ? "/dashboard" : "/login"}
                        onClick={!username ? handleLoginClick : undefined}
                        className="text-gray-600 hover:text-rose-600"
                    >
                        {username ? username.charAt(0).toUpperCase() + username.slice(1).toLowerCase(): 'Login'}
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;