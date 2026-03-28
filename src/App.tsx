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
  LogIn,
  BarChart2,
  Flame,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { PROGRAM_DATA, Day, Exercise } from './data/program';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  getDocFromServer
} from './firebase';

// --- Types ---
type View = 'landing' | 'dashboard' | 'day-detail' | 'exercise' | 'day-complete' | 'history' | 'statistics';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

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
          const isLocked = false; // All days unlocked
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
          <span>{selectedDay?.exercises.length} exercícios</span>
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
    console.log('Calculating historyByDay for history length:', progress.completionHistory?.length);
    const groups: { [key: string]: { day: Day; exercises: { ex: Exercise; completedAt: string }[] } } = {};
    
    if (!Array.isArray(progress.completionHistory)) {
      console.warn('completionHistory is not an array:', progress.completionHistory);
      return [];
    }

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

const StatisticsView: React.FC<{ progress: Progress; setView: (v: View) => void }> = ({ progress, setView }) => {
  const stats = useMemo(() => {
    const history = progress.completionHistory || [];
    
    // 1. Overall Progress
    const totalExercises = PROGRAM_DATA.reduce((acc, day) => acc + day.exercises.length, 0);
    const completedCount = progress.completedExercises.length;
    const progressPercent = Math.round((completedCount / totalExercises) * 100);

    // 2. Streak Calculation
    const dates = history.map(h => new Date(h.completedAt).toDateString());
    const uniqueDates = Array.from(new Set(dates)).sort((a: string, b: string) => new Date(b).getTime() - new Date(a).getTime());
    
    let streak = 0;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (uniqueDates.length > 0) {
      const mostRecent = uniqueDates[0];
      if (mostRecent === today || mostRecent === yesterday) {
        streak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
          const current = new Date(uniqueDates[i] as string);
          const next = new Date(uniqueDates[i + 1] as string);
          const diff = (current.getTime() - next.getTime()) / 86400000;
          if (diff <= 1.1) { // Allow for some timezone/rounding slack
            streak++;
          } else {
            break;
          }
        }
      }
    }

    // 3. Exercise Frequency
    const exerciseCounts: { [key: string]: number } = {};
    history.forEach(h => {
      exerciseCounts[h.exerciseId] = (exerciseCounts[h.exerciseId] || 0) + 1;
    });

    const exerciseData = Object.entries(exerciseCounts)
      .map(([id, count]) => {
        let name = 'Unknown';
        for (const day of PROGRAM_DATA) {
          const ex = day.exercises.find(e => e.id === id);
          if (ex) {
            name = ex.name;
            break;
          }
        }
        return { name, count };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // 4. Activity by Day of Week
    const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const weeklyActivity = daysOfWeek.map(day => ({ day, count: 0 }));
    
    history.forEach(h => {
      const date = new Date(h.completedAt);
      const dayIndex = date.getDay();
      weeklyActivity[dayIndex].count++;
    });

    return {
      progressPercent,
      completedCount,
      totalExercises,
      streak,
      exerciseData,
      weeklyActivity
    };
  }, [progress]);

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
          <BarChart2 size={24} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Estatísticas</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mb-3">
            <Flame size={24} />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.streak}</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dias Seguidos</div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-2xl flex items-center justify-center mb-3">
            <TrendingUp size={24} />
          </div>
          <div className="text-2xl font-black text-slate-900">{stats.progressPercent}%</div>
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Concluído</div>
        </div>
      </div>

      {/* Weekly Activity Chart */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Atividade Semanal</h3>
        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats.weeklyActivity}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
              />
              <Tooltip 
                cursor={{ fill: '#f8fafc' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {stats.weeklyActivity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.count > 0 ? '#6366f1' : '#e2e8f0'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Exercises */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6 px-2">Mais Praticados</h3>
        {stats.exerciseData.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm italic">
            Comece a praticar para ver seus dados aqui.
          </div>
        ) : (
          <div className="space-y-4">
            {stats.exerciseData.map((ex, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-700 truncate max-w-[70%]">{ex.name}</span>
                  <span className="text-indigo-600">{ex.count}x</span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(ex.count / stats.exerciseData[0].count) * 100}%` }}
                    className="bg-indigo-400 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Overall Progress Breakdown */}
      <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center">
        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-100">
          <Award size={32} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Jornada de Alívio</h3>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Você completou {stats.completedCount} de {stats.totalExercises} exercícios no total. 
          {stats.progressPercent === 100 ? ' Parabéns! Você atingiu o objetivo máximo!' : ' Continue assim para manter sua mandíbula leve.'}
        </p>
        <div className="relative h-4 w-full bg-slate-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.progressPercent}%` }}
            className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full"
          />
        </div>
      </div>
    </motion.div>
  );
};

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
          <span className="text-slate-900 font-bold">{totalExercises}</span>
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
    console.error('ErrorBoundary caught an error:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary details:', error, errorInfo);
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
          <p className="text-slate-600 mb-8 max-w-xs leading-relaxed">
            Ocorreu um erro ao carregar o aplicativo. Tente recarregar a página ou resetar seu progresso.
          </p>
          <div className="flex flex-col gap-3 w-full max-w-xs">
            <button 
              onClick={() => window.location.reload()}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-100 active:scale-95 transition-transform"
            >
              Recarregar Página
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('mandibula-progress');
                window.location.reload();
              }}
              className="w-full bg-white border border-slate-200 text-slate-600 py-3 rounded-xl font-bold active:scale-95 transition-transform"
            >
              Resetar Dados (Limpar Erro)
            </button>
          </div>
          {state.error && (
            <div className="mt-8 p-4 bg-slate-100 rounded-2xl text-[10px] text-slate-600 text-left overflow-auto max-w-full border border-slate-200 font-mono">
              <p className="font-bold mb-2 text-rose-600 uppercase tracking-wider">Detalhes do erro:</p>
              <pre className="whitespace-pre-wrap break-all">
                {(() => {
                  try {
                    const parsed = JSON.parse(state.error.message);
                    return JSON.stringify(parsed, null, 2);
                  } catch (e) {
                    return state.error.message || state.error.toString();
                  }
                })()}
              </pre>
              {state.error.stack && (
                <pre className="mt-4 text-slate-400 border-t border-slate-200 pt-4">
                  {state.error.stack}
                </pre>
              )}
            </div>
          )}
        </div>
      );
    }

    return props.children;
  }
}

const LoginView: React.FC<{ onLogin: () => void; isLoading: boolean; error: string | null }> = ({ onLogin, isLoading, error }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-slate-50"
  >
    <div className="mb-8 relative">
      <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center text-white shadow-2xl shadow-indigo-200 rotate-3">
        <Activity size={48} strokeWidth={1.5} />
      </div>
    </div>

    <h1 className="text-4xl font-black text-slate-900 tracking-tighter mb-2">
      Mandíbula<span className="text-indigo-600">Leve.</span>
    </h1>
    <p className="text-slate-500 max-w-[280px] mx-auto mb-12 text-lg leading-snug font-medium">
      Entre para salvar seu progresso e continuar sua jornada de alívio.
    </p>

    {error && (
      <div className="mb-6 p-4 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium border border-rose-100 w-full max-w-xs">
        {error}
      </div>
    )}

    <button 
      onClick={onLogin}
      disabled={isLoading}
      className="w-full max-w-xs bg-white border border-slate-200 text-slate-700 py-4 rounded-2xl font-bold shadow-sm active:scale-95 transition-all flex items-center justify-center gap-3 hover:bg-slate-50 disabled:opacity-50"
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.39-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      Entrar com Google
    </button>

    <p className="mt-8 text-[11px] text-slate-400 max-w-[200px]">
      Ao entrar, você concorda em salvar seus dados de progresso de forma segura.
    </p>
  </motion.div>
);

const ConfirmDialog: React.FC<{ 
  isOpen: boolean; 
  title: string; 
  message: string; 
  onConfirm: () => void; 
  onCancel: () => void; 
}> = ({ isOpen, title, message, onConfirm, onCancel }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
          onClick={onCancel}
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-sm bg-white rounded-[2rem] p-8 z-[110] shadow-2xl"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 mb-8 leading-relaxed">{message}</p>
          <div className="flex gap-3">
            <button 
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl font-bold text-slate-400 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={onConfirm}
              className="flex-1 py-4 rounded-2xl font-bold text-white bg-rose-500 shadow-lg shadow-rose-100 active:scale-95 transition-transform"
            >
              Confirmar
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function App() {
  console.log('App rendering...');
  // --- State ---
  // --- Auth State ---
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [authTimeout, setAuthTimeout] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

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
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const totalExercises = useMemo(() => {
    return PROGRAM_DATA.reduce((acc, day) => acc + day.exercises.length, 0);
  }, []);

  // --- Auth Effects ---
  useEffect(() => {
    console.log('Initializing Auth listener...');
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser ? `Logged in as ${currentUser.email}` : 'Logged out');
      setUser(currentUser);
      setIsAuthReady(true);
    });

    const timeout = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('Auth initialization taking longer than expected...');
        setAuthTimeout(true);
      }
    }, 8000); // 8 seconds timeout

    return () => {
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  // Connection Test
  useEffect(() => {
    if (isAuthReady && user) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, 'test', 'connection'));
        } catch (error) {
          if (error instanceof Error && error.message.includes('the client is offline')) {
            console.error("Please check your Firebase configuration.");
          }
        }
      };
      testConnection();
    }
  }, [isAuthReady, user]);

  // --- Firestore Sync Effects ---
  useEffect(() => {
    if (!user) return;

    const progressDocRef = doc(db, 'users', user.uid, 'progress', 'current');
    
    // Initial fetch from server to ensure we have the latest
    const fetchInitialProgress = async () => {
      try {
        const docSnap = await getDocFromServer(progressDocRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProgress({
            completedExercises: data.completedExercises || [],
            completionHistory: data.completionHistory || [],
            currentDay: data.currentDay || 1
          });
        }
      } catch (error) {
        // Only log, don't crash. Might be first time user.
        console.log('No initial progress found on server or error fetching:', error);
      }
    };
    fetchInitialProgress();

    // Real-time listener
    const unsubscribe = onSnapshot(progressDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        // Only update if different to avoid loops
        setProgress(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
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
      handleFirestoreError(error, OperationType.GET, `users/${user.uid}/progress/current`);
    });

    return () => unsubscribe();
  }, [user]);

  // Sync local changes to Firestore
  useEffect(() => {
    if (!user) return;

    const syncToFirestore = async () => {
      try {
        const progressDocRef = doc(db, 'users', user.uid, 'progress', 'current');
        await setDoc(progressDocRef, {
          ...progress,
          updatedAt: new Date()
        }, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${user.uid}/progress/current`);
      }
    };

    const timeoutId = setTimeout(syncToFirestore, 1000); // Debounce sync
    return () => clearTimeout(timeoutId);
  }, [progress, user]);

  const handleLogin = async () => {
    setIsLoginLoading(true);
    setLoginError(null);
    console.log('Starting Google login...');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log('Login successful for user:', result.user.uid, result.user.email);
    } catch (error: any) {
      console.error('Login error details:', error);
      let message = 'Falha ao entrar com Google. Tente novamente.';
      if (error.code === 'auth/popup-blocked') {
        message = 'O popup de login foi bloqueado pelo seu navegador. Por favor, permita popups para este site.';
      } else if (error.code === 'auth/unauthorized-domain') {
        message = 'Este domínio não está autorizado para login. Verifique as configurações do Firebase.';
      } else if (error.message) {
        message = `Erro: ${error.message}`;
      }
      setLoginError(message);
    } finally {
      setIsLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setView('landing');
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
  
  const handleReset = async () => {
    setIsConfirmOpen(true);
  };

  const confirmReset = () => {
    const initialProgress = { completedExercises: [], completionHistory: [], currentDay: 1 };
    setProgress(initialProgress);
    localStorage.setItem('mandibula-progress', JSON.stringify(initialProgress));
    setView('landing');
    setIsMenuOpen(false);
    setIsConfirmOpen(false);
    window.scrollTo(0, 0);
  };

  // --- Effects ---
  useEffect(() => {
    try {
      localStorage.setItem('mandibula-progress', JSON.stringify(progress));
    } catch (e) {
      console.error('Error saving progress:', e);
    }
  }, [progress]);

  // --- Helpers ---
  const currentDayData = useMemo(() => {
    console.log('Calculating currentDayData for day:', progress.currentDay);
    if (!PROGRAM_DATA || PROGRAM_DATA.length === 0) {
      console.error('PROGRAM_DATA is empty or undefined!');
      return { id: 1, title: 'Erro', objective: '', exercises: [] };
    }
    const day = PROGRAM_DATA.find(d => d.id === progress.currentDay);
    if (!day) {
      console.warn(`Day ${progress.currentDay} not found, falling back to day 1`);
      return PROGRAM_DATA[0];
    }
    return day;
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-6" />
        <p className="text-slate-600 font-medium animate-pulse">Iniciando Mandíbula Leve...</p>
        {authTimeout && (
          <div className="mt-8 max-w-xs">
            <p className="text-slate-400 text-xs leading-relaxed">
              A inicialização está demorando mais que o esperado. 
              Isso pode ser devido a uma conexão lenta ou problemas com o Firebase.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 text-indigo-600 text-xs font-bold uppercase tracking-widest hover:underline"
            >
              Recarregar Página
            </button>
          </div>
        )}
      </div>
    );
  }

  if (!user) {
    return (
      <ErrorBoundary>
        <LoginView onLogin={handleLogin} isLoading={isLoginLoading} error={loginError} />
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
                  onClick={() => { setView('statistics'); setIsMenuOpen(false); }}
                  className="w-full text-left flex items-center gap-4 text-slate-600 font-medium hover:text-indigo-600"
                >
                  <BarChart2 size={20} /> Estatísticas
                </button>
                <button 
                  onClick={handleReset}
                  className="w-full text-left flex items-center gap-4 text-rose-500 font-medium"
                >
                  <RotateCw size={20} /> Resetar Progresso
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left flex items-center gap-4 text-slate-400 font-medium hover:text-rose-500 transition-colors"
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
              hasProgress={(progress.completedExercises?.length || 0) > 0 || (progress.currentDay || 1) > 1}
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
          {view === 'statistics' && (
            <StatisticsView 
              key="statistics"
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

      <ConfirmDialog 
        isOpen={isConfirmOpen}
        title="Resetar Progresso"
        message="Deseja realmente resetar todo o seu progresso? Esta ação não pode ser desfeita."
        onConfirm={confirmReset}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
    </ErrorBoundary>
  );
}
