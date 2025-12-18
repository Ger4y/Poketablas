
import React, { useState } from 'react';
import { ChevronLeft, X } from 'lucide-react';

interface AlbumProps {
  cards: string[];
  onBack: () => void;
}

const Album: React.FC<AlbumProps> = ({ cards, onBack }) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);

  return (
    <div className="w-full max-w-5xl h-[80vh] bg-white rounded-3xl shadow-2xl border-8 border-yellow-400 overflow-hidden flex flex-col relative z-20">
      <div className="bg-yellow-400 p-6 flex justify-between items-center shadow-md">
        <button 
          onClick={onBack}
          className="bg-white/20 hover:bg-white/40 text-pink-700 p-2 rounded-xl transition flex items-center gap-2 font-bold"
        >
          <ChevronLeft size={24} /> VOLVER
        </button>
        <h2 className="comic-font text-3xl text-pink-700">Mi Álbum Pokémon 🎒</h2>
        <div className="bg-white/30 px-4 py-1 rounded-full text-pink-800 font-bold">
          {cards.length} CARTAS
        </div>
      </div>

      <div className="flex-grow p-8 overflow-y-auto bg-gradient-to-b from-blue-50 to-pink-50">
        {cards.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <div className="text-9xl mb-6 opacity-30 grayscale">🃏</div>
            <h3 className="comic-font text-4xl text-gray-400">¡Tu álbum está vacío!</h3>
            <p className="text-xl text-gray-400 mt-4 max-w-sm">
              Supera niveles en el mapa para ganar increíbles cartas Pokémon y llenar tu colección.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {cards.map((url, index) => (
              <div 
                key={`${url}-${index}`}
                onClick={() => setSelectedCard(url)}
                className="relative cursor-pointer transform hover:scale-105 transition-all group perspective-1000"
              >
                <img 
                  src={url} 
                  alt={`Carta ${index + 1}`} 
                  className="w-full rounded-lg shadow-lg group-hover:shadow-2xl transition-shadow border-4 border-white"
                />
                <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/10 transition-colors rounded-lg"></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for viewing card in full size */}
      {selectedCard && (
        <div 
          className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedCard(null)}
        >
          <button className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition">
            <X size={32} />
          </button>
          <img 
            src={selectedCard} 
            alt="Carta Ampliada" 
            className="max-h-[90vh] max-w-full rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.3)] animate-[float_4s_infinite_ease-in-out]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

export default Album;
