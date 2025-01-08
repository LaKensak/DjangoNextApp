"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NavBar from "@/app/section/navbar";
import dynamic from "next/dynamic";
const SettingsPage = dynamic(() => import("@/app/dashboard/settings/page"));
// @ts-ignore
import Cookies from "js-cookie";
import PaymentsPage from "@/app/dashboard/payments/page";

const DashboardPage = () => {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState("overview"); // Par défaut, afficher l'aperçu
  const [username, setUsername] = useState("Utilisateur");
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true); // État pour contrôler la visibilité de la section bienvenue

  // Vérifiez si l'utilisateur est connecté
  useEffect(() => {
    const accessToken = Cookies.get("accessToken");
    const storedUsername = Cookies.get("username");

    if (!accessToken) {
      router.push("/login"); // Redirigez vers la page de login si pas authentifié
    } else {
      setUsername(storedUsername || "Utilisateur");
    }
  }, [router]);

  // Gestion du logout
  const handleLogout = () => {
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    Cookies.remove("username");
    router.push("/login");
  };

  // Menu du tableau de bord
  const menuItems = [
    { label: "Aperçu", action: () => { setActiveSection("overview"); setShowWelcomeMessage(true); } },
    { label: "Profil", action: () => { setActiveSection("profile"); setShowWelcomeMessage(false); } },
    { label: "Vos paiements", action: () => { setActiveSection("payments"); setShowWelcomeMessage(false); } },
    { label: "Paramètres", action: () => { setActiveSection("settings"); setShowWelcomeMessage(false); } },
    { label: "Se déconnecter", action: handleLogout },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <NavBar />
      <div className="flex flex-1">
        <aside className="w-64 bg-rose-100 p-6 fixed top-0 left-0 h-full z-10">
          <h2 className="text-lg font-bold text-rose-600 mb-4">Dashboard Menu</h2>
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <button
                  onClick={item.action}
                  className="w-full text-left block text-gray-700 hover:bg-rose-200 hover:text-rose-600 rounded-lg px-3 py-2"
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex-1 p-6 ml-64">
          {/* Afficher la section de bienvenue si showWelcomeMessage est vrai */}
          {showWelcomeMessage && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-700">
                Bienvenue, {username.charAt(0).toUpperCase() + username.slice(1).toLowerCase()}
              </h1>
              <p className="text-gray-600 mt-2">
                Utilisez le menu de gauche pour naviguer dans les différentes sections de votre tableau de bord.
              </p>
            </div>
          )}

          {/* Afficher la section active */}
          {activeSection === "overview" && (
            <div>
              <h2 className="text-xl font-semibold">Aperçu</h2>
              <p className="text-gray-700 mt-2">Contenu de l'aperçu ici.</p>
            </div>
          )}

          {activeSection === "profile" && (
            <div>
              <h2 className="text-xl font-semibold">Profil</h2>
              <p className="text-gray-700 mt-2">Contenu du profil ici.</p>
            </div>
          )}

          {activeSection === "payments" && (
            <div>
              <h2 className="text-xl font-semibold">Vos paiements</h2>
              <PaymentsPage />
            </div>
          )}

          {activeSection === "settings" && (
            <div>
              <h2 className="text-xl font-semibold">Paramètres</h2>
              <SettingsPage /> {/* Afficher dynamiquement les paramètres ici */}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;
