import React from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

export function MobileNav() {
  const [location] = useLocation();
  
  const navItems = [
    { href: "/", icon: "ri-dashboard-line", label: "Dashboard" },
    { href: "/licenses", icon: "ri-key-line", label: "Licenses" },
    { href: "/discord", icon: "ri-discord-line", label: "Discord" },
    { href: "/settings", icon: "ri-settings-line", label: "Settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1E1E1E] border-t border-[#333333] p-2 md:hidden z-10">
      <div className="flex justify-around">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            <a className={cn(
              "flex flex-col items-center px-3 py-1.5",
              location === item.href ? "text-[#0078D4]" : "text-[#EDEBE9]"
            )}>
              <i className={`${item.icon} text-xl`}></i>
              <span className="text-xs mt-1">{item.label}</span>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
