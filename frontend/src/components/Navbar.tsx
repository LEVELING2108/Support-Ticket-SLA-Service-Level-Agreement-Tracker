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
    <header className="w-full bg-white/85 backdrop-blur-md border-b border-stone-200/80 sticky top-0 z-30 transition-colors">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <BrandIcon className="w-7 h-7 transition-transform hover:scale-105" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-stone-900 tracking-tight">Burdenoff</span>
            <span className="text-[10px] text-stone-400 font-mono hidden sm:inline">/ SLA Engine</span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <button
                onClick={onOpenCreateTicket}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>

              <div className="h-4 w-px bg-stone-200 mx-1"></div>

              <div className="flex items-center gap-2.5 pl-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-stone-700">{user?.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                      isAgent
                        ? 'bg-purple-50 text-purple-700 border border-purple-200/70'
                        : 'bg-stone-100 text-stone-600 border border-stone-200/70'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>

                <button
                  onClick={logout}
                  title="Sign out"
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors ml-1 active:scale-90"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold transition-all shadow-2xs active:scale-95"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
