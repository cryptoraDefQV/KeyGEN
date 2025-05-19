import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { License } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { formatLicenseKey, getLicenseStatusLabel, getLicenseStatusColor } from "@/lib/licenseUtils";
import { MoreHorizontal, RefreshCw } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface LicenseCardProps {
  license: License;
}

export function LicenseCard({ license }: LicenseCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Parse features from JSON string
  const features = React.useMemo(() => {
    try {
      return JSON.parse(license.features || "{}");
    } catch (error) {
      return {};
    }
  }, [license.features]);
  
  // Format dates
  const issuedDate = new Date(license.createdAt).toLocaleDateString("en-US", {
    month: "long", 
    day: "numeric", 
    year: "numeric"
  });
  
  const expiryDate = license.expiresAt 
    ? new Date(license.expiresAt).toLocaleDateString("en-US", {
        month: "long", 
        day: "numeric", 
        year: "numeric"
      })
    : "Never";
  
  // Mutation for revoking a license
  const revokeMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("PUT", `/api/licenses/${license.id}`, {
        status: "revoked"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/stats"] });
      toast({
        title: "License revoked",
        description: `License ${license.licenseKey} has been revoked.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to revoke license",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Mutation for renewing a license
  const renewMutation = useMutation({
    mutationFn: async () => {
      // Add 30 days from now (or from expiry if it's in the future)
      const currentExpiry = license.expiresAt ? new Date(license.expiresAt) : new Date();
      const newExpiry = new Date(currentExpiry);
      newExpiry.setDate(newExpiry.getDate() + 30);
      
      return apiRequest("PUT", `/api/licenses/${license.id}`, {
        status: "active",
        expiresAt: newExpiry.toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/stats"] });
      toast({
        title: "License renewed",
        description: `License ${license.licenseKey} has been renewed for 30 days.`,
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to renew license",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Get appropriate actions based on license status
  const getLicenseActions = () => {
    switch (license.status) {
      case "active":
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="px-3 py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20">
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-3 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => revokeMutation.mutate()}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? "Revoking..." : "Revoke"}
            </Button>
          </div>
        );
      case "pending":
        return (
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" className="px-3 py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20">
              Activate
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="px-3 py-1 rounded text-xs bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => revokeMutation.mutate()}
              disabled={revokeMutation.isPending}
            >
              {revokeMutation.isPending ? "Revoking..." : "Revoke"}
            </Button>
          </div>
        );
      case "expired":
      case "revoked":
        return (
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="px-3 py-1 rounded text-xs bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => renewMutation.mutate()}
              disabled={renewMutation.isPending}
            >
              {renewMutation.isPending ? "Renewing..." : "Renew"}
            </Button>
            <Button size="sm" variant="outline" className="px-3 py-1 rounded text-xs bg-[#1E1E1E] text-[#EDEBE9] hover:bg-[#333333]">
              Delete
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="border border-[#333333] rounded-md p-4 bg-[#252525] hover:bg-[#252525]/80 transition">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center">
            <h3 className="font-medium text-white">{formatLicenseKey(license.licenseKey)}</h3>
            <Badge 
              variant={getLicenseStatusColor(license.status) as any} 
              className="ml-4 px-2 py-0.5 rounded-full text-xs"
            >
              {getLicenseStatusLabel(license.status)}
            </Badge>
          </div>
          <div className="text-sm text-[#797775] mt-1">
            Issued: {issuedDate} • {license.status === "expired" ? "Expired" : "Expires"}: {expiryDate}
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" className="p-1.5 rounded-md hover:bg-[#1E1E1E] text-[#797775] hover:text-white">
            <RefreshCw className="h-4 w-4" />
            <span className="sr-only">Refresh</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="p-1.5 rounded-md hover:bg-[#1E1E1E] text-[#797775] hover:text-white">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">More</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Copy License Key</DropdownMenuItem>
              <DropdownMenuItem>View Details</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Revoke License</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row mt-3 gap-4">
        <div className="flex-1">
          <div className="text-xs uppercase text-[#797775] tracking-wider mb-1">User</div>
          <div className="flex items-center">
            <div className="w-7 h-7 rounded-full bg-[#1E1E1E] flex items-center justify-center">
              <i className="ri-user-line text-[#EDEBE9] text-sm"></i>
            </div>
            <div className="ml-2 text-sm">{license.userId ? `User #${license.userId}` : "No user assigned"}</div>
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-xs uppercase text-[#797775] tracking-wider mb-1">HWID</div>
          <div className="text-sm">
            {license.hwid ? (
              <>
                <span className="font-mono text-[#EDEBE9]">{license.hwid.substring(0, 11)}</span>
                <span className="text-xs rounded px-1.5 py-0.5 ml-2 bg-[#1E1E1E] text-[#797775]">Locked</span>
              </>
            ) : (
              <span className="font-mono text-[#EDEBE9]">Not Activated</span>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="text-xs uppercase text-[#797775] tracking-wider mb-1">Actions</div>
          {getLicenseActions()}
        </div>
      </div>
    </div>
  );
}
