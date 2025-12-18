
import React, { useState } from 'react';

interface WelcomeScreenProps {
  onStart: (name: string) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onStart(name.trim());
    }
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center transform transition hover:scale-105 border-8 border-pink-400 z-20 relative">
      <h1 className="comic-font text-5xl text-pink-600 mb-6 drop-shadow-lg">¡MultiAventura!</h1>
      <div className="text-6xl mb-6">🧮 🎒</div>
      <p className="text-xl text-gray-700 mb-8">¡Hola! ¿Cómo te llamas, personita aventurera?</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Escribe tu nombre aquí..."
          className="w-full p-4 text-2xl text-center rounded-2xl border-4 border-blue-300 focus:border-blue-500 outline-none transition-all placeholder:text-gray-300"
          required
        />
        <button
          type="submit"
          className="w-full bg-yellow-400 hover:bg-yellow-500 text-pink-700 comic-font text-3xl py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all border-b-8 border-yellow-600"
        >
          ¡VAMOS A JUGAR! 🚀
        </button>
      </form>
    </div>
  );
};

export default WelcomeScreen;
