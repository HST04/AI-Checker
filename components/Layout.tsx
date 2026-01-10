
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Bot, GraduationCap, Search, Bell, LogOut } from 'lucide-react';
import { cn } from './ui/Buttons';
import { Database } from '../lib/db';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const user = Database.currentUser;

  const navItems = [
    { label: 'Overview', icon: LayoutDashboard, href: '/' },
    { label: 'AI Center', icon: Bot, href: '/agents' },
  ];

  return (
    <div className="flex h-full bg-[#FDF8F3]">
      {/* Sidebar - Muted Neutral with Tuscany Touches */}
      <aside className="w-64 bg-white border-r border-[#9988A1]/10 flex flex-col p-6 shrink-0 z-20">
        <div className="mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-[#E35336] rounded-xl flex items-center justify-center shadow-md shadow-[#E35336]/10">
              <GraduationCap size={22} className="text-white" />
            </div>
            <span className="text-[#8A2B0E] font-extrabold text-xl tracking-tight">T.A.<span className="text-[#E35336]">I</span></span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all group",
                  isActive 
                    ? "bg-[#E35336]/5 text-[#E35336]" 
                    : "text-[#4A3731]/60 hover:text-[#8A2B0E] hover:bg-[#FDF8F3]"
                )}
              >
                <item.icon size={18} className={cn(
                  "transition-colors",
                  isActive ? "text-[#E35336]" : "text-[#4A3731]/30 group-hover:text-[#8A2B0E]"
                )} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="pt-6 border-t border-[#9988A1]/10">
          <div className="bg-[#FDF8F3] rounded-xl p-4">
            <div className="flex items-center gap-3 mb-4">
              <img src={user.avatar} className="w-10 h-10 rounded-lg border border-white" alt="Avatar" />
              <div className="min-w-0">
                <div className="text-xs font-bold text-[#8A2B0E] truncate">{user.name}</div>
                <div className="text-[9px] text-[#9988A1] uppercase font-bold tracking-widest">{user.role}</div>
              </div>
            </div>
            <button className="w-full py-1.5 text-[10px] font-bold uppercase text-[#9988A1] hover:text-[#E35336] transition-colors flex items-center justify-center gap-2">
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white/60 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-10 border-b border-[#9988A1]/5">
          <div className="flex-1 max-lg">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9988A1]/60" size={16} />
              <input 
                type="text"
                placeholder="Search resources..."
                className="w-full bg-black/5 border border-transparent rounded-lg py-1.5 pl-10 pr-4 text-sm font-medium text-[#4A3731] focus:bg-white focus:border-[#E35336]/20 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="w-10 h-10 flex items-center justify-center text-[#9988A1]/60 hover:text-[#E35336] hover:bg-black/5 rounded-lg transition-all relative">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#E35336] rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
