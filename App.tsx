import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import LicenseManagement from "@/pages/LicenseManagement";
import UserManagement from "@/pages/UserManagement";
import DiscordIntegration from "@/pages/DiscordIntegration";
import Settings from "@/pages/Settings";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

function Router() {
  return (
    <Switch>
      <Route path="/">
        <DashboardLayout>
          <Dashboard />
        </DashboardLayout>
      </Route>
      <Route path="/licenses">
        <DashboardLayout>
          <LicenseManagement />
        </DashboardLayout>
      </Route>
      <Route path="/users">
        <DashboardLayout>
          <UserManagement />
        </DashboardLayout>
      </Route>
      <Route path="/discord">
        <DashboardLayout>
          <DiscordIntegration />
        </DashboardLayout>
      </Route>
      <Route path="/settings">
        <DashboardLayout>
          <Settings />
        </DashboardLayout>
      </Route>
      <Route>
        <NotFound />
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
