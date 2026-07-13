'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFire, faBullseye } from '@fortawesome/free-solid-svg-icons';

interface HeatmapData {
  date: string; // YYYY-MM-DD
  duration: number; // minutes
}

// Fast timezone-safe date-to-YYYY-MM-DD string
const toDateString = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MIN_ACTIVE_MINUTES = 15;

export function StudyHeatmap({ data }: { data: HeatmapData[] }) {
  const { 
    calendarCells, 
    currentStreak, 
    activeDaysThisMonth, 
    daysInMonth,
    currentMonthName
  } = useMemo(() => {
    const today = new Date();
    // Use local time
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInThisMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

    const monthName = today.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

    // Calculate Streaks
    // We want to count consecutive days leading up to today where duration > 0.
    // Ensure data is sorted descending.
    const sortedData = [...data].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    let currentStreakCount = 0;
    let checkDate = new Date();
    let foundBreak = false;

    while (!foundBreak) {
      const dStr = toDateString(checkDate);
      const rec = sortedData.find(d => d.date === dStr);
      
      if (rec && rec.duration >= MIN_ACTIVE_MINUTES) {
        currentStreakCount++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        // If it's today and duration < 15, we can still check yesterday
        // because the user might just haven't studied enough yet today!
        if (dStr === toDateString(today)) {
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          foundBreak = true;
        }
      }
    }

    // Calculate Active Days This Month
    let activeDaysCount = 0;
    for (let i = 1; i <= daysInThisMonth; i++) {
      const dStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const rec = sortedData.find(d => d.date === dStr);
      if (rec && rec.duration >= MIN_ACTIVE_MINUTES) {
        activeDaysCount++;
      }
    }

    const cells: Array<{ date: string; day: number; isFuture: boolean } | null> = [];
    
    // Add empty slots for the days before the 1st of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(null);
    }

    const todayStr = toDateString(today);

    // Add actual days of the month
    for (let i = 1; i <= daysInThisMonth; i++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const isFuture = dateStr > todayStr;
      cells.push({ date: dateStr, day: i, isFuture });
    }

    return { 
      calendarCells: cells, 
      currentStreak: currentStreakCount, 
      activeDaysThisMonth: activeDaysCount, 
      daysInMonth: daysInThisMonth,
      currentMonthName: monthName
    };
  }, [data]);

  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const todayStr = toDateString(new Date());

  return (
    <div className="w-full flex flex-col p-1 sm:p-4 space-y-8">
      {/* Streaks Header */}
      <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4">
        <div className="flex-1 flex items-center gap-4 bg-surface-1/50 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faFire} className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-muted-fg font-bold uppercase tracking-wider mb-1">Current Streak</p>
            <p className="text-2xl font-black text-foreground tracking-tight">{currentStreak} <span className="text-base font-medium text-muted">Days</span></p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-4 bg-surface-1/50 border border-white/5 rounded-2xl p-5 shadow-lg">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
            <FontAwesomeIcon icon={faBullseye} className="text-2xl" />
          </div>
          <div>
            <p className="text-xs text-muted-fg font-bold uppercase tracking-wider mb-1">Monthly Consistency</p>
            <p className="text-2xl font-black text-foreground tracking-tight">{activeDaysThisMonth} <span className="text-base font-medium text-muted">/ {daysInMonth} Days</span></p>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="flex flex-col bg-surface-1/20 p-6 rounded-3xl border border-white/5">
        <div className="flex justify-between items-center mb-6 px-2">
          <h4 className="font-extrabold text-xl text-foreground tracking-tight">{currentMonthName}</h4>
        </div>
        
        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekDays.map(wd => (
            <div key={wd} className="text-center text-xs font-black text-muted-fg uppercase tracking-widest mb-2">
              {wd}
            </div>
          ))}

          {calendarCells.map((cell, idx) => {
            if (!cell) {
              return <div key={`empty-${idx}`} className="w-full aspect-square" />;
            }

            const record = data.find((d) => d.date === cell.date);
            const duration = record?.duration || 0;
            const isToday = cell.date === todayStr;

            let colorClass = 'bg-surface-1/30 border border-white/5 text-muted-fg hover:bg-surface-2';
            
            if (!cell.isFuture) {
              if (duration >= MIN_ACTIVE_MINUTES) {
                colorClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400 font-black shadow-[0_0_15px_rgba(16,185,129,0.15)] hover:bg-emerald-500/30';
              } else {
                colorClass = 'bg-red-500/10 border-red-500/20 text-red-400/80 font-bold hover:bg-red-500/20';
              }
            }

            return (
              <div
                key={cell.date}
                className={cn(
                  'w-full aspect-square rounded-xl sm:rounded-2xl transition-all duration-300 flex items-center justify-center relative group text-sm sm:text-base border cursor-default',
                  colorClass,
                  isToday && 'ring-2 ring-brand-500 ring-offset-2 ring-offset-surface-0'
                )}
              >
                <span>{cell.day}</span>

                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-10 w-max pointer-events-none">
                  <div className="bg-surface-0 border border-white/10 px-3 py-2 rounded-xl text-xs shadow-xl text-center whitespace-nowrap">
                    <span className="font-bold text-foreground block text-[13px] mb-0.5">
                      {duration >= MIN_ACTIVE_MINUTES ? `${duration} mins studied` : cell.isFuture ? 'Upcoming' : duration > 0 ? `${duration} mins (Goal: ${MIN_ACTIVE_MINUTES}m)` : 'No activity'}
                    </span>
                    <span className="text-muted-fg text-[10px] font-medium uppercase tracking-wider">
                      {new Date(cell.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="w-2 h-2 bg-surface-0 border-r border-b border-white/10 rotate-45 -mt-1 z-0" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
