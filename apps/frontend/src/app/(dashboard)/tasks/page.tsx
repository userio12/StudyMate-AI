'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faCheckCircle, faCalendarDays, faPlay, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { useApiClient } from '@/lib/api-client';
import { CreateTaskDialog } from '@/components/tasks/create-task-dialog';
import { useActiveTask } from '@/lib/ActiveTaskContext';

export default function TasksPage() {
  const api = useApiClient();
  const { setActiveTask } = useActiveTask();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const { data: tasks, error, isLoading, mutate } = useSWR('/tasks', async (url) => {
    return api.get<any[]>(url);
  });

  const { data: stats, mutate: mutateStats } = useSWR('/analytics/stats', async (url) => {
    return api.get<any>(url);
  });

  const taskList = tasks || [];

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic update
    const updatedTasks = taskList.map((t: any) => t.id === taskId ? { ...t, status: newStatus } : t);
    mutate(updatedTasks, false);

    try {
      await api.patch(`/tasks/${taskId}`, { status: newStatus });
      mutate();
      if (newStatus === 'completed') {
        mutateStats(); // Refresh stats when a task is completed
      }
    } catch (err) {
      console.error('Failed to update task status', err);
      mutate(); // Revert on failure
    }
  };

  const handleStartFocus = (task: any) => {
    setActiveTask({ id: task.id, title: task.title });
    updateTaskStatus(task.id, 'in_progress');
  };

  const handleComplete = (task: any) => {
    updateTaskStatus(task.id, 'completed');
    if (task.id === useActiveTask?.name) { // Reset active task if completing the active one
      setActiveTask(null);
    }
  };

  const pendingTasks = taskList.filter((t: any) => t.status === 'pending');
  const activeTasks = taskList.filter((t: any) => t.status === 'in_progress');
  const completedTasks = taskList.filter((t: any) => t.status === 'completed');

  return (
    <div className="w-full h-full p-6 animate-message-appear flex flex-col gap-6 max-w-6xl mx-auto overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-bold gradient-text mb-1">Task Flow</h1>
          <p className="text-sm text-muted-fg">Your personal productivity pipeline.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-fg bg-surface-1 px-3 py-1.5 rounded-full border border-border shadow-sm flex items-center">
            <span className="text-success font-bold mr-2 text-base leading-none">{stats?.tasksCompleted || 0}</span>
            <span className="font-medium text-[13px]">Tasks Completed</span>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white rounded-full px-5 py-2 text-sm shadow-brand transition-transform hover:scale-105"
          >
            <FontAwesomeIcon icon={faPlus} className="w-3.5 h-3.5" />
            <span className="font-semibold">New Task</span>
          </Button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column: Active Focus & Up Next */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Active Focus Zone */}
          <div className="bg-surface-1/40 border border-brand-500/20 p-6 rounded-[1.5rem] relative overflow-hidden group shadow-lg">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-500/10 to-transparent pointer-events-none"></div>
            
            <div className="relative z-10">
              <h2 className="text-xs font-bold text-brand-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse shadow-[0_0_10px_rgba(var(--brand-500-rgb),0.8)]"></span>
                Current Focus
              </h2>
              
              {isLoading ? (
                <div className="text-center p-8 text-brand-500/50 animate-pulse">Loading active flow...</div>
              ) : activeTasks.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {activeTasks.map((t: any) => (
                    <div key={t.id} className="glass-card bg-surface-2/80 border border-brand-500/30 p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-[0_8px_30px_rgba(var(--brand-500-rgb),0.1)] transition-transform hover:-translate-y-1">
                      <div>
                        <h3 className="text-2xl font-bold text-foreground mb-3">{t.title}</h3>
                        <div className="flex flex-wrap items-center gap-3">
                          {t.subject && <span className="text-xs font-semibold text-brand-400 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">{t.subject.name}</span>}
                          {t.dueDate && <span className="text-xs font-medium text-warning flex items-center gap-1.5"><FontAwesomeIcon icon={faCalendarDays} className="w-3.5 h-3.5"/> Due {new Date(t.dueDate).toLocaleDateString()}</span>}
                        </div>
                      </div>
                      <Button 
                        onClick={() => handleComplete(t)}
                        className="w-full sm:w-auto bg-success hover:bg-success-dark text-white rounded-2xl px-8 py-6 text-lg transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] shadow-md"
                      >
                        <FontAwesomeIcon icon={faCheck} className="mr-3" />
                        Complete Task
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-12 border-2 border-dashed border-white/5 rounded-3xl bg-surface-2/30">
                  <p className="text-lg font-medium text-muted-fg mb-2">No active focus session.</p>
                  <p className="text-sm text-muted-fg/60">Push a task from your pipeline to start focusing.</p>
                </div>
              )}
            </div>
          </div>

          {/* Up Next Pipeline */}
          <div className="flex flex-col gap-5">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              Pipeline
              <span className="text-sm font-medium text-muted-fg bg-surface-2 px-2 py-0.5 rounded-full ml-2">{pendingTasks.length} pending</span>
            </h2>
            
            <div className="flex flex-col gap-3">
              {isLoading ? (
                <div className="text-center p-8 text-muted-fg animate-pulse">Loading pipeline...</div>
              ) : pendingTasks.length === 0 ? (
                 <div className="text-center p-10 bg-surface-1 rounded-3xl border border-white/5 text-muted-fg shadow-inner">
                    Your pipeline is empty. Time to relax or plan ahead!
                 </div>
              ) : (
                 pendingTasks.map((t: any) => (
                   <div key={t.id} className="group flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 rounded-2xl bg-surface-1 border border-border hover:border-brand-500/40 hover:bg-surface-2/50 transition-all hover:translate-x-2 shadow-sm">
                     <div className="flex items-center gap-5 w-full">
                       <button 
                         onClick={() => handleStartFocus(t)}
                         className="shrink-0 w-14 h-14 rounded-full bg-surface-3 flex items-center justify-center text-muted-fg group-hover:bg-brand-500 group-hover:text-white transition-all group-hover:shadow-[0_0_20px_rgba(var(--brand-500-rgb),0.4)] group-hover:scale-110"
                         title="Push to Active Focus"
                       >
                         <FontAwesomeIcon icon={faPlay} className="w-5 h-5 ml-1" />
                       </button>
                       <div className="flex-1 min-w-0">
                         <h3 className="font-semibold text-lg text-foreground mb-1.5 truncate pr-4">{t.title}</h3>
                         <div className="flex flex-wrap items-center gap-3 text-xs">
                           {t.subject && <span className="text-muted-fg font-medium bg-surface-3 px-2.5 py-1 rounded-md">{t.subject.name}</span>}
                           {t.dueDate && <span className="flex items-center gap-1.5 text-muted-fg"><FontAwesomeIcon icon={faCalendarDays} className="w-3.5 h-3.5 opacity-70"/> {new Date(t.dueDate).toLocaleDateString()}</span>}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Achievements (Completed) */}
        <div className="lg:w-96 flex flex-col shrink-0">
          <div className="bg-surface-1 rounded-[2rem] p-8 border border-border sticky top-0 shadow-lg">
            <h2 className="text-lg font-bold mb-8 flex items-center gap-3 text-success uppercase tracking-wider text-sm">
              <FontAwesomeIcon icon={faCheckCircle} className="w-5 h-5" />
              Completed Log
            </h2>
            
            <div className="flex flex-col gap-6 relative">
              {/* Vertical Timeline Line */}
              {completedTasks.length > 0 && (
                <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-success/40 to-transparent rounded-full"></div>
              )}
              
              {isLoading ? (
                <div className="text-sm text-muted-fg pl-10 animate-pulse">Loading...</div>
              ) : completedTasks.length === 0 ? (
                <div className="text-sm text-muted-fg pl-2 text-center py-8 opacity-70">No tasks completed yet.<br/>Your achievements will appear here.</div>
              ) : (
                completedTasks.map((t: any) => (
                  <div key={t.id} className="relative pl-12 group">
                    <div className="absolute left-0 top-1 w-8 h-8 rounded-full bg-surface-1 border-2 border-success/30 flex items-center justify-center z-10 group-hover:border-success transition-colors">
                      <div className="w-2.5 h-2.5 rounded-full bg-success/50 group-hover:bg-success transition-colors shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    </div>
                    <div className="bg-surface-2 p-5 rounded-2xl border border-white/5 opacity-70 hover:opacity-100 transition-all group-hover:translate-x-1 group-hover:shadow-md">
                      <h3 className="font-medium text-sm text-foreground mb-2 line-through decoration-muted-fg/40">{t.title}</h3>
                      {t.subject && <span className="text-[10px] font-bold text-muted-fg uppercase tracking-widest">{t.subject.name}</span>}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <CreateTaskDialog 
        open={isCreateDialogOpen} 
        onOpenChange={setIsCreateDialogOpen} 
      />
    </div>
  );
}
