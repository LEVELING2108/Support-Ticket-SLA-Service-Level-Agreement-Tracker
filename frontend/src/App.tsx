import React, { useState } from 'react';
import { Provider as UrqlProvider, useQuery } from 'urql';
import { urqlClient } from './lib/urqlClient';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import { Navbar } from './components/Navbar';
import { DashboardCards } from './components/DashboardCards';
import { TicketList } from './components/TicketList';
import { TicketDetailModal } from './components/TicketDetailModal';
import { CreateTicketModal } from './components/CreateTicketModal';
import { AuthModal } from './components/AuthModal';
import { GET_DASHBOARD_QUERY, GET_HOLIDAYS_QUERY } from './graphql/operations';
import { TicketDashboard, TicketStatus, SLAState, Holiday } from './types';
import { Globe, Calendar } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<TicketStatus | undefined>(undefined);
  const [slaStateFilter, setSLAStateFilter] = useState<SLAState | undefined>(undefined);
  const [refreshKey, setRefreshKey] = useState(0);

  const [{ data: dashboardData, fetching: dashboardFetching }, reexecuteDashboard] = useQuery<{
    dashboard: TicketDashboard;
  }>({
    query: GET_DASHBOARD_QUERY,
    requestPolicy: 'cache-and-network',
  });

  const [{ data: holidaysData }] = useQuery<{ holidays: Holiday[] }>({
    query: GET_HOLIDAYS_QUERY,
  });

  const handleRefresh = () => {
    reexecuteDashboard({ requestPolicy: 'network-only' });
    setRefreshKey((k) => k + 1);
  };

  const handleCardFilter = (status?: TicketStatus, slaState?: SLAState) => {
    setStatusFilter(status);
    setSLAStateFilter(slaState);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-slate-900 selection:bg-slate-200">
      <Navbar
        onOpenCreateTicket={() => {
          if (!isAuthenticated) {
            setIsAuthModalOpen(true);
          } else {
            setIsCreateModalOpen(true);
          }
        }}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 w-full space-y-6 flex-1">
        {/* Subtle Minimal Metadata Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-4">
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight">Support Tickets</h1>
            <p className="text-xs text-slate-500">
              SLA clocks count business hours only (Mon–Fri, 09:00–18:00)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>Asia/Kolkata</span>
            </div>

            {holidaysData?.holidays && holidaysData.holidays.length > 0 && (
              <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{holidaysData.holidays.length} Holiday</span>
              </div>
            )}
          </div>
        </div>

        {/* Guest Banner (Minimal) */}
        {!isAuthenticated && (
          <div className="px-3.5 py-2.5 rounded-xl bg-slate-100 border border-slate-200/80 text-slate-600 text-xs flex items-center justify-between gap-3">
            <span>
              Signed out. Login as <strong className="text-slate-800 font-semibold">agent@example.com</strong> or{' '}
              <strong className="text-slate-800 font-semibold">reporter@example.com</strong> (<code>password123</code>).
            </span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs text-slate-900 font-semibold underline hover:text-black shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Dashboard Stat Counters */}
        <DashboardCards
          dashboard={dashboardData?.dashboard ?? null}
          loading={dashboardFetching}
          onFilterChange={handleCardFilter}
          activeStatus={statusFilter}
          activeSLAState={slaStateFilter}
        />

        {/* Ticket List */}
        <TicketList
          onSelectTicket={(id) => setSelectedTicketId(id)}
          statusFilter={statusFilter}
          slaStateFilter={slaStateFilter}
          onStatusFilterChange={setStatusFilter}
          onSLAStateFilterChange={setSLAStateFilter}
          refreshTrigger={refreshKey}
        />
      </main>

      {/* Modals */}
      <CreateTicketModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onTicketCreated={handleRefresh}
      />

      <TicketDetailModal
        ticketId={selectedTicketId}
        onClose={() => setSelectedTicketId(null)}
        onTicketUpdated={handleRefresh}
      />

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />

      <footer className="border-t border-slate-200/60 py-4 text-center text-xs text-slate-400 font-normal">
        Burdenoff · Business Hours SLA Engine · GraphQL Yoga
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <UrqlProvider value={urqlClient}>
      <AuthProvider>
        <DashboardContent />
      </AuthProvider>
    </UrqlProvider>
  );
};
