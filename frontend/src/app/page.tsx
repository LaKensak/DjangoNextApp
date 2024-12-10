'use client';

import React from 'react';
import Services from './section/services';
import NavBar from './section/navbar';
import Footer from './section/footer';
import PricingPage from './section/PricingSection';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-white">
            <NavBar/>

            {/* Hero Section */}
            <div className="bg-rose-50 py-20">
                <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold text-gray-800">
                            Bienvenue !
                        </h1>
                        <p className="text-xl text-gray-600">
                            Je suis Sarah, votre coach en confiance en soi. Je vous accompagne dans votre démarche de
                            bien-être.
                        </p>
                        <button className="bg-rose-600 text-white px-8 py-3 rounded-lg hover:bg-rose-700">
                            Prendre rendez-vous
                        </button>
                    </div>
                    <div className="flex justify-center items-center">
                        <div className="w-64 h-64 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                            Photo de moi
                        </div>
                    </div>
                </div>
            </div>

            <Services/>
            <PricingPage/>

            <div className="bg-rose-50 py-16">
                <div className="max-w-3xl mx-auto px-4 text-center">
                    <p className="text-2xl italic text-gray-700">
                        "On ne coupe pas la corde quand tu peux défaire les nœuds"
                    </p>
                </div>
            </div>

            <Footer/>
        </div>
    );
}

export default LandingPage;