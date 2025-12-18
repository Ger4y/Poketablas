
import React from 'react';
import { PlayerStats, LevelConfig } from '../types';
import { LEVELS } from '../constants';
import { BarChart3, Play, Book, Lock, Info } from 'lucide-react';

interface WorldMapProps {
  stats: PlayerStats;
  onLevelSelect: (level: LevelConfig) => void;
  onOpenStats: () => void;
  onOpenAlbum: () => void;
}

const WorldMap: React.FC<WorldMapProps> = ({ stats, onLevelSelect, onOpenStats, onOpenAlbum }) => {
  return (
    <div className="w-full max-w-4xl relative z-10">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border-4 border-blue-400">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-10 gap-4">
          <div>
            <h2 className="comic-font text-4xl text-blue-600">¡Hola, {stats.name}! 👋</h2>
            <div className="flex gap-4">
                <p className="text-lg text-gray-600 font-bold">Puntos: {stats.totalPoints} ✨</p>
                <p className="text-lg text-red-500 font-bold">Fallos: {Object.keys(stats.mistakes || {}).length} 🩹</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={onOpenAlbum}
              className="bg-yellow-400 hover:bg-yellow-500 text-pink-700 p-3 rounded-xl shadow-lg transform active:scale-90 transition flex items-center gap-2 border-b-4 border-yellow-600"
              title="Álbum de Cartas"
            >
              <Book size={24} />
              <span className="font-bold">ÁLBUM</span>
            </button>
            <button 
              onClick={onOpenStats}
              className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl shadow-lg transform active:scale-90 transition flex items-center gap-2 border-b-4 border-blue-700"
              title="Estadísticas"
            >
              <BarChart3 size={24} />
              <span className="hidden sm:inline font-bold">MIS PUNTOS</span>
            </button>
          </div>
        </div>

        {/* Mensaje de Explicación de Reglas Simplificado */}
        <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-xl flex items-center gap-3">
          <Info className="text-blue-500 shrink-0" size={20} />
          <div className="text-sm text-blue-800 font-bold">
            <p>🌟 Supera la Isla Refuerzo para desbloquear niveles cansados.</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 relative">
          {LEVELS.map((level) => {
            const isRefuerzo = level.table === 'refuerzo';
            const isTemporarilyLocked = stats.temporarilyLockedLevels.includes(level.id);
            const isUnlocked = level.id <= stats.unlockedLevels || isRefuerzo;
            const isCurrent = level.id === stats.unlockedLevels && !isTemporarilyLocked;

            return (
              <div 
                key={level.id}
                onClick={() => onLevelSelect(level)}
                className={`
                  relative cursor-pointer group
                  flex flex-col items-center p-6 rounded-3xl transition-all transform
                  ${isUnlocked && !isTemporarilyLocked ? `${level.color} shadow-lg hover:scale-105 active:scale-95` : 'bg-gray-200 grayscale opacity-50'}
                  border-b-8 ${isUnlocked && !isTemporarilyLocked ? 'border-black/20' : 'border-gray-400'}
                  ${isRefuerzo ? 'border-dashed border-white/50' : ''}
                `}
              >
                {isCurrent && (
                  <div className="absolute -top-4 -right-4 bg-yellow-400 text-white p-2 rounded-full animate-bounce shadow-md z-20">
                    <Play size={20} fill="currentColor" />
                  </div>
                )}
                
                {isTemporarilyLocked && (
                  <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px] rounded-3xl flex flex-col items-center justify-center p-4 text-center">
                    <div className="bg-red-500 p-2 rounded-full text-white mb-2 shadow-lg animate-pulse">
                      <Lock size={32} />
                    </div>
                    <p className="text-[10px] font-bold text-red-700 bg-white/80 px-2 py-1 rounded shadow-sm">
                      ¡NIVEL CANSADO! 🔋
                    </p>
                  </div>
                )}

                <span className="text-6xl mb-2 group-hover:rotate-12 transition-transform duration-300">
                  {isUnlocked && !isTemporarilyLocked ? level.emoji : '🔒'}
                </span>
                
                <span className="comic-font text-white text-xl text-center leading-tight">
                  {level.title}
                </span>

                {isUnlocked && !isTemporarilyLocked && (
                  <div className="mt-2 bg-white/30 px-3 py-1 rounded-full text-xs font-bold text-white uppercase tracking-wider">
                    {level.table === 'mixed' ? 'MIXTO' : isRefuerzo ? 'PRACTICAR' : `Tabla del ${level.table}`}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {stats.temporarilyLockedLevels.length > 0 && (
          <div className="mt-8 bg-red-100 border-l-8 border-red-500 p-4 rounded-xl animate-pulse">
            <p className="text-red-700 font-bold flex items-center gap-2">
              ⚠️ ¡Supera la 🩹 Isla Refuerzo para desbloquear los niveles cansados!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorldMap;
