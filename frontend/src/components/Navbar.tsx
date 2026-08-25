import React from 'react';
import { useAuth } from '../context/useAuth';
import {
  BrandIcon,
  AgentRoleIcon,
  ReporterRoleIcon,
  RaiseTicketIcon,
} from './icons/CustomIcons';
import { LogOut, LogIn } from 'lucide-react';

interface NavbarProps {
  onOpenCreateTicket: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateTicket, onOpenAuth }) => {
  const { user, isAuthenticated, isAgent, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandIcon className="w-9 h-9 shadow-xs rounded-xl" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-black text-slate-900 tracking-tight">Burdenoff</span>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-extrabold border border-indigo-100 uppercase tracking-wider">
                SLA Tracker
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Precision Business-Hours SLA Engine
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenCreateTicket}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
              >
                <RaiseTicketIcon className="w-4 h-4" />
                <span>Raise Ticket</span>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              <div className="flex items-center gap-3 pl-1">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 leading-tight">
                    {user?.name}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isAgent ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        <AgentRoleIcon className="w-3 h-3" />
                        AGENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        <ReporterRoleIcon className="w-3 h-3" />
                        REPORTER
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
