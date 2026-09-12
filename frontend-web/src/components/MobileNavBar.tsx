import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User } from 'lucide-react';

export const MobileNavBar: React.FC = () => {
  const location = useLocation();

  // Hide mobile nav during active gameplay to maximize arena viewport
  if (location.pathname.startsWith('/game/') || location.pathname.startsWith('/winner/')) {
    return null;
  }

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/hub', label: 'Games', icon: Gamepad2 },
    { to: '/leaderboard', label: 'Leaders', icon: Trophy },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#161926]/95 backdrop-blur-lg border-t border-[#ede8f8] dark:border-[#282d44] shadow-[0_-8px_24px_rgba(0,0,0,0.06)] px-4 py-2">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all ${
                isActive
                  ? 'text-[#8b7fe8] font-black scale-105'
                  : 'text-[#7e749c] dark:text-[#949bb4] hover:text-[#2a2050] dark:hover:text-white font-bold'
              }`}
            >
              <div
                className={`p-1.5 rounded-xl transition-all ${
                  isActive
                    ? 'bg-[#f0ecfc] dark:bg-[#8b7fe8]/20 shadow-xs ring-2 ring-[#8b7fe8]/20'
                    : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 stroke-[2.2]`} />
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
