import React from 'react';
import { HeartHandshake, Calendar, Book } from 'lucide-react';

const Footer = () =>{
  return (
      <footer className="bg-gray-800 text-white py-8" id="contact">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-8">
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p>Email: contact@coachconjugal.fr</p>
              <p>Tél: 01 23 45 67 89</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Liens Rapides</h4>
              <ul className="space-y-2">
                <li><a href="/" className="hover:text-rose-300">Accueil</a></li>
                <li><a href="/#services" className="hover:text-rose-300">Services</a></li>
                <li><a href="/#prestation" className="hover:text-rose-300">Prestations</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Suivez-moi</h4>
              <div className="space-x-4">
                <a href="#" className="hover:text-rose-300">Instagram</a>
                <a href="#" className="hover:text-rose-300">LinkedIn</a>
                <a href="#" className="hover:text-rose-300">Facebook</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
}

export default Footer;