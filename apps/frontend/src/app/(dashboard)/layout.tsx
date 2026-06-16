import type { ReactNode } from 'react';
import { DashboardShell } from '@/components/dashboard-shell';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <Sidebar />
      <DashboardShell.Content>
        <Navbar />
        <DashboardShell.Main>{children}</DashboardShell.Main>
      </DashboardShell.Content>
    </DashboardShell>
  );
}
