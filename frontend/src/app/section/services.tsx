import React from 'react';
import { HeartHandshake, Calendar, Book } from 'lucide-react';

const Services = () =>{
  return (
      <section id="services">
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Mes Services</h2>
            <div className="grid grid-cols-3 gap-8">
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <HeartHandshake className="w-12 h-12 text-rose-600 mb-4"/>
                <h3 className="text-xl font-bold mb-2">Coaching Couple</h3>
                <p className="text-gray-600">Accompagnement personnalisé pour renforcer votre relation.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <Calendar className="w-12 h-12 text-rose-600 mb-4"/>
                <h3 className="text-xl font-bold mb-2">Consultation Individuelle</h3>
                <p className="text-gray-600">Des séances sur-mesure pour votre développement personnel.</p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <Book className="w-12 h-12 text-rose-600 mb-4"/>
                <h3 className="text-xl font-bold mb-2">Ressources</h3>
                <p className="text-gray-600">Des outils et conseils pour progresser à votre rythme.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
}

export default Services;