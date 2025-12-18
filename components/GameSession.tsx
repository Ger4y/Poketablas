
import React, { useState, useEffect } from 'react';
import { LevelConfig, Question } from '../types';
import { MOTIVATIONAL_PHRASES } from '../constants';
import { soundManager } from '../services/soundService';
import { Trash2, Rocket } from 'lucide-react';

interface GameSessionProps {
  level: LevelConfig;
  playerName: string;
  globalMistakes: Record<string, number>;
  onEnd: (correct: number, total: number, mastery: Record<number, number>, sessionMistakes: string[]) => void;
}

const GameSession: React.FC<GameSessionProps> = ({ level, playerName, globalMistakes, onEnd }) => {
  const [currentQ, setCurrentQ] = useState<Question | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [mastery, setMastery] = useState<Record<number, number>>({});
  const [feedback, setFeedback] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [tapProgress, setTapProgress] = useState(0);
  const [isEnding, setIsEnding] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [failedPool, setFailedPool] = useState<Question[]>([]);
  const [sessionMistakeKeys, setSessionMistakeKeys] = useState<string[]>([]);

  const getNextQuestion = () => {
    // Si estamos en Refuerzo, intentamos sacar preguntas de los errores globales
    if (level.table === 'refuerzo') {
      const mistakeKeys = Object.entries(globalMistakes)
        // Fix: Explicitly cast values to number to satisfy TypeScript's arithmetic operation requirements
        .sort((a, b) => (b[1] as number) - (a[1] as number)) // Ordenar por más falladas
        .map(entry => entry[0])
        .filter(key => !history.includes(key));

      if (mistakeKeys.length > 0) {
        const key = mistakeKeys[0];
        const [n1, n2] = key.split('x').map(Number);
        return createQuestion(n1, n2);
      }
    }

    // Lógica normal
    if (failedPool.length > 0 && Math.random() < 0.3) {
      const idx = Math.floor(Math.random() * failedPool.length);
      const q = failedPool[idx];
      setFailedPool(prev => prev.filter((_, i) => i !== idx));
      return q;
    }

    let num1, num2, qId;
    let attempts = 0;
    do {
      if (level.table === 'mixed' || level.table === 'refuerzo') {
        num1 = Math.floor(Math.random() * 8) + 2;
      } else {
        num1 = level.table;
      }
      num2 = Math.floor(Math.random() * 8) + 2;
      qId = `${num1}x${num2}`;
      attempts++;
    } while (history.includes(qId) && attempts < 15);

    return createQuestion(num1, num2);
  };

  const createQuestion = (num1: number, num2: number): Question => {
    const answer = num1 * num2;
    const qId = `${num1}x${num2}`;
    setHistory(prev => [qId, ...prev].slice(0, 8));

    const optionsSet = new Set<number>([answer]);
    while (optionsSet.size < 4) {
      const w1 = Math.floor(Math.random() * 8) + 2;
      const w2 = Math.floor(Math.random() * 8) + 2;
      const wrong = w1 * w2;
      if (wrong !== answer) optionsSet.add(wrong);
    }

    return {
      id: Math.random().toString(36),
      num1,
      num2,
      answer,
      options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    };
  };

  useEffect(() => {
    setCurrentQ(getNextQuestion());
  }, []);

  const handleAnswer = (answer: number) => {
    if (feedback || showErrorModal || !currentQ || isEnding) return;
    const isCorrect = answer === currentQ.answer;

    if (isCorrect) {
      soundManager.playSuccess();
      setCorrectCount(prev => prev + 1);
      const newMastery = {
        ...mastery,
        [currentQ.num1]: (mastery[currentQ.num1] || 0) + 1
      };
      setMastery(newMastery);
      
      const randomPhrase = MOTIVATIONAL_PHRASES[Math.floor(Math.random() * MOTIVATIONAL_PHRASES.length)];
      setFeedback(randomPhrase.replace('{name}', playerName));

      setTimeout(() => {
        if (currentIndex < 9) {
          setFeedback(null);
          setCurrentIndex(prev => prev + 1);
          setCurrentQ(getNextQuestion());
        } else {
          if (!isEnding) {
            setIsEnding(true);
            onEnd(correctCount + 1, 10, newMastery, sessionMistakeKeys);
          }
        }
      }, 600); 
    } else {
      soundManager.playError();
      const qKey = `${currentQ.num1}x${currentQ.num2}`;
      setSessionMistakeKeys(prev => [...prev, qKey]);
      setFailedPool(prev => [...prev, { ...currentQ }]);
      setShowErrorModal(true);
      setTapProgress(0);
    }
  };

  const handleTapError = () => {
    if (isEnding) return;
    const next = tapProgress + 10;
    if (next >= 100) {
      setTapProgress(100);
      soundManager.playLevelUp();
      setTimeout(() => {
        if (currentIndex < 9) {
          setShowErrorModal(false);
          setTapProgress(0);
          setCurrentIndex(prev => prev + 1);
          setCurrentQ(getNextQuestion());
        } else {
          if (!isEnding) {
            setIsEnding(true);
            onEnd(correctCount, 10, mastery, sessionMistakeKeys);
          }
        }
      }, 200);
    } else {
      setTapProgress(next);
      soundManager.playClick();
    }
  };

  if (!currentQ) return null;

  return (
    <div className="w-full max-w-2xl bg-white p-8 rounded-3xl shadow-2xl border-8 border-cyan-400 text-center relative overflow-hidden min-h-[500px] flex flex-col justify-between">
      <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 bg-yellow-400 px-6 py-2 rounded-b-3xl border-x-4 border-b-4 border-yellow-600 font-bold text-xl text-yellow-800 z-10">
        {level.table === 'refuerzo' ? 'ISLA REFUERZO 🩹' : `PREGUNTA ${currentIndex + 1} DE 10`}
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-4 px-4">
            <span className="bg-pink-100 text-pink-600 px-4 py-1 rounded-full text-sm font-bold animate-pulse">
                🎯 ACIERTOS: {correctCount}
            </span>
            <div className="flex-grow mx-4 bg-gray-200 h-4 rounded-full overflow-hidden">
                <div 
                    className="h-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / 10) * 100}%` }}
                />
            </div>
        </div>
      </div>

      <div className="flex-grow flex flex-col items-center justify-center py-10">
        <div className="flex items-center justify-center gap-6 mb-8 transform scale-125 md:scale-150">
          <div className="text-6xl comic-font text-blue-600 drop-shadow-md animate-bounce">
            {currentQ.num1} <span className="text-pink-400">×</span> {currentQ.num2}
          </div>
          <div className="text-6xl comic-font text-gray-300 font-bold">=</div>
          <div className="text-6xl comic-font text-yellow-500 font-bold animate-pulse">?</div>
        </div>
        {feedback && (
          <div className="text-3xl comic-font py-4 text-green-500 animate-bounce">
            {feedback}
          </div>
        )}
      </div>

      {!feedback && !showErrorModal && (
        <div className="grid grid-cols-2 gap-6 relative">
          {currentQ.options.map((opt, i) => (
            <button
              key={`${currentQ.id}-${i}`}
              onClick={() => handleAnswer(opt)}
              className={`
                relative bg-white hover:bg-yellow-50 text-blue-600 border-4 border-blue-400 py-6 rounded-2xl text-5xl comic-font shadow-lg 
                transition-all transform active:scale-90
                ${i % 2 === 0 ? 'animate-[float_3s_infinite_ease-in-out]' : 'animate-[float_4s_infinite_ease-in-out]'}
              `}
              style={{ animationDelay: `${i * 0.5}s` }}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {showErrorModal && (
        <div className="fixed inset-0 bg-red-600/95 z-50 flex items-center justify-center flex-col p-4 backdrop-blur-lg select-none">
          <div className="text-center mb-10 overflow-hidden w-full flex flex-col items-center justify-center flex-grow">
            <div className="text-4xl md:text-6xl text-white/80 comic-font mb-4 transition-transform duration-200" style={{ transform: `scale(${1 + tapProgress / 200})` }}>
              {currentQ.num1} × {currentQ.num2} =
            </div>
            <div className="comic-font text-white drop-shadow-[0_10px_40px_rgba(0,0,0,0.8)] transition-all duration-100" style={{ fontSize: `${14 + (tapProgress / 10) * 5}rem`, lineHeight: '1', transform: `scale(${1 + tapProgress / 80}) rotate(${(tapProgress % 15) - 7}deg)` }}>
              {currentQ.answer}
            </div>
          </div>
          <div className="pb-10 w-full flex flex-col items-center">
             <button onClick={handleTapError} disabled={isEnding} className="group relative bg-white hover:bg-yellow-50 p-8 rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)] transform active:scale-95 transition-all flex flex-col items-center border-b-8 border-gray-300 overflow-hidden">
              <Rocket className={`text-pink-500 w-24 h-24 ${tapProgress > 0 ? 'animate-bounce' : ''}`} />
              <div className="absolute bottom-0 left-0 w-full bg-pink-400/40 transition-all duration-300 pointer-events-none" style={{ height: `${tapProgress}%` }}></div>
              <div className="absolute inset-0 border-8 border-pink-400/20 rounded-full"></div>
            </button>
            <p className="text-white comic-font text-2xl mt-4 animate-pulse">¡PULSA EL COHETE RÁPIDO! 🚀</p>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-4 opacity-5">
        <Trash2 size={48} />
        <Trash2 size={48} />
      </div>
    </div>
  );
};

export default GameSession;
