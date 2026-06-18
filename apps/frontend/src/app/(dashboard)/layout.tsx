import type { ReactNode } from 'react';
import { DashboardShell, DashboardContent, DashboardMain } from '@/components/dashboard-shell';
import { Sidebar } from '@/components/sidebar';
import { Navbar } from '@/components/navbar';

export const dynamic = 'force-dynamic';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <Sidebar />
      <DashboardContent>
        <Navbar />
        <DashboardMain>{children}</DashboardMain>
      </DashboardContent>
    </DashboardShell>
  );
}
