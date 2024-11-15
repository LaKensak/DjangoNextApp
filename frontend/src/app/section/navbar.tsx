import React from 'react';


const NavBar = () => {
    return (
        <nav className="bg-rose-50 p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <div className="text-2xl font-bold text-rose-600">CoachConjugal</div>
                <div className="space-x-6">
                    <a href="#" className="text-gray-600 hover:text-rose-600">Accueil</a>
                    <a href="#services" className="text-gray-600 hover:text-rose-600">Services</a>
                    <a href="#" className="text-gray-600 hover:text-rose-600">À propos</a>
                    <a href="#contact" className="text-gray-600 hover:text-rose-600">Contact</a>
                </div>
            </div>
        </nav>
    );
}

export default NavBar;