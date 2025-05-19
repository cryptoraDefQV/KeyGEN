import React from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  const [location] = useLocation();
  
  // Map location to page title
  const getPageTitle = () => {
    switch (location) {
      case "/":
        return "Dashboard";
      case "/licenses":
        return "License Management";
      case "/users":
        return "User Management";
      case "/discord":
        return "Discord Integration";
      case "/settings":
        return "Settings";
      case "/script-manager":
        return "Script Manager";
      case "/logs":
        return "Activity Logs";
      default:
        return "PrudaTweak";
    }
  };

  return (
    <header className="bg-[#1E1E1E] border-b border-[#333333] p-4 flex items-center justify-between">
      <div className="flex items-center md:hidden">
        <h1 className="text-lg font-semibold">{getPageTitle()}</h1>
      </div>
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon">
          <i className="ri-notification-3-line text-xl text-[#797775] hover:text-[#EDEBE9]"></i>
          <span className="sr-only">Notifications</span>
        </Button>
        <Button variant="ghost" size="icon">
          <i className="ri-question-line text-xl text-[#797775] hover:text-[#EDEBE9]"></i>
          <span className="sr-only">Help</span>
        </Button>
      </div>
    </header>
  );
}
