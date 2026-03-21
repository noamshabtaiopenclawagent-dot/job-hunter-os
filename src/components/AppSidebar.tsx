"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Compass, Target, ListTodo, UserCircle, Settings, ShieldCheck } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Market", href: "/discover", icon: Compass },
  { label: "Matches", href: "/match", icon: Target },
  { label: "Pipeline", href: "/pipeline", icon: ListTodo },
];

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-white/5 h-screen flex flex-col p-6 fixed left-0 top-0 bg-background/50 backdrop-blur-xl z-50">
      <div className="flex items-center gap-3 mb-10 pl-2">
         <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-xl">J</div>
         <h1 className="text-lg font-black tracking-tight text-white/90">JobHunter OS</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const active = pathname === item.href;
          return (
            <Link 
              key={item.label} 
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                active 
                  ? "bg-primary/10 text-primary border border-primary/20" 
                  : "text-white/40 hover:text-white/80 hover:bg-white/5"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="pt-6 border-t border-white/5 space-y-4">
         <div className="flex items-center gap-3 px-2">
             <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/60">
                 <UserCircle size={20} />
             </div>
             <div>
                 <p className="text-xs font-black">Noam Shabtai</p>
                 <p className="text-[10px] opacity-40 uppercase font-black">Elite Member</p>
             </div>
         </div>
         
         <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400/80 uppercase">Swarm Sync</span>
            </div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
         </div>
      </div>
    </div>
  );
}
