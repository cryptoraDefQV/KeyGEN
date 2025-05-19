import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { License } from "@shared/schema";
import { LicenseCard } from "@/components/license/LicenseCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GenerateLicenseDialog } from "@/components/license/GenerateLicenseDialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Search, SlidersHorizontal } from "lucide-react";

export default function LicenseManagement() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  
  // Fetch all licenses
  const { data: licenses, isLoading } = useQuery<License[]>({
    queryKey: ["/api/licenses"],
  });
  
  // Apply filters
  const filteredLicenses = React.useMemo(() => {
    if (!licenses) return [];
    
    return licenses.filter(license => {
      // Apply status filter
      if (statusFilter !== "all" && license.status !== statusFilter) {
        return false;
      }
      
      // Apply search term
      if (searchTerm && !license.licenseKey.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  }, [licenses, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">License Management</h1>
        <Button 
          onClick={() => setIsGenerateDialogOpen(true)}
          className="bg-[#0078D4] hover:bg-[#006CBE]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create License
        </Button>
      </div>
      
      {/* Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#797775]" />
          <Input
            placeholder="Search licenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-[#252525] border-[#333333] text-[#EDEBE9]"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="text-[#797775]" />
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[180px] bg-[#252525] border-[#333333] text-[#EDEBE9]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="bg-[#252525] border-[#333333]">
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="revoked">Revoked</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* License List */}
      <div className="space-y-4">
        {isLoading ? (
          <>
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </>
        ) : filteredLicenses.length > 0 ? (
          filteredLicenses.map((license) => (
            <LicenseCard key={license.id} license={license} />
          ))
        ) : (
          <div className="text-center py-12 border border-[#333333] rounded-md bg-[#252525]">
            <div className="mb-3">
              <i className="ri-key-line text-5xl text-[#797775]"></i>
            </div>
            {searchTerm || statusFilter !== "all" ? (
              <>
                <h3 className="text-lg font-medium">No matching licenses found</h3>
                <p className="text-[#797775] mt-1">Try adjusting your filters</p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                  className="mt-4 border-[#333333]"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-medium">No licenses found</h3>
                <p className="text-[#797775] mt-1">Get started by creating your first license</p>
                <Button 
                  onClick={() => setIsGenerateDialogOpen(true)}
                  className="mt-4 bg-[#0078D4] hover:bg-[#006CBE]"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create License
                </Button>
              </>
            )}
          </div>
        )}
      </div>
      
      {/* Pagination (simplified) */}
      {filteredLicenses.length > 0 && (
        <div className="flex justify-center mt-6">
          <Button 
            variant="outline"
            className="px-4 py-2 mx-1 border-[#333333]"
            disabled
          >
            Previous
          </Button>
          <Button 
            variant="outline"
            className="px-4 py-2 mx-1 bg-[#0078D4] text-white border-[#0078D4]"
            disabled
          >
            1
          </Button>
          <Button 
            variant="outline"
            className="px-4 py-2 mx-1 border-[#333333]"
            disabled
          >
            Next
          </Button>
        </div>
      )}
      
      {/* Generate License Dialog */}
      <GenerateLicenseDialog 
        isOpen={isGenerateDialogOpen} 
        onClose={() => setIsGenerateDialogOpen(false)} 
      />
    </div>
  );
}
