import React from 'react';
import { useAuth } from '../context/useAuth';
import { Shield, User, LogOut, PlusCircle, LogIn, Clock } from 'lucide-react';

interface NavbarProps {
  onOpenCreateTicket: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateTicket, onOpenAuth }) => {
  const { user, isAuthenticated, isAgent, logout } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-900 tracking-tight">Burdenoff</span>
              <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100">
                SLA Tracker
              </span>
            </div>
            <p className="text-xs text-slate-400">Business-hours SLA Enforcement Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenCreateTicket}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition shadow-sm"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Raise Ticket</span>
              </button>

              <div className="h-6 w-px bg-slate-200 mx-1"></div>

              <div className="flex items-center gap-3 pl-1">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-semibold text-slate-800 leading-tight">
                    {user?.name}
                  </span>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    {isAgent ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-purple-50 text-purple-700 border border-purple-200">
                        <Shield className="w-2.5 h-2.5" />
                        AGENT
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        <User className="w-2.5 h-2.5" />
                        REPORTER
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Log out"
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium transition shadow-sm"
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
