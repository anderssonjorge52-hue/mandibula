/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Play, 
  Trophy, 
  Calendar, 
  ArrowRight,
  Info,
  Clock,
  Menu,
  X,
  Activity,
  RotateCw,
  Pause,
  RefreshCw,
  History,
  LogOut,
  LogIn
} from 'lucide-react';
import { PROGRAM_DATA, Day, Exercise } from './data/program';
import { auth, db, signInWithGoogle, logout, handleFirestoreError } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';

// --- Types ---
type View = 'landing' | 'dashboard' | 'day-detail' | 'exercise' | 'day-complete' | 'history';

interface CompletionRecord {
  exerciseId: string;
  completedAt: string; // ISO string
}

interface Progress {
  completedExercises: string[]; // IDs of completed exercises
  completionHistory: CompletionRecord[];
  currentDay: number;
}

// --- Components ---

const ProgressBar = ({ progress }: { progress: number }) => (
  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
    <motion.div 
      className="bg-indigo-500 h-full"
      initial={{ width: 0 }}
      animate={{ width: `${progress}%` }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    />
  </div>
);

const LoginView = ({ onLogin }: { onLogin: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="min-h-screen flex flex-col items-center justify-center p-6 text-center"
  >
    <div className="w-20 h-20 bg-indigo-600 text-white rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-indigo-200">
      <Activity size={40} />
    </div>
    <h1 className="text-3xl font-bold text-slate-900 mb-3">Mandíbula Leve</h1>
    <p className="text-slate-600 mb-10 max-w-xs">
      Sincronize seu progresso e acesse seus exercícios de qualquer lugar.
    </p>
    <button 
      onClick={onLogin}
      className="w-full max-w-xs bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-3"
    >
      <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/pjax/google.png" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
      Entrar com Google
    </button>
    <p className="mt-8 text-xs text-slate-400">
      Ao entrar, você concorda com nossos termos de uso.
    </p>
  </motion.div>
);

// --- Sub-Components ---

interface DashboardProps {
  progress: Progress;
  overallProgress: number;
  currentDayData: Day;
  getDayProgress: (dayId: number) => number;
  isDayComplete: (dayId: number) => boolean;
  startDay: (day: Day) => void;
  setView: (v: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  progress, 
  overallProgress, 
  currentDayData, 
  getDayProgress, 
  isDayComplete, 
  startDay,
  setView
}) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-8 pb-12"
  >
    {/* Header Section */}
    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4">
        <button 
          onClick={() => setView('history')}
          className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-indigo-600 transition-colors"
          title="Ver Histórico"
        >
          <History size={20} />
        </button>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-sm font-semibold text-indigo-600 uppercase tracking-wider mb-1">Bem-vindo de volta</h2>
          <h1 className="text-3xl font-bold text-slate-900">Mandíbula Leve</h1>
        </div>
        <div className="bg-indigo-50 p-3 rounded-2xl">
          <Activity className="text-indigo-600 w-6 h-6" />
        </div>
      </div>
      
      <p className="text-slate-600 mb-8 leading-relaxed">
        Vamos aliviar essa tensão juntos. Seu programa de 7 dias está progredindo muito bem.
      </p>

      <div className="space-y-4">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-slate-500">Progresso Geral</span>
          <span className="text-indigo-600">{overallProgress}%</span>
        </div>
        <ProgressBar progress={overallProgress} />
      </div>

      <button 
        onClick={() => startDay(currentDayData)}
        className="w-full mt-8 bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 active:scale-95 transition-transform"
      >
        <Play fill="currentColor" size={20} />
        Começar Dia {progress.currentDay}
      </button>
    </section>

    {/* Days List */}
    <section className="space-y-4">
      <h3 className="text-lg font-bold text-slate-800 px-2">Seu Plano de 7 Dias</h3>
      <div className="grid gap-4">
        {PROGRAM_DATA.map((day) => {
          const isLocked = day.id > progress.currentDay;
          const isCompleted = isDayComplete(day.id);
          const isActive = day.id === progress.currentDay;

          return (
            <button
              key={day.id}
              disabled={isLocked}
              onClick={() => startDay(day)}
              className={`
                w-full text-left p-5 rounded-2xl border transition-all flex items-center gap-4
                ${isActive ? 'bg-indigo-50 border-indigo-200 shadow-md' : 'bg-white border-slate-100'}
                ${isLocked ? 'opacity-50 grayscale' : 'active:scale-[0.98]'}
              `}
            >
              <div className={`
                w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0
                ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}
              `}>
                {isCompleted ? <CheckCircle2 size={24} /> : <span className="font-bold text-lg">{day.id}</span>}
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className={`font-bold truncate ${isActive ? 'text-indigo-900' : 'text-slate-800'}`}>
                  {day.title}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400" style={{ width: `${getDayProgress(day.id)}%` }} />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                    {getDayProgress(day.id)}%
                  </span>
                </div>
              </div>

              {!isLocked && <ChevronRight className="text-slate-300" size={20} />}
            </button>
          );
        })}
      </div>
    </section>
  </motion.div>
);

interface DayDetailProps {
  selectedDay: Day | null;
  progress: Progress;
  setView: (v: View) => void;
  openExercise: (i: number) => void;
}

const DayDetail: React.FC<DayDetailProps> = ({ 
  selectedDay, 
  progress, 
  setView, 
  openExercise 
}) => (
  <motion.div 
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="space-y-6 pb-12"
  >
    <button 
      onClick={() => setView('dashboard')}
      className="flex items-center gap-2 text-slate-500 font-medium active:translate-x-[-4px] transition-transform"
    >
      <ChevronLeft size={20} />
      Voltar ao Dashboard
    </button>

    <div className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
      <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Dia {selectedDay?.id}</span>
      <h1 className="text-2xl font-bold text-slate-900 mt-1">{selectedDay?.title}</h1>
      <p className="text-slate-600 mt-4 leading-relaxed">
        {selectedDay?.objective}
      </p>
      
      <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-50">
        <div className="flex items-center gap-1 text-slate-400 text-sm">
          <Clock size={16} />
          <span>~5 min</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400 text-sm">
          <Info size={16} />
          <span>5 exercícios</span>
        </div>
      </div>
    </div>

    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Exercícios de Hoje</h3>
      {selectedDay?.exercises.map((ex, idx) => {
        const isDone = progress.completedExercises.includes(ex.id);
        return (
          <button
            key={ex.id}
            onClick={() => openExercise(idx)}
            className={`
              w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all
              ${isDone ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-100 shadow-sm active:scale-[0.98]'}
            `}
          >
            <div className={`
              w-10 h-10 rounded-xl flex items-center justify-center
              ${isDone ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-50 text-indigo-600'}
            `}>
              <ex.icon size={20} />
            </div>
            <div className="flex-1">
              <h4 className={`font-bold text-sm ${isDone ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                {ex.name}
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">{ex.duration}</p>
            </div>
            {isDone ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Circle className="text-slate-200" size={20} />}
          </button>
        );
      })}
    </div>

    <button 
      onClick={() => openExercise(0)}
      className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
    >
      Começar Exercícios
      <ArrowRight size={20} />
    </button>
  </motion.div>
);

interface ExerciseViewProps {
  selectedDay: Day | null;
  selectedExerciseIndex: number;
  progress: Progress;
  setView: (v: View) => void;
  setSelectedExerciseIndex: (i: any) => void;
  toggleExerciseComplete: (id: string) => void;
  nextExercise: () => void;
}

const ExerciseView: React.FC<ExerciseViewProps> = ({
  selectedDay,
  selectedExerciseIndex,
  progress,
  setView,
  setSelectedExerciseIndex,
  toggleExerciseComplete,
  nextExercise
}) => {
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Reset timer when exercise changes
  useEffect(() => {
    setTimeLeft(60);
    setIsTimerRunning(false);
  }, [selectedExerciseIndex, selectedDay]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timeLeft]);

  const exercise = selectedDay?.exercises[selectedExerciseIndex];
  if (!exercise) return null;

  const isDone = progress.completedExercises.includes(exercise.id);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="space-y-6 pb-12"
    >
      <div className="flex items-center justify-between">
        <button 
          onClick={() => setView('day-detail')}
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400"
        >
          <X size={20} />
        </button>
        <div className="text-sm font-bold text-slate-400">
          {selectedExerciseIndex + 1} de {selectedDay?.exercises.length}
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>

      <div className="bg-white rounded-[2rem] overflow-hidden shadow-xl border border-slate-100">
        <div className="bg-indigo-600 p-8 flex flex-col items-center justify-center text-white relative">
          <div className="text-white">
            <exercise.icon size={80} strokeWidth={1.5} />
          </div>

          {/* Timer Overlay */}
          <div className="mt-6 flex flex-col items-center">
            <div className="text-4xl font-black tracking-tighter mb-4">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex gap-3">
              {!isTimerRunning && timeLeft === 60 ? (
                <button 
                  onClick={() => setIsTimerRunning(true)}
                  className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-transform"
                >
                  <Play size={16} fill="currentColor" />
                  Iniciar Exercício
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    {isTimerRunning ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" />}
                  </button>
                  <button 
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimeLeft(60);
                    }}
                    className="bg-white/20 backdrop-blur-md text-white p-3 rounded-full hover:bg-white/30 transition-colors"
                  >
                    <RefreshCw size={20} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{exercise.name}</h1>
            <div className="flex items-center gap-2 mt-2 text-indigo-600 bg-indigo-50 w-fit px-3 py-1 rounded-full text-xs font-bold">
              <Clock size={14} />
              <span>{exercise.duration}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Como fazer</h3>
            <ul className="space-y-4">
              {exercise.instructions.map((step, i) => (
                <li key={i} className="flex gap-4">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-100 text-slate-500 text-xs font-bold flex items-center justify-center">
                    {i + 1}
                  </span>
                  <p className="text-slate-600 text-sm leading-relaxed">{step}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <p className="text-xs text-slate-400 italic">
              <span className="font-bold text-indigo-400 not-italic uppercase mr-1">Objetivo:</span>
              {exercise.objective}
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button 
          layout
          initial={false}
          animate={isDone ? { 
            scale: [1, 1.05, 1],
            rotate: [0, -1, 1, -1, 0],
            backgroundColor: "#10b981" // emerald-500
          } : {
            scale: 1,
            rotate: 0
          }}
          whileTap={{ scale: 0.95 }}
          onClick={() => {
            toggleExerciseComplete(exercise.id);
            // Pequeno delay para o usuário ver a animação de conclusão
            setTimeout(() => {
              nextExercise();
            }, 600);
          }}
          className={`
            flex-1 py-5 rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 transition-colors
            ${isDone ? 'bg-emerald-500 text-white shadow-emerald-100' : 'bg-indigo-600 text-white shadow-indigo-100'}
          `}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={isDone ? 'done' : 'not-done'}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center gap-2"
            >
              {isDone ? 'Concluído!' : 'Concluir Exercício'}
              <CheckCircle2 size={20} />
            </motion.div>
          </AnimatePresence>
        </motion.button>
      </div>
      
      <div className="flex justify-between px-4">
        <button 
          disabled={selectedExerciseIndex === 0}
          onClick={() => setSelectedExerciseIndex((prev: number) => prev - 1)}
          className="text-slate-400 font-bold text-sm disabled:opacity-0 flex items-center gap-1"
        >
          <ChevronLeft size={16} /> Anterior
        </button>
        <button 
          onClick={nextExercise}
          className="text-indigo-600 font-bold text-sm flex items-center gap-1"
        >
          Pular <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  );
};

interface DayCompleteViewProps {
  selectedDay: Day | null;
  finishDay: () => void;
}

const DayCompleteView: React.FC<DayCompleteViewProps> = ({ 
  selectedDay, 
  finishDay 
}) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    className="flex flex-col items-center justify-center min-h-[70vh] text-center space-y-8"
  >
    <div className="relative">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", damping: 12, stiffness: 200 }}
        className="w-32 h-32 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600"
      >
        <Trophy size={64} />
      </motion.div>
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-4 border-dashed border-emerald-200 rounded-full -m-2"
      />
    </div>

    <div className="space-y-2">
      <h1 className="text-3xl font-bold text-slate-900">Ótimo trabalho hoje!</h1>
      <p className="text-slate-500 max-w-xs mx-auto">
        Você concluiu todos os exercícios do Dia {selectedDay?.id}. Sua mandíbula vai agradecer por esse cuidado.
      </p>
    </div>

    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm w-full max-w-xs">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Dica de Ouro</div>
      <p className="text-sm text-slate-600 italic">
        "Lembre-se de manter a língua no céu da boca durante o dia. Isso evita o apertamento inconsciente."
      </p>
    </div>

    <button 
      onClick={finishDay}
      className="w-full max-w-xs bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-transform"
    >
      Continuar amanhã
    </button>
  </motion.div>
);

const HistoryView: React.FC<{ progress: Progress; setView: (v: View) => void }> = ({ progress, setView }) => {
  // Group history by day
  const historyByDay = useMemo(() => {
    const groups: { [key: string]: { day: Day; exercises: { ex: Exercise; completedAt: string }[] } } = {};
    
    progress.completionHistory.forEach(record => {
      // Find which day this exercise belongs to
      let foundDay: Day | undefined;
      let foundEx: Exercise | undefined;
      
      for (const day of PROGRAM_DATA) {
        const ex = day.exercises.find(e => e.id === record.exerciseId);
        if (ex) {
          foundDay = day;
          foundEx = ex;
          break;
        }
      }
      
      if (foundDay && foundEx) {
        if (!groups[foundDay.id]) {
          groups[foundDay.id] = { day: foundDay, exercises: [] };
        }
        groups[foundDay.id].exercises.push({ ex: foundEx, completedAt: record.completedAt });
      }
    });
    
    return Object.values(groups).sort((a, b) => a.day.id - b.day.id);
  }, [progress.completionHistory]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-6 pb-12"
    >
      <button 
        onClick={() => setView('dashboard')}
        className="flex items-center gap-2 text-slate-500 font-medium active:translate-x-[-4px] transition-transform"
      >
        <ChevronLeft size={20} />
        Voltar ao Dashboard
      </button>

      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
          <History size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Histórico</h1>
      </div>

      {historyByDay.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity size={32} />
          </div>
          <p className="text-slate-500 font-medium">Nenhum exercício concluído ainda.</p>
          <button 
            onClick={() => setView('dashboard')}
            className="mt-6 text-indigo-600 font-bold text-sm uppercase tracking-widest"
          >
            Começar Agora
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {historyByDay.map(({ day, exercises }) => (
            <div key={day.id} className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Dia {day.id}: {day.title}</h3>
                <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  {exercises.length} concluídos
                </span>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                {exercises.map(({ ex, completedAt }, idx) => (
                  <div 
                    key={`${ex.id}-${idx}`}
                    className={`p-4 flex items-center gap-4 ${idx !== exercises.length - 1 ? 'border-b border-slate-50' : ''}`}
                  >
                    <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ex.icon size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 truncate">{ex.name}</h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(completedAt).toLocaleDateString('pt-BR')} às {new Date(completedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <CheckCircle2 className="text-emerald-500" size={18} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

interface LandingViewProps {
  onStart: () => void;
  onReset: () => void;
  hasProgress: boolean;
}

const LandingView: React.FC<LandingViewProps> = ({ onStart, onReset, hasProgress }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.8, ease: "easeOut" }}
      className="mb-8 relative"
    >
      <div className="w-32 h-32 bg-indigo-600 rounded-[2.5rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-3">
        <Activity size={64} strokeWidth={1.5} />
      </div>
      <motion.div 
        animate={{ rotate: -12 }}
        className="absolute -top-4 -right-4 w-12 h-12 bg-emerald-400 rounded-2xl flex items-center justify-center text-white shadow-lg"
      >
        <Trophy size={24} />
      </motion.div>
    </motion.div>

    <motion.h1 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4, duration: 0.6 }}
      className="text-6xl font-black text-slate-900 tracking-tighter mb-4 leading-[0.9]"
    >
      Mandíbula<br/>
      <span className="text-indigo-600">Leve.</span>
    </motion.h1>

    <motion.p 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="text-slate-500 max-w-[280px] mx-auto mb-12 text-lg leading-snug font-medium"
    >
      Seu guia diário para o alívio da tensão e bem-estar facial.
    </motion.p>

    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
      className="w-full max-w-xs space-y-4"
    >
      <button 
        onClick={onStart}
        className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-bold shadow-xl shadow-indigo-100 active:scale-95 transition-transform flex items-center justify-center gap-3"
      >
        {hasProgress ? 'Continuar Jornada' : 'Começar Jornada'}
        <ArrowRight size={20} />
      </button>

      {hasProgress && (
        <button 
          onClick={onReset}
          className="text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-rose-500 transition-colors"
        >
          Resetar Progresso
        </button>
      )}
      
      <div className="flex items-center justify-center gap-6 text-slate-400">
        <div className="flex flex-col items-center">
          <span className="text-slate-900 font-bold">7</span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Dias</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex flex-col items-center">
          <span className="text-slate-900 font-bold">35</span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Exercícios</span>
        </div>
        <div className="w-px h-4 bg-slate-200" />
        <div className="flex flex-col items-center">
          <span className="text-slate-900 font-bold">100%</span>
          <span className="text-[10px] uppercase tracking-widest font-bold">Natural</span>
        </div>
      </div>
    </motion.div>

    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1 }}
      className="mt-16 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm flex items-center gap-3 text-left max-w-xs"
    >
      <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 flex-shrink-0">
        <Info size={20} />
      </div>
      <p className="text-[11px] text-slate-500 leading-tight">
        Desenvolvido com foco em relaxamento muscular e alívio de tensões da DTM.
      </p>
    </motion.div>
  </motion.div>
);

// --- Error Boundary ---
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    (this as any).state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    const state = (this as any).state;
    const props = (this as any).props;
    if (state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50">
          <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
            <X size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado.</h1>
          <p className="text-slate-600 mb-8 max-w-xs">
            Ocorreu um erro ao carregar o aplicativo. Tente recarregar a página ou resetar seu progresso.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg"
            >
              Recarregar Página
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('mandibula-progress');
                window.location.reload();
              }}
              className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold"
            >
              Resetar Dados (Limpar Erro)
            </button>
          </div>
          {state.error && (
            <pre className="mt-8 p-4 bg-slate-100 rounded-lg text-[10px] text-slate-400 text-left overflow-auto max-w-full">
              {state.error.toString()}
            </pre>
          )}
        </div>
      );
    }

    return props.children;
  }
}

export default function App() {
  console.log('App rendering...');
  // --- State ---
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<View>('landing');
  const [selectedDay, setSelectedDay] = useState<Day | null>(null);
  const [selectedExerciseIndex, setSelectedExerciseIndex] = useState(0);
  const [progress, setProgress] = useState<Progress>(() => {
    const defaultProgress = { completedExercises: [], completionHistory: [], currentDay: 1 };
    try {
      const saved = localStorage.getItem('mandibula-progress');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Array.isArray(parsed.completedExercises)) {
          return {
            completedExercises: Array.isArray(parsed.completedExercises) ? parsed.completedExercises : [],
            completionHistory: Array.isArray(parsed.completionHistory) ? parsed.completionHistory : [],
            currentDay: typeof parsed.currentDay === 'number' ? parsed.currentDay : 1
          };
        }
      }
    } catch (e) {
      console.error('Error loading progress from localStorage:', e);
    }
    return defaultProgress;
  });
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const syncProgressToFirestore = async (newProgress: Progress) => {
    if (!auth.currentUser) return;
    try {
      const userDoc = doc(db, 'users', auth.currentUser.uid);
      await setDoc(userDoc, {
        ...newProgress,
        uid: auth.currentUser.uid,
        email: auth.currentUser.email,
        updatedAt: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, 'write', `users/${auth.currentUser.uid}`);
    }
  };

  const handleReset = async () => {
    if (confirm('Deseja realmente resetar todo o seu progresso?')) {
      const initialProgress = { completedExercises: [], completionHistory: [], currentDay: 1 };
      setProgress(initialProgress);
      localStorage.setItem('mandibula-progress', JSON.stringify(initialProgress));
      await syncProgressToFirestore(initialProgress);
      setView('landing');
      setIsMenuOpen(false);
      window.scrollTo(0, 0);
    }
  };

  // --- Effects ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const userDoc = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDoc, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as Progress;
        setProgress(prev => {
          // Only update if remote is different to avoid loops
          if (JSON.stringify(prev) !== JSON.stringify({
            completedExercises: data.completedExercises,
            completionHistory: data.completionHistory,
            currentDay: data.currentDay
          })) {
            return {
              completedExercises: data.completedExercises || [],
              completionHistory: data.completionHistory || [],
              currentDay: data.currentDay || 1
            };
          }
          return prev;
        });
      }
    }, (error) => {
      handleFirestoreError(error, 'get', `users/${user.uid}`);
    });

    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    try {
      localStorage.setItem('mandibula-progress', JSON.stringify(progress));
      if (user) {
        syncProgressToFirestore(progress);
      }
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [progress, user]);

  // --- Helpers ---
  const currentDayData = useMemo(() => {
    const day = PROGRAM_DATA.find(d => d.id === progress.currentDay);
    return day || PROGRAM_DATA[0] || { id: 1, title: '', objective: '', exercises: [] };
  }, [progress.currentDay]);

  const overallProgress = useMemo(() => {
    const totalExercises = PROGRAM_DATA.reduce((acc, day) => acc + day.exercises.length, 0);
    return Math.round((progress.completedExercises.length / totalExercises) * 100);
  }, [progress.completedExercises]);

  const getDayProgress = (dayId: number) => {
    const day = PROGRAM_DATA.find(d => d.id === dayId);
    if (!day) return 0;
    const completedInDay = day.exercises.filter(e => progress.completedExercises.includes(e.id)).length;
    return Math.round((completedInDay / day.exercises.length) * 100);
  };

  const isDayComplete = (dayId: number) => getDayProgress(dayId) === 100;

  // --- Actions ---
      const startDay = (day: Day) => {
        setSelectedDay(day);
        setSelectedExerciseIndex(0);
        setView('day-detail');
        window.scrollTo(0, 0);
      };
    
      const openExercise = (index: number) => {
        setSelectedExerciseIndex(index);
        setView('exercise');
        window.scrollTo(0, 0);
      };
    
      const toggleExerciseComplete = (exerciseId: string) => {
        setProgress(prev => {
          const isCompleted = prev.completedExercises.includes(exerciseId);
          const newCompleted = isCompleted 
            ? prev.completedExercises.filter(id => id !== exerciseId)
            : [...prev.completedExercises, exerciseId];
          
          let newHistory = [...(prev.completionHistory || [])];
          if (!isCompleted) {
            newHistory.push({
              exerciseId,
              completedAt: new Date().toISOString()
            });
          } else {
            // Optional: remove from history if unchecked? 
            // Usually history should be immutable records, but for this app simplicity:
            newHistory = newHistory.filter(h => h.exerciseId !== exerciseId);
          }

          return { ...prev, completedExercises: newCompleted, completionHistory: newHistory };
        });
      };
    
      const nextExercise = () => {
        if (!selectedDay) return;
        if (selectedExerciseIndex < selectedDay.exercises.length - 1) {
          setSelectedExerciseIndex(prev => prev + 1);
        } else {
          // Check if all exercises in day are done
          const allDone = selectedDay.exercises.every(e => 
            progress.completedExercises.includes(e.id) || e.id === selectedDay.exercises[selectedExerciseIndex].id
          );
          
          if (allDone) {
            setView('day-complete');
          } else {
            setView('day-detail');
          }
        }
        window.scrollTo(0, 0);
      };
    
      const finishDay = () => {
        if (selectedDay && selectedDay.id === progress.currentDay && progress.currentDay < 7) {
          setProgress(prev => ({ ...prev, currentDay: prev.currentDay + 1 }));
        }
        setView('dashboard');
        setSelectedDay(null);
        window.scrollTo(0, 0);
      };

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        >
          <RefreshCw className="text-indigo-600 w-8 h-8" />
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <LoginView onLogin={signInWithGoogle} />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-indigo-100 relative overflow-x-hidden">
      {/* Background Decorative Gradients */}
      {view === 'landing' && (
        <>
          <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-100/50 rounded-full blur-[120px] -z-10" />
          <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-50/50 rounded-full blur-[120px] -z-10" />
        </>
      )}

      {/* Navigation Bar */}
      {view !== 'landing' && (
        <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Activity size={18} />
              </div>
              <span className="font-bold text-slate-800 tracking-tight">Mandíbula Leve</span>
            </div>
            
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-500 hover:bg-slate-50 rounded-lg transition-colors"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </nav>
      )}

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed right-0 top-0 bottom-0 w-72 bg-white z-[70] shadow-2xl p-8 flex flex-col"
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="font-bold text-xl">Menu</h2>
                <button onClick={() => setIsMenuOpen(false)}><X size={24} /></button>
              </div>
              
              <div className="space-y-6 flex-1">
                <button 
                  onClick={() => { setView('dashboard'); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-4 text-slate-600 font-medium hover:text-indigo-600"
                >
                  <Calendar size={20} /> Dashboard
                </button>
                <button 
                  onClick={() => { setView('history'); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-4 text-slate-600 font-medium hover:text-indigo-600"
                >
                  <History size={20} /> Histórico
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full text-left flex items-center gap-4 text-rose-500 font-medium"
                >
                  <RotateCw size={20} /> Resetar Progresso
                </button>
                <button 
                  onClick={() => {
                    logout();
                    setIsMenuOpen(false);
                  }}
                  className="w-full text-left flex items-center gap-4 text-slate-600 font-medium"
                >
                  <LogOut size={20} /> Sair da Conta
                </button>
              </div>

              <div className="pt-8 border-t border-slate-100">
                <p className="text-xs text-slate-400 leading-relaxed">
                  Este programa não substitui consulta médica. Em caso de dor persistente, procure um especialista em DTM.
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-6 pt-8 pb-12">
        <AnimatePresence mode="wait">
          {view === 'landing' && (
            <LandingView 
              key="landing"
              hasProgress={progress.completedExercises.length > 0 || progress.currentDay > 1}
              onStart={() => setView('dashboard')}
              onReset={handleReset}
            />
          )}
          {view === 'dashboard' && (
            <Dashboard 
              key="dashboard"
              progress={progress}
              overallProgress={overallProgress}
              currentDayData={currentDayData}
              getDayProgress={getDayProgress}
              isDayComplete={isDayComplete}
              startDay={startDay}
              setView={setView}
            />
          )}
          {view === 'day-detail' && (
            <DayDetail 
              key="day-detail"
              selectedDay={selectedDay}
              progress={progress}
              setView={setView}
              openExercise={openExercise}
            />
          )}
          {view === 'exercise' && (
            <ExerciseView 
              key="exercise"
              selectedDay={selectedDay}
              selectedExerciseIndex={selectedExerciseIndex}
              progress={progress}
              setView={setView}
              setSelectedExerciseIndex={setSelectedExerciseIndex}
              toggleExerciseComplete={toggleExerciseComplete}
              nextExercise={nextExercise}
            />
          )}
          {view === 'day-complete' && (
            <DayCompleteView 
              key="day-complete"
              selectedDay={selectedDay}
              finishDay={finishDay}
            />
          )}
          {view === 'history' && (
            <HistoryView 
              key="history"
              progress={progress}
              setView={setView}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer (only on dashboard) */}
      {view === 'dashboard' && (
        <footer className="max-w-md mx-auto px-6 pb-12 text-center space-y-4">
          <div className="h-px bg-slate-200 w-12 mx-auto" />
          <p className="text-xs text-slate-400 leading-relaxed">
            Desenvolvido para seu bem-estar diário.<br />
            Foco em alívio, leveza e consciência corporal.
          </p>
        </footer>
      )}
    </div>
    </ErrorBoundary>
  );
}
