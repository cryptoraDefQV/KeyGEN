import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { GenerateLicenseDialog } from "@/components/license/GenerateLicenseDialog";
import { VerifyLicenseDialog } from "@/components/license/VerifyLicenseDialog";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function QuickActions() {
  const { toast } = useToast();
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isVerifyDialogOpen, setIsVerifyDialogOpen] = useState(false);
  
  // Settings state
  const [autoRenewal, setAutoRenewal] = useState(false);
  const [hwidLock, setHwidLock] = useState(true);
  const [discordNotifications, setDiscordNotifications] = useState(true);
  
  // Mutation for updating settings
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest("POST", `/api/settings/${key}`, { value });
    },
    onError: (error) => {
      toast({
        title: "Failed to update setting",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Handle setting changes
  const handleSettingChange = (key: string, value: boolean) => {
    switch (key) {
      case "autoRenewal":
        setAutoRenewal(value);
        break;
      case "hwidLock":
        setHwidLock(value);
        break;
      case "discordNotifications":
        setDiscordNotifications(value);
        break;
    }
    
    updateSettingMutation.mutate({ key, value: value.toString() });
  };

  return (
    <>
      <Card className="bg-[#1E1E1E] border-[#333333] rounded-lg shadow-lg h-full">
        <CardContent className="p-5">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          
          <div className="space-y-3">
            <Button 
              onClick={() => setIsGenerateDialogOpen(true)}
              className="w-full flex items-center justify-between p-3 rounded-md bg-[#0078D4] text-white hover:bg-[#006CBE] transition"
            >
              <span className="flex items-center">
                <i className="ri-add-line text-lg mr-3"></i>
                <span>Generate License</span>
              </span>
              <i className="ri-arrow-right-line"></i>
            </Button>
            
            <Button 
              onClick={() => setIsVerifyDialogOpen(true)}
              variant="outline"
              className="w-full flex items-center justify-between p-3 rounded-md bg-[#252525] border border-[#333333] text-[#EDEBE9] hover:text-white hover:border-[#797775] transition"
            >
              <span className="flex items-center">
                <i className="ri-key-line text-lg mr-3"></i>
                <span>Verify License</span>
              </span>
              <i className="ri-arrow-right-line"></i>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full flex items-center justify-between p-3 rounded-md bg-[#252525] border border-[#333333] text-[#EDEBE9] hover:text-white hover:border-[#797775] transition"
              onClick={() => {
                toast({
                  title: "Discord Integration",
                  description: "Please visit the Discord Integration page to add users",
                });
              }}
            >
              <span className="flex items-center">
                <i className="ri-user-add-line text-lg mr-3"></i>
                <span>Add Discord User</span>
              </span>
              <i className="ri-arrow-right-line"></i>
            </Button>
            
            <Button 
              variant="outline"
              className="w-full flex items-center justify-between p-3 rounded-md bg-[#252525] border border-[#333333] text-[#EDEBE9] hover:text-white hover:border-[#797775] transition"
              onClick={() => {
                toast({
                  title: "Bot Configuration",
                  description: "Please visit the Discord Integration page to configure the bot",
                });
              }}
            >
              <span className="flex items-center">
                <i className="ri-settings-line text-lg mr-3"></i>
                <span>Configure Bot</span>
              </span>
              <i className="ri-arrow-right-line"></i>
            </Button>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-3">License Settings</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                <div className="text-sm">
                  <div>Auto-renewal</div>
                  <div className="text-xs text-[#797775]">Automatically renew expiring licenses</div>
                </div>
                <Switch
                  checked={autoRenewal}
                  onCheckedChange={(checked) => handleSettingChange("autoRenewal", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                <div className="text-sm">
                  <div>HWID Lock</div>
                  <div className="text-xs text-[#797775]">Require hardware ID for all licenses</div>
                </div>
                <Switch
                  checked={hwidLock}
                  onCheckedChange={(checked) => handleSettingChange("hwidLock", checked)}
                />
              </div>
              
              <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                <div className="text-sm">
                  <div>Discord Notifications</div>
                  <div className="text-xs text-[#797775]">Send notifications on license events</div>
                </div>
                <Switch
                  checked={discordNotifications}
                  onCheckedChange={(checked) => handleSettingChange("discordNotifications", checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* License Dialogs */}
      <GenerateLicenseDialog 
        isOpen={isGenerateDialogOpen} 
        onClose={() => setIsGenerateDialogOpen(false)} 
      />
      
      <VerifyLicenseDialog 
        isOpen={isVerifyDialogOpen} 
        onClose={() => setIsVerifyDialogOpen(false)} 
      />
    </>
  );
}
