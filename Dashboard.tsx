import React from "react";
import { useQuery } from "@tanstack/react-query";
import { StatsCard } from "@/components/license/StatsCard";
import { ServiceStatusCard } from "@/components/app/ServiceStatusCard";
import { LicenseCard } from "@/components/license/LicenseCard";
import { QuickActions } from "@/components/app/QuickActions";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { License } from "@shared/schema";

export default function Dashboard() {
  const { toast } = useToast();

  // Fetch license statistics
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/licenses/stats"],
  });

  // Fetch recent licenses (limit to 3 for dashboard)
  const { data: licenses, isLoading: isLoadingLicenses } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });

  // Service statuses for the application
  const services = [
    {
      id: "discord",
      name: "Discord Bot",
      icon: "ri-discord-fill",
      iconBgColor: "bg-indigo-500/10",
      iconColor: "text-indigo-400",
      status: "online" as const,
      statusText: "Online",
      actionText: "Configure"
    },
    {
      id: "license",
      name: "License Service",
      icon: "ri-key-2-fill",
      iconBgColor: "bg-[#0078D4]/10",
      iconColor: "text-[#0078D4]",
      status: "online" as const,
      statusText: "Operational",
      actionText: "Details"
    },
    {
      id: "hwid",
      name: "HWID Service",
      icon: "ri-fingerprint-line",
      iconBgColor: "bg-teal-500/10",
      iconColor: "text-teal-400",
      status: "online" as const,
      statusText: "Operational",
      actionText: "Details"
    }
  ];

  // Handle service action button clicks
  const handleServiceAction = (serviceId: string) => {
    toast({
      title: "Service Action",
      description: `Action triggered for ${serviceId} service`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoadingStats ? (
          <>
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </>
        ) : (
          <>
            <StatsCard
              title="Total Licenses"
              value={stats?.totalCount || 0}
              icon="ri-key-2-line"
              iconBgColor="bg-[#0078D4]/10"
              iconColor="text-[#0078D4]"
              percentChange={15}
            />
            
            <StatsCard
              title="Active Licenses"
              value={stats?.activeCount || 0}
              icon="ri-check-line"
              iconBgColor="bg-[#107C10]/10"
              iconColor="text-[#107C10]"
              percentChange={8}
            />
            
            <StatsCard
              title="Pending Activation"
              value={stats?.pendingCount || 0}
              icon="ri-time-line"
              iconBgColor="bg-yellow-500/10"
              iconColor="text-yellow-500"
              percentChangeText="No change"
            />
            
            <StatsCard
              title="Expired Licenses"
              value={stats?.expiredCount || 0}
              icon="ri-close-circle-line"
              iconBgColor="bg-[#D83B01]/10"
              iconColor="text-[#D83B01]"
              percentChange={5}
            />
          </>
        )}
      </div>
      
      {/* Application Status */}
      <ServiceStatusCard
        title="Application Status"
        services={services}
        onServiceAction={handleServiceAction}
      />
      
      {/* License Management & Quick Actions */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Recent Licenses */}
        <div className="flex-1">
          <div className="bg-[#1E1E1E] border border-[#333333] rounded-lg p-5 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Recent Licenses</h2>
              <Button 
                variant="link" 
                className="flex items-center text-[#0078D4] text-sm"
                onClick={() => window.location.href = "/licenses"}
              >
                <span>View All</span>
                <i className="ri-arrow-right-s-line ml-1"></i>
              </Button>
            </div>
            
            {isLoadingLicenses ? (
              <div className="space-y-4">
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-32 w-full rounded-md" />
              </div>
            ) : licenses && licenses.length > 0 ? (
              <div className="space-y-4">
                {licenses.slice(0, 3).map((license) => (
                  <LicenseCard key={license.id} license={license} />
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-[#797775]">
                <i className="ri-key-line text-4xl mb-2"></i>
                <p>No licenses found</p>
                <Button 
                  variant="link" 
                  className="mt-2 text-[#0078D4]"
                  onClick={() => window.location.href = "/licenses"}
                >
                  Create your first license
                </Button>
              </div>
            )}
            
            {licenses && licenses.length > 0 && (
              <div className="mt-4 text-center">
                <Button 
                  variant="outline" 
                  className="px-4 py-2 bg-[#252525] hover:bg-[#333333] rounded-md text-sm text-[#EDEBE9] transition border-[#333333]"
                  onClick={() => window.location.href = "/licenses"}
                >
                  Load More
                </Button>
              </div>
            )}
          </div>
        </div>
        
        {/* Quick Actions */}
        <div className="md:w-80">
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
