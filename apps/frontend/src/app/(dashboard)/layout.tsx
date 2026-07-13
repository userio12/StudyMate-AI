import type { ReactNode } from 'react';
import { DashboardShell, DashboardContent, DashboardMain } from '@/components/dashboard-shell';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';
import { PomodoroWidget } from '@/components/pomodoro-widget';
import { ActiveTaskProvider } from '@/lib/ActiveTaskContext';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <ActiveTaskProvider>
      <DashboardShell>
        <Sidebar />
        <DashboardContent>
          <Navbar />
          <DashboardMain>{children}</DashboardMain>
        </DashboardContent>
        <PomodoroWidget />
      </DashboardShell>
    </ActiveTaskProvider>
  );
}
