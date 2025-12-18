
import React from 'react';
import { PlayerStats } from '../types';
import { X, Award, BarChart } from 'lucide-react';

interface StatsModalProps {
  stats: PlayerStats;
  onClose: () => void;
}

const StatsModal: React.FC<StatsModalProps> = ({ stats, onClose }) => {
  const tables = [2, 3, 4, 5, 6, 7, 8, 9];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border-8 border-purple-400">
        <div className="bg-purple-400 p-6 flex justify-between items-center">
          <h2 className="comic-font text-3xl text-white flex items-center gap-2">
            <BarChart size={32} /> Estadísticas de {stats.name}
          </h2>
          <button onClick={onClose} className="bg-white/20 hover:bg-white/40 text-white rounded-full p-2 transition">
            <X size={24} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 p-6 rounded-2xl text-center">
              <p className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-1">Puntos Totales</p>
              <p className="text-4xl comic-font text-blue-600">{stats.totalPoints} 🌟</p>
            </div>
            <div className="bg-pink-50 p-6 rounded-2xl text-center">
              <p className="text-sm font-bold text-pink-400 uppercase tracking-widest mb-1">Aciertos</p>
              <p className="text-4xl comic-font text-pink-600">{stats.totalCorrect} ✅</p>
            </div>
          </div>

          <div>
            <h3 className="comic-font text-2xl text-gray-700 mb-4">Dominio de Tablas</h3>
            <div className="space-y-4">
              {tables.map(t => {
                const count = stats.mastery[t] || 0;
                const progress = Math.min((count / 30) * 100, 100); // 30 correct to "master"
                
                return (
                  <div key={t} className="flex items-center gap-4">
                    <div className="w-12 h-12 flex items-center justify-center bg-purple-100 rounded-xl text-purple-600 font-bold text-xl">
                      {t}
                    </div>
                    <div className="flex-grow bg-gray-100 h-4 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 transition-all duration-1000"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="w-16 text-right font-bold text-gray-600">
                      {count} {progress >= 100 ? '⭐' : ''}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {stats.totalCorrect > 100 && (
            <div className="bg-yellow-50 p-6 rounded-2xl border-4 border-yellow-200 flex items-center gap-6">
              <div className="text-5xl">🏆</div>
              <div>
                <p className="comic-font text-xl text-yellow-700">¡Maestro de las Matemáticas!</p>
                <p className="text-gray-600">Has respondido correctamente a más de 100 preguntas.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StatsModal;
