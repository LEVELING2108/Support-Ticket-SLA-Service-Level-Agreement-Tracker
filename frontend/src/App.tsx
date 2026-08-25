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
import { LandingPage } from './components/LandingPage';
import { GET_DASHBOARD_QUERY, GET_HOLIDAYS_QUERY } from './graphql/operations';
import { TicketDashboard, TicketStatus, SLAState, Holiday } from './types';
import { Globe, Calendar } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'LANDING' | 'DASHBOARD'>('LANDING');
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
    pause: currentView !== 'DASHBOARD' || !isAuthenticated,
  });

  const [{ data: holidaysData }] = useQuery<{ holidays: Holiday[] }>({
    query: GET_HOLIDAYS_QUERY,
    pause: currentView !== 'DASHBOARD',
  });

  const handleRefresh = () => {
    reexecuteDashboard({ requestPolicy: 'network-only' });
    setRefreshKey((k) => k + 1);
  };

  const handleCardFilter = (status?: TicketStatus, slaState?: SLAState) => {
    setStatusFilter(status);
    setSLAStateFilter(slaState);
  };

  const holidayCount = holidaysData?.holidays?.length || 1;

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans text-stone-900 selection:bg-stone-200 w-full antialiased">
      {currentView === 'LANDING' ? (
        <LandingPage
          onEnterDashboard={() => setCurrentView('DASHBOARD')}
          onOpenAuth={() => setIsAuthModalOpen(true)}
        />
      ) : (
        <>
          <Navbar
            onNavigateHome={() => setCurrentView('LANDING')}
            onOpenCreateTicket={() => {
              if (!isAuthenticated) {
                setIsAuthModalOpen(true);
              } else {
                setIsCreateModalOpen(true);
              }
            }}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />

          <main className="w-full px-4 sm:px-6 lg:px-8 py-5 space-y-4 flex-1">
            {/* Top Subheader matching mockup */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
              <div className="flex items-center gap-2 text-xs text-stone-600 font-mono">
                <span className="flex items-center gap-1.5 font-bold text-stone-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Engine Active
                </span>
                <span className="text-stone-300 font-sans">|</span>
                <span className="text-stone-500 font-sans">
                  Calendar: Standard Support hours only
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 shadow-2xs">
                  <Globe className="w-3.5 h-3.5 text-stone-400" />
                  <span>Asia/Kolkata</span>
                </div>

                <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-lg border border-stone-200 text-stone-700 shadow-2xs">
                  <Calendar className="w-3.5 h-3.5 text-stone-400" />
                  <span>{holidayCount} {holidayCount === 1 ? 'Holiday' : 'Holidays'} Loaded</span>
                </div>
              </div>
            </div>

            {/* 4 Metric Cards */}
            <DashboardCards
              dashboard={dashboardData?.dashboard ?? null}
              loading={dashboardFetching}
              onFilterChange={handleCardFilter}
              activeStatus={statusFilter}
              activeSLAState={slaStateFilter}
            />

            {/* Full-width Ticket Table & Filter Bar */}
            <TicketList
              onSelectTicket={(id) => setSelectedTicketId(id)}
              statusFilter={statusFilter}
              slaStateFilter={slaStateFilter}
              onStatusFilterChange={setStatusFilter}
              onSLAStateFilterChange={setSLAStateFilter}
              refreshTrigger={refreshKey}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </main>
        </>
      )}

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
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <UrqlProvider value={urqlClient}>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </UrqlProvider>
  );
};
