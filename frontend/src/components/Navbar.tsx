import React from 'react';
import { useAuth } from '../context/useAuth';
import { BrandIcon } from './icons/CustomIcons';
import { Plus } from 'lucide-react';

interface NavbarProps {
  onOpenCreateTicket: () => void;
  onOpenAuth: () => void;
  onNavigateHome?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateTicket,
  onOpenAuth,
  onNavigateHome,
}) => {
  const { user, isAuthenticated, isAgent, logout } = useAuth();

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <header className="w-full bg-white border-b border-stone-200/90 sticky top-0 z-30">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Brand & Home */}
        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer text-left group"
          >
            <BrandIcon className="w-6 h-6 text-stone-950" />
            <span className="text-sm font-black text-stone-950 tracking-tight">Burdenoff</span>
          </button>
          <span className="text-stone-300 font-light">|</span>
          <button
            onClick={onNavigateHome}
            className="text-xs font-medium text-stone-600 hover:text-stone-950 transition-colors"
          >
            Home
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              {/* User Avatar Chip */}
              <div className="flex items-center gap-2">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${
                    isAgent ? 'bg-purple-600' : 'bg-sky-600'
                  }`}
                >
                  {getInitials(user?.name || '')}
                </div>
                <span className="text-xs font-medium text-stone-800 hidden sm:inline">
                  {user?.name}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold uppercase tracking-wider ${
                    isAgent
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/60'
                      : 'bg-stone-100 text-stone-600 border border-stone-200/60'
                  }`}
                >
                  {user?.role}
                </span>
              </div>

              {/* + New Ticket Button */}
              <button
                onClick={onOpenCreateTicket}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#18181b] hover:bg-black text-white text-xs font-semibold transition-all shadow-2xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Ticket</span>
              </button>

              {/* Sign Out Link */}
              <button
                onClick={logout}
                className="text-xs font-medium text-stone-500 hover:text-stone-900 transition-colors ml-1"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenAuth}
                className="text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={onNavigateHome}
                className="text-xs font-semibold text-stone-600 hover:text-stone-950 transition-colors"
              >
                Dashboard
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
