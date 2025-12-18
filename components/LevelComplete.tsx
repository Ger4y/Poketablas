
import React from 'react';
import { Star } from 'lucide-react';

interface LevelCompleteProps {
  score: { correct: number, total: number };
  playerName: string;
  onNext: () => void;
  newCardUrl: string | null;
}

const LevelComplete: React.FC<LevelCompleteProps> = ({ score, playerName, onNext, newCardUrl }) => {
  const isWinner = score.correct >= 8;

  return (
    <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl max-w-2xl w-full text-center border-8 border-yellow-400 z-20 flex flex-col items-center">
      <h2 className="comic-font text-4xl md:text-5xl text-pink-600 mb-4">
        {isWinner ? '¡NIVEL SUPERADO!' : '¡Buen intento!'}
      </h2>
      
      <div className="flex justify-center gap-2 mb-6">
        {[1, 2, 3].map((star) => (
          <Star 
            key={star} 
            size={48} 
            fill={isWinner && score.correct >= star * 3 ? '#fbbf24' : 'none'} 
            className={isWinner && score.correct >= star * 3 ? 'text-yellow-400 animate-pulse' : 'text-gray-200'}
          />
        ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-8 mb-8 w-full">
        <div className="flex-1">
          <p className="text-xl text-gray-700 mb-2">
            {playerName}, has conseguido:
          </p>
          <p className="text-5xl md:text-6xl comic-font text-blue-500 mb-4">
            {score.correct} / {score.total}
          </p>
          <p className="text-lg text-gray-500 italic">
            {isWinner 
              ? '¡Excelente! Mira la carta Pokémon que has ganado:' 
              : '¡Casi lo tienes! Inténtalo de nuevo para ganar una carta.'}
          </p>
        </div>

        {isWinner && newCardUrl && (
          <div className="flex-1 flex flex-col items-center">
             <div className="relative group perspective-1000">
                <img 
                  src={newCardUrl} 
                  alt="Carta Pokemon Nueva" 
                  className="w-48 md:w-64 rounded-xl shadow-2xl animate-[float_4s_infinite_ease-in-out] border-4 border-white transform hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute -inset-2 bg-yellow-400/30 rounded-2xl blur-xl -z-10 animate-pulse"></div>
             </div>
             <span className="mt-4 bg-yellow-100 text-yellow-700 px-4 py-1 rounded-full font-bold text-sm animate-bounce">
               ¡NUEVA CARTA! 🌟
             </span>
          </div>
        )}
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-sm bg-pink-500 hover:bg-pink-600 text-white comic-font text-3xl py-4 rounded-2xl shadow-lg transform active:scale-95 transition-all border-b-8 border-pink-700"
      >
        {isWinner ? 'GUARDAR Y VOLVER 🗺️' : 'VOLVER AL MAPA 🗺️'}
      </button>
    </div>
  );
};

export default LevelComplete;
