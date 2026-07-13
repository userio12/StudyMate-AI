'use client';

import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faArrowRotateLeft, faXmark, faMinus, faBrain, faMugHot, faGear, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useApiClient } from '@/lib/api-client';
import { useSWRConfig } from 'swr';
import { useActiveTask } from '@/lib/ActiveTaskContext';

export function PomodoroWidget() {
  const { activeTask, setActiveTask } = useActiveTask();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<'pomodoro' | 'shortBreak' | 'longBreak'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState({ pomodoro: 25, shortBreak: 5, longBreak: 15 });

  useEffect(() => {
    const saved = localStorage.getItem('pomodoroSettings');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings(parsed);
        if (mode === 'pomodoro') setTimeLeft(parsed.pomodoro * 60);
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    if (activeTask) {
      setIsOpen(true);
      if (isMinimized) setIsMinimized(false);
    }
  }, [activeTask]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const api = useApiClient();
  const { mutate } = useSWRConfig();

  const MODES = {
    pomodoro: { label: 'Focus', time: settings.pomodoro * 60, icon: faBrain },
    shortBreak: { label: 'Short Break', time: settings.shortBreak * 60, icon: faMugHot },
    longBreak: { label: 'Long Break', time: settings.longBreak * 60, icon: faMugHot },
  };

  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      // Play sound here ideally
      if (mode === 'pomodoro') {
        api.post('/study-sessions', {
          durationMinutes: settings.pomodoro,
          type: 'pomodoro',
          taskId: activeTask?.id || undefined,
        }).then(() => {
          mutate('/analytics/stats');
        }).catch(console.error);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, timeLeft, mode, api, mutate]);

  const handleModeChange = (newMode: keyof typeof MODES) => {
    setMode(newMode);
    setTimeLeft(MODES[newMode].time);
    setIsRunning(false);
  };

  const saveSettings = () => {
    localStorage.setItem('pomodoroSettings', JSON.stringify(settings));
    setTimeLeft(MODES[mode].time);
    setShowSettings(false);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progress = ((MODES[mode].time - timeLeft) / MODES[mode].time) * 100;

  const handleCompleteTask = async () => {
    if (!activeTask) return;
    try {
      await api.patch(`/tasks/${activeTask.id}`, { status: 'completed' });
      setActiveTask(null);
      mutate('/tasks');
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg shadow-brand hover:scale-110 transition-transform bg-primary hover:bg-primary-dark text-white"
      >
        <FontAwesomeIcon icon={faBrain} className="w-6 h-6" />
      </Button>
    );
  }

  if (isMinimized) {
    return (
      <div className="fixed bottom-6 right-6 z-50 glass-card p-3 rounded-2xl flex items-center gap-4 animate-message-appear">
        <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
        <Button size="icon" variant="ghost" onClick={() => setIsRunning(!isRunning)} className="h-8 w-8 rounded-full">
          {isRunning ? <FontAwesomeIcon icon={faPause} className="w-4 h-4" /> : <FontAwesomeIcon icon={faPlay} className="w-4 h-4" />}
        </Button>
        <Button size="icon" variant="ghost" onClick={() => setIsMinimized(false)} className="h-8 w-8 rounded-full">
          <FontAwesomeIcon icon={faMinus} className="w-4 h-4 rotate-180" />
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 glass-card w-64 rounded-3xl overflow-hidden shadow-2xl animate-message-appear flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-2 text-primary font-bold">
          <FontAwesomeIcon icon={faBrain} className="w-5 h-5" />
          <span>Smart Timer</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className={cn("h-7 w-7 rounded-full text-muted-fg hover:text-white transition-colors", showSettings && "text-white bg-white/10")} onClick={() => setShowSettings(!showSettings)}>
            <FontAwesomeIcon icon={faGear} className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-muted-fg hover:text-white transition-colors" onClick={() => setIsMinimized(true)}>
            <FontAwesomeIcon icon={faMinus} className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 rounded-full text-muted-fg hover:text-red-400 transition-colors" onClick={() => setIsOpen(false)}>
            <FontAwesomeIcon icon={faXmark} className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col items-center">
        {activeTask && !showSettings && (
          <div className="w-full bg-brand-500/10 border border-brand-500/30 rounded-xl p-3 mb-4 flex flex-col gap-2">
            <span className="text-xs text-brand-500 font-semibold uppercase tracking-wider">Current Task</span>
            <div className="flex justify-between items-center gap-2">
              <span className="text-sm font-medium truncate">{activeTask.title}</span>
              <Button 
                onClick={handleCompleteTask}
                size="sm" 
                variant="ghost" 
                className="h-7 px-2 text-xs bg-success/20 text-success hover:bg-success hover:text-white"
              >
                <FontAwesomeIcon icon={faCheck} className="w-3 h-3 mr-1" /> Done
              </Button>
            </div>
          </div>
        )}

        {showSettings ? (
          <div className="w-full flex flex-col gap-4 mb-2 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-semibold text-sm mb-1">Timer Settings (minutes)</h3>
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-fg">Focus</span>
                <input type="number" min="1" max="120" value={settings.pomodoro} onChange={(e) => setSettings({...settings, pomodoro: parseInt(e.target.value) || 25})} className="w-16 bg-surface-3 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary text-center" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-fg">Short Break</span>
                <input type="number" min="1" max="60" value={settings.shortBreak} onChange={(e) => setSettings({...settings, shortBreak: parseInt(e.target.value) || 5})} className="w-16 bg-surface-3 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary text-center" />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-fg">Long Break</span>
                <input type="number" min="1" max="60" value={settings.longBreak} onChange={(e) => setSettings({...settings, longBreak: parseInt(e.target.value) || 15})} className="w-16 bg-surface-3 rounded-lg px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary text-center" />
              </div>
            </div>
            <Button onClick={saveSettings} className="w-full mt-4 gap-2">
              <FontAwesomeIcon icon={faCheck} className="w-4 h-4" /> Save
            </Button>
          </div>
        ) : (
          <>
            {/* Modes */}
            <div className="flex bg-surface-2 p-1 rounded-full w-full justify-between mb-5 animate-in fade-in duration-200">
              {(Object.keys(MODES) as Array<keyof typeof MODES>).map((m) => (
                <button
                  key={m}
                  onClick={() => handleModeChange(m)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-semibold transition-colors",
                    mode === m ? "bg-primary text-white shadow-sm" : "text-muted-fg hover:text-white"
                  )}
                >
                  {MODES[m].label}
                </button>
              ))}
            </div>

            {/* Timer Display */}
            <div className="relative w-32 h-32 flex items-center justify-center mb-6 animate-in fade-in duration-200">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle cx="64" cy="64" r="60" className="stroke-surface-3" strokeWidth="6" fill="none" />
                <circle
                  cx="64"
                  cy="64"
                  r="60"
                  className={cn("stroke-primary transition-all duration-1000 ease-linear")}
                  strokeWidth="6"
                  fill="none"
                  strokeDasharray={60 * 2 * Math.PI}
                  strokeDashoffset={-(60 * 2 * Math.PI * progress) / 100}
                  strokeLinecap="round"
                />
              </svg>
              <span className="font-mono text-3xl font-bold tracking-tighter">{formatTime(timeLeft)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4 w-full justify-center animate-in fade-in duration-200">
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 rounded-full"
                onClick={() => {
                  setTimeLeft(MODES[mode].time);
                  setIsRunning(false);
                }}
              >
                <FontAwesomeIcon icon={faArrowRotateLeft} className="w-5 h-5" />
              </Button>
              <Button
                size="lg"
                className="h-12 w-12 rounded-full bg-primary hover:bg-primary-dark shadow-brand text-white"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? <FontAwesomeIcon icon={faPause} className="w-5 h-5" /> : <FontAwesomeIcon icon={faPlay} className="w-5 h-5 ml-1" />}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
