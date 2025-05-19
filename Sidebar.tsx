import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();

  // Navigation links configuration
  const mainNavLinks = [
    { href: "/", icon: "ri-dashboard-line", label: "Dashboard" },
    { href: "/licenses", icon: "ri-key-line", label: "License Management" },
    { href: "/users", icon: "ri-users-line", label: "User Management" },
    { href: "/discord", icon: "ri-discord-line", label: "Discord Integration" },
    { href: "/settings", icon: "ri-settings-line", label: "Settings" },
  ];

  const toolsNavLinks = [
    { href: "/script-manager", icon: "ri-tools-line", label: "Script Manager" },
    { href: "/logs", icon: "ri-file-list-line", label: "Activity Logs" },
  ];

  return (
    <aside className="w-64 bg-[#1E1E1E] border-r border-[#333333] h-full flex flex-col">
      {/* App Logo & Title */}
      <div className="p-4 border-b border-[#333333]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-[#0078D4] rounded-md flex items-center justify-center">
            <i className="ri-key-2-line text-white text-lg"></i>
          </div>
          <h1 className="text-xl font-semibold text-white">PrudaTweak</h1>
        </div>
        <div className="text-sm text-[#797775] mt-1">License Manager v1.0.3</div>
      </div>
      
      {/* Main Navigation */}
      <nav className="mt-4 px-2 flex-1">
        <div className="text-xs uppercase text-[#797775] font-semibold tracking-wider px-2 mb-2">Main</div>
        
        {mainNavLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <a 
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md mb-1 transition",
                location === link.href 
                  ? "bg-[#0078D4]/10 text-[#0078D4] border-l-2 border-[#0078D4]" 
                  : "text-[#EDEBE9] hover:bg-[#252525]"
              )}
            >
              <i className={`${link.icon} text-lg`}></i>
              <span>{link.label}</span>
            </a>
          </Link>
        ))}
        
        {/* Tools Section */}
        <div className="text-xs uppercase text-[#797775] font-semibold tracking-wider px-2 mb-2 mt-6">Tools</div>
        
        {toolsNavLinks.map((link) => (
          <Link href={link.href} key={link.href}>
            <a 
              className={cn(
                "flex items-center space-x-3 px-3 py-2.5 rounded-md mb-1 transition",
                location === link.href 
                  ? "bg-[#0078D4]/10 text-[#0078D4] border-l-2 border-[#0078D4]" 
                  : "text-[#EDEBE9] hover:bg-[#252525]"
              )}
            >
              <i className={`${link.icon} text-lg`}></i>
              <span>{link.label}</span>
            </a>
          </Link>
        ))}
      </nav>
      
      {/* User Profile Section */}
      <div className="p-4 border-t border-[#333333]">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-[#252525] flex items-center justify-center">
            <i className="ri-user-line text-[#EDEBE9]"></i>
          </div>
          <div>
            <div className="text-sm font-medium text-[#EDEBE9]">Admin</div>
            <div className="text-xs text-[#797775]">admin@prudatweak.com</div>
          </div>
          <button className="ml-auto text-[#797775] hover:text-[#EDEBE9]">
            <i className="ri-logout-box-line"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
