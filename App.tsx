
import React, { useState, useEffect, useCallback } from 'react';
import { PlayerStats, View, LevelConfig } from './types';
import { LEVELS } from './constants';
import WelcomeScreen from './components/WelcomeScreen';
import WorldMap from './components/WorldMap';
import GameSession from './components/GameSession';
import LevelComplete from './components/LevelComplete';
import StatsModal from './components/StatsModal';
import Album from './components/Album';
import { soundManager } from './services/soundService';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'multiaventura_stats';
const POKEMON_API_KEY = '23ca33b3-c26c-4651-8df1-dcf03beecefe';
const FALLBACK_CARD = 'https://images.pokemontcg.io/base1/4_hires.png';

const App: React.FC = () => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [currentView, setCurrentView] = useState<View>('welcome');
  const [activeLevel, setActiveLevel] = useState<LevelConfig | null>(null);
  const [lastScore, setLastScore] = useState<{correct: number, total: number} | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [newCardUrl, setNewCardUrl] = useState<string | null>(null);
  const [cardPool, setCardPool] = useState<string[]>([]);
  const [isProcessingEnd, setIsProcessingEnd] = useState(false);

  const refillCardPool = useCallback(async () => {
    if (!stats) return;
    let attempts = 0;
    let foundUnique = false;
    while (attempts < 5 && !foundUnique) {
      try {
        const page = Math.floor(Math.random() * 800) + 1;
        const response = await fetch(`https://api.pokemontcg.io/v2/cards?page=${page}&pageSize=1&q=supertype:Pokémon`, {
          headers: { 'X-Api-Key': POKEMON_API_KEY }
        });
        const data = await response.json();
        if (data.data && data.data[0]?.images?.large) {
          const url = data.data[0].images.large;
          const isDuplicate = stats.collectedCards.includes(url) || cardPool.includes(url);
          if (!isDuplicate) {
            const img = new Image();
            img.src = url;
            setCardPool(prev => [...prev, url]);
            foundUnique = true;
          }
        }
      } catch (e) {
        break;
      }
      attempts++;
    }
  }, [stats, cardPool]);

  useEffect(() => {
    if (stats && cardPool.length < 3) {
      refillCardPool();
    }
  }, [cardPool.length, stats, refillCardPool]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (!parsed.collectedCards) parsed.collectedCards = [];
      if (!parsed.mistakes) parsed.mistakes = {};
      if (!parsed.consecutivePlays) parsed.consecutivePlays = {};
      if (!parsed.temporarilyLockedLevels) parsed.temporarilyLockedLevels = [];
      setStats(parsed);
      setCurrentView('map');
    }
  }, []);

  const saveStats = (newStats: PlayerStats) => {
    setStats(newStats);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
  };

  const handleStart = (name: string) => {
    const initialStats: PlayerStats = {
      name,
      totalPoints: 0,
      unlockedLevels: 1,
      mastery: {},
      totalQuestions: 0,
      totalCorrect: 0,
      collectedCards: [],
      mistakes: {},
      consecutivePlays: {},
      temporarilyLockedLevels: []
    };
    saveStats(initialStats);
    setCurrentView('map');
    soundManager.playClick();
  };

  const handleLevelSelect = (level: LevelConfig) => {
    if (!stats) return;
    
    const isTemporarilyLocked = stats.temporarilyLockedLevels.includes(level.id);
    const isUnlocked = level.id <= stats.unlockedLevels || level.table === 'refuerzo';

    if (isTemporarilyLocked) {
      soundManager.playError();
      return;
    }

    if (isUnlocked) {
      setActiveLevel(level);
      setCurrentView('game');
      setIsProcessingEnd(false);
      setNewCardUrl(null);
      soundManager.playClick();
    }
  };

  const handleGameEnd = (correct: number, total: number, tableMastery: Record<number, number>, sessionMistakes: string[]) => {
    if (!stats || !activeLevel || isProcessingEnd) return;
    setIsProcessingEnd(true);
    const isLevelClear = correct >= 8; 
    
    let finalCard = null;
    if (isLevelClear) {
      if (cardPool.length > 0) {
        finalCard = cardPool[0];
        setCardPool(prev => prev.slice(1));
      } else {
        finalCard = stats.collectedCards.includes(FALLBACK_CARD) ? null : FALLBACK_CARD;
      }
    }

    const updatedMastery = { ...stats.mastery };
    Object.entries(tableMastery).forEach(([table, count]) => {
      const t = parseInt(table);
      updatedMastery[t] = (updatedMastery[t] || 0) + count;
    });

    const updatedMistakes = { ...stats.mistakes };
    sessionMistakes.forEach(qKey => {
      updatedMistakes[qKey] = (updatedMistakes[qKey] || 0) + 1;
    });

    // --- LÓGICA DE BLOQUEO POR REPETICIÓN ---
    let newConsecutivePlays = { ...stats.consecutivePlays };
    let newTemporarilyLockedLevels = [...stats.temporarilyLockedLevels];

    if (activeLevel.table === 'refuerzo') {
      // SOLO SE DESBLOQUEAN SI SE SUPERA EL NIVEL (8/10)
      if (isLevelClear) {
        newConsecutivePlays = {};
        newTemporarilyLockedLevels = [];
      }
    } else {
      // Incrementar contador para este nivel si se ha jugado (gane o pierda)
      const currentPlays = (newConsecutivePlays[activeLevel.id] || 0) + 1;
      newConsecutivePlays[activeLevel.id] = currentPlays;
      
      if (currentPlays >= 2) {
        if (!newTemporarilyLockedLevels.includes(activeLevel.id)) {
          newTemporarilyLockedLevels.push(activeLevel.id);
        }
      }
    }

    const newStats: PlayerStats = {
      ...stats,
      totalPoints: stats.totalPoints + (correct * 10),
      totalQuestions: stats.totalQuestions + total,
      totalCorrect: stats.totalCorrect + correct,
      unlockedLevels: (isLevelClear && activeLevel.id === stats.unlockedLevels && activeLevel.table !== 'refuerzo') 
        ? Math.min(stats.unlockedLevels + 1, LEVELS.length - 1) 
        : stats.unlockedLevels,
      mastery: updatedMastery,
      mistakes: updatedMistakes,
      collectedCards: finalCard ? [...stats.collectedCards, finalCard] : stats.collectedCards,
      consecutivePlays: newConsecutivePlays,
      temporarilyLockedLevels: newTemporarilyLockedLevels
    };

    saveStats(newStats);
    setLastScore({ correct, total });
    setNewCardUrl(finalCard);
    setCurrentView('levelComplete');
    
    if (isLevelClear) {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      soundManager.playLevelUp();
    } else {
      soundManager.playSuccess();
    }
    setTimeout(() => setIsProcessingEnd(false), 300);
  };

  const handleNextAfterScore = () => {
    setCurrentView('map');
    setNewCardUrl(null);
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col bg-[#fdf2f8]">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
        <div className="absolute top-10 left-10 text-6xl floating">✨</div>
        <div className="absolute bottom-20 right-10 text-6xl floating" style={{animationDelay: '1s'}}>🎈</div>
        <div className="absolute top-1/2 left-1/4 text-4xl floating" style={{animationDelay: '0.5s'}}>⭐</div>
        <div className="absolute bottom-1/4 left-1/2 text-5xl floating" style={{animationDelay: '1.5s'}}>🌟</div>
      </div>

      <main className="flex-grow flex items-center justify-center p-4">
        {currentView === 'welcome' && <WelcomeScreen onStart={handleStart} />}
        {currentView === 'map' && stats && (
          <WorldMap stats={stats} onLevelSelect={handleLevelSelect} onOpenStats={() => setShowStats(true)} onOpenAlbum={() => setCurrentView('album')} />
        )}
        {currentView === 'game' && activeLevel && stats && (
          <GameSession level={activeLevel} playerName={stats.name} globalMistakes={stats.mistakes} onEnd={handleGameEnd} />
        )}
        {currentView === 'levelComplete' && lastScore && stats && (
          <LevelComplete score={lastScore} playerName={stats.name} onNext={handleNextAfterScore} newCardUrl={newCardUrl} />
        )}
        {currentView === 'album' && stats && (
          <Album cards={stats.collectedCards} onBack={() => setCurrentView('map')} />
        )}
      </main>

      {showStats && stats && <StatsModal stats={stats} onClose={() => setShowStats(false)} />}
      <footer className="w-full text-center py-4 bg-white/30 backdrop-blur-sm text-pink-600 font-bold border-t border-pink-100 z-10">
        <p>App creada por Geray 🎨 ✨</p>
      </footer>
    </div>
  );
};

export default App;
