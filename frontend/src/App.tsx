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
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-slate-900 selection:bg-slate-200 w-full">
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

      <main className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 flex-1">
        {/* Full-width Top Metadata Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/70 pb-5">
          <div className="space-y-1">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Support Ticket Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 font-normal">
              Real-time business-hours SLA engine · Nights, weekends, and holidays excluded
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-600 font-medium flex-wrap">
            <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Timezone: <strong>Asia/Kolkata</strong> (09:00–18:00)</span>
            </div>

            {holidaysData?.holidays && holidaysData.holidays.length > 0 && (
              <div className="flex items-center gap-2 bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{holidaysData.holidays.length} Configured Holiday(s)</span>
              </div>
            )}
          </div>
        </div>

        {/* Guest Banner (Minimal) */}
        {!isAuthenticated && (
          <div className="px-4 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs sm:text-sm flex items-center justify-between gap-3 shadow-2xs">
            <span>
              Signed out. Log in as <strong className="text-slate-800 font-semibold">agent@example.com</strong> or{' '}
              <strong className="text-slate-800 font-semibold">reporter@example.com</strong> (<code>password123</code>).
            </span>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className="text-xs sm:text-sm text-slate-900 font-bold underline hover:text-black shrink-0"
            >
              Sign In
            </button>
          </div>
        )}

        {/* Full-width Stat Counters */}
        <DashboardCards
          dashboard={dashboardData?.dashboard ?? null}
          loading={dashboardFetching}
          onFilterChange={handleCardFilter}
          activeStatus={statusFilter}
          activeSLAState={slaStateFilter}
        />

        {/* Full-width Ticket List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
              All Tickets &amp; SLA Milestones
            </h2>
          </div>

          <TicketList
            onSelectTicket={(id) => setSelectedTicketId(id)}
            statusFilter={statusFilter}
            slaStateFilter={slaStateFilter}
            onStatusFilterChange={setStatusFilter}
            onSLAStateFilterChange={setSLAStateFilter}
            refreshTrigger={refreshKey}
          />
        </div>
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

      <footer className="border-t border-slate-200/70 py-5 text-center text-xs text-slate-400 font-normal w-full">
        Burdenoff · Business Hours SLA Engine · GraphQL Yoga &amp; React
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
