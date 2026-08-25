import React from 'react';
import { useAuth } from '../context/useAuth';
import { BrandIcon } from './icons/CustomIcons';
import { LogOut, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenCreateTicket: () => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCreateTicket, onOpenAuth }) => {
  const { user, isAuthenticated, isAgent, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/70 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <BrandIcon className="w-7 h-7" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 tracking-tight">Burdenoff</span>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">/ SLA Tracker</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenCreateTicket}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>

              <div className="h-4 w-px bg-slate-200 mx-1"></div>

              <div className="flex items-center gap-2 pl-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-slate-700">{user?.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded font-bold uppercase tracking-wider ${
                      isAgent
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                        : 'bg-slate-100 text-slate-600 border border-slate-200/60'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition ml-1"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
