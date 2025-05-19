import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { getOrCreateMachineId } from "@/lib/machineId";
import { Key, ShieldCheck, Clock, AlertTriangle } from "lucide-react";

export default function Settings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for general settings
  const [licensePrefix, setLicensePrefix] = useState("PRUDA");
  const [licenseLength, setLicenseLength] = useState("16");
  const [defaultLicenseDuration, setDefaultLicenseDuration] = useState("30");
  const [allowMultipleDevices, setAllowMultipleDevices] = useState(false);
  const [strictHwidCheck, setStrictHwidCheck] = useState(true);
  const [showVersionNumber, setShowVersionNumber] = useState(true);
  
  // Get current machine ID
  const [machineId, setMachineId] = React.useState<string | null>(null);
  
  React.useEffect(() => {
    getOrCreateMachineId().then(setMachineId);
  }, []);
  
  // Fetch settings
  const { data: settings, isLoading: isLoadingSettings } = useQuery({
    queryKey: ["/api/settings"],
    onSuccess: (data) => {
      // Update state with fetched settings
      if (data && Array.isArray(data)) {
        data.forEach(setting => {
          switch (setting.key) {
            case "licensePrefix":
              setLicensePrefix(setting.value);
              break;
            case "licenseLength":
              setLicenseLength(setting.value);
              break;
            case "defaultLicenseDuration":
              setDefaultLicenseDuration(setting.value);
              break;
            case "allowMultipleDevices":
              setAllowMultipleDevices(setting.value === "true");
              break;
            case "strictHwidCheck":
              setStrictHwidCheck(setting.value === "true");
              break;
            case "showVersionNumber":
              setShowVersionNumber(setting.value === "true");
              break;
          }
        });
      }
    }
  });
  
  // Mutation for saving settings
  const saveSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return apiRequest("POST", `/api/settings/${key}`, { value });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/settings"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to save setting",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  // Save general settings
  const saveGeneralSettings = () => {
    const settingsToSave = [
      { key: "licensePrefix", value: licensePrefix },
      { key: "licenseLength", value: licenseLength },
      { key: "defaultLicenseDuration", value: defaultLicenseDuration },
      { key: "allowMultipleDevices", value: allowMultipleDevices.toString() },
      { key: "strictHwidCheck", value: strictHwidCheck.toString() },
      { key: "showVersionNumber", value: showVersionNumber.toString() }
    ];
    
    // Save all settings
    Promise.all(
      settingsToSave.map(setting => 
        saveSettingMutation.mutateAsync(setting)
      )
    )
      .then(() => {
        toast({
          title: "Settings saved",
          description: "Your settings have been updated successfully",
          variant: "default",
        });
      })
      .catch(error => {
        toast({
          title: "Error saving settings",
          description: "Some settings could not be saved",
          variant: "destructive",
        });
      });
  };
  
  // Reset to default settings
  const resetToDefaults = () => {
    setLicensePrefix("PRUDA");
    setLicenseLength("16");
    setDefaultLicenseDuration("30");
    setAllowMultipleDevices(false);
    setStrictHwidCheck(true);
    setShowVersionNumber(true);
    
    toast({
      title: "Settings reset",
      description: "Settings have been reset to defaults. Click Save to apply.",
      variant: "default",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-[#797775] mt-1">
          Configure your license manager settings and preferences
        </p>
      </div>
      
      {isLoadingSettings ? (
        <div className="space-y-4">
          <Skeleton className="h-[500px] w-full rounded-lg" />
        </div>
      ) : (
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="bg-[#252525] border border-[#333333]">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="mt-4">
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription className="text-[#797775]">
                  Configure general license manager settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="licensePrefix">License Key Prefix</Label>
                  <Input
                    id="licensePrefix"
                    value={licensePrefix}
                    onChange={(e) => setLicensePrefix(e.target.value)}
                    placeholder="PRUDA"
                    className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                  />
                  <p className="text-xs text-[#797775]">
                    Prefix for all generated license keys (e.g., PRUDA-XXXX-XXXX-XXXX)
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="licenseLength">License Key Length</Label>
                    <Select 
                      value={licenseLength} 
                      onValueChange={setLicenseLength}
                    >
                      <SelectTrigger className="bg-[#252525] border-[#333333] text-[#EDEBE9]">
                        <SelectValue placeholder="Select length" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252525] border-[#333333]">
                        <SelectItem value="12">12 characters</SelectItem>
                        <SelectItem value="16">16 characters</SelectItem>
                        <SelectItem value="20">20 characters</SelectItem>
                        <SelectItem value="24">24 characters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="defaultDuration">Default License Duration</Label>
                    <Select 
                      value={defaultLicenseDuration} 
                      onValueChange={setDefaultLicenseDuration}
                    >
                      <SelectTrigger className="bg-[#252525] border-[#333333] text-[#EDEBE9]">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252525] border-[#333333]">
                        <SelectItem value="7">7 days</SelectItem>
                        <SelectItem value="30">30 days</SelectItem>
                        <SelectItem value="90">90 days</SelectItem>
                        <SelectItem value="365">365 days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="showVersion" className="font-medium">Show Version Number</Label>
                      <p className="text-xs text-[#797775]">Display the version number in the UI</p>
                    </div>
                    <Switch
                      id="showVersion"
                      checked={showVersionNumber}
                      onCheckedChange={setShowVersionNumber}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#333333] pt-4 flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={resetToDefaults}
                  className="border-[#333333]"
                >
                  Reset to Defaults
                </Button>
                <Button 
                  className="bg-[#0078D4] hover:bg-[#006CBE]"
                  onClick={saveGeneralSettings}
                  disabled={saveSettingMutation.isPending}
                >
                  {saveSettingMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="security" className="mt-4">
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription className="text-[#797775]">
                  Configure security and hardware ID settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                  <div>
                    <Label htmlFor="strictHwid" className="font-medium">Strict HWID Checking</Label>
                    <p className="text-xs text-[#797775]">
                      Enforce exact HWID match (may cause issues if user hardware changes)
                    </p>
                  </div>
                  <Switch
                    id="strictHwid"
                    checked={strictHwidCheck}
                    onCheckedChange={setStrictHwidCheck}
                  />
                </div>
                
                <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                  <div>
                    <Label htmlFor="multipleDevices" className="font-medium">Allow Multiple Devices</Label>
                    <p className="text-xs text-[#797775]">
                      Allow a single license to be used on multiple devices
                    </p>
                  </div>
                  <Switch
                    id="multipleDevices"
                    checked={allowMultipleDevices}
                    onCheckedChange={setAllowMultipleDevices}
                  />
                </div>
                
                <Separator className="my-6 bg-[#333333]" />
                
                <div className="space-y-2">
                  <Label>Current Device Hardware ID</Label>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-[#252525] rounded border border-[#333333] font-mono text-sm">
                      {machineId || "Loading..."}
                    </code>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-[#333333]"
                      onClick={() => {
                        if (machineId) {
                          navigator.clipboard.writeText(machineId);
                          toast({ description: "HWID copied to clipboard" });
                        }
                      }}
                      disabled={!machineId}
                    >
                      Copy
                    </Button>
                  </div>
                  <p className="text-xs text-[#797775]">
                    This is your device's unique hardware identifier used for license activation
                  </p>
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#333333] pt-4 flex justify-end">
                <Button 
                  className="bg-[#0078D4] hover:bg-[#006CBE]"
                  onClick={saveGeneralSettings}
                  disabled={saveSettingMutation.isPending}
                >
                  {saveSettingMutation.isPending ? "Saving..." : "Save Security Settings"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="advanced" className="mt-4">
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Advanced Settings</CardTitle>
                <CardDescription className="text-[#797775]">
                  Advanced configuration options for the license system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-[#252525]/50 p-4 rounded border border-[#333333] mb-6">
                  <div className="flex gap-3">
                    <AlertTriangle className="text-yellow-500 mt-0.5" size={18} />
                    <div>
                      <p className="text-[#EDEBE9] text-sm">
                        These settings are for advanced users. Changing them may affect the functionality of your license system.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="encryptionKey">Encryption Key</Label>
                    <Input
                      id="encryptionKey"
                      type="password"
                      placeholder="••••••••••••••••"
                      className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                    />
                    <p className="text-xs text-[#797775]">
                      Secret key used for license encryption and decryption
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="apiRateLimit">API Rate Limit</Label>
                    <Select defaultValue="100">
                      <SelectTrigger className="bg-[#252525] border-[#333333] text-[#EDEBE9]">
                        <SelectValue placeholder="Select limit" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252525] border-[#333333]">
                        <SelectItem value="50">50 requests per minute</SelectItem>
                        <SelectItem value="100">100 requests per minute</SelectItem>
                        <SelectItem value="200">200 requests per minute</SelectItem>
                        <SelectItem value="500">500 requests per minute</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#797775]">
                      Maximum number of API requests allowed per minute
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="logLevel">Logging Level</Label>
                    <Select defaultValue="info">
                      <SelectTrigger className="bg-[#252525] border-[#333333] text-[#EDEBE9]">
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252525] border-[#333333]">
                        <SelectItem value="error">Error Only</SelectItem>
                        <SelectItem value="warn">Warning & Error</SelectItem>
                        <SelectItem value="info">Info & Above</SelectItem>
                        <SelectItem value="debug">Debug (Verbose)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-[#797775]">
                      Determines the amount of detail in application logs
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#333333] pt-4 flex justify-end">
                <Button 
                  className="bg-[#0078D4] hover:bg-[#006CBE]"
                  onClick={() => {
                    toast({
                      title: "Advanced settings saved",
                      description: "Your advanced settings have been updated",
                      variant: "default",
                    });
                  }}
                >
                  Save Advanced Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="about" className="mt-4">
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>About PrudaTweak License Manager</CardTitle>
                <CardDescription className="text-[#797775]">
                  Information about the license management system
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-[#0078D4] rounded-lg flex items-center justify-center">
                    <Key className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">PrudaTweak License Manager</h3>
                    <p className="text-[#797775]">Version 1.0.3</p>
                  </div>
                </div>
                
                <Separator className="my-4 bg-[#333333]" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#252525] rounded-md p-4 border border-[#333333]">
                    <div className="flex items-center gap-3 mb-2">
                      <Key className="h-5 w-5 text-[#0078D4]" />
                      <h3 className="font-medium">License Management</h3>
                    </div>
                    <p className="text-sm text-[#797775]">
                      Create, verify, and manage software licenses with HWID protection
                    </p>
                  </div>
                  
                  <div className="bg-[#252525] rounded-md p-4 border border-[#333333]">
                    <div className="flex items-center gap-3 mb-2">
                      <ShieldCheck className="h-5 w-5 text-[#107C10]" />
                      <h3 className="font-medium">HWID Protection</h3>
                    </div>
                    <p className="text-sm text-[#797775]">
                      Secure hardware ID binding prevents unauthorized license sharing
                    </p>
                  </div>
                  
                  <div className="bg-[#252525] rounded-md p-4 border border-[#333333]">
                    <div className="flex items-center gap-3 mb-2">
                      <Clock className="h-5 w-5 text-[#D83B01]" />
                      <h3 className="font-medium">Time-Based Licensing</h3>
                    </div>
                    <p className="text-sm text-[#797775]">
                      Set expiration dates and implement auto-renewal for subscriptions
                    </p>
                  </div>
                </div>
                
                <Separator className="my-4 bg-[#333333]" />
                
                <div className="text-center text-[#797775] text-sm">
                  <p>© 2023 PrudaTweak. All rights reserved.</p>
                  <p className="mt-1">
                    Built with <span className="text-red-500">♥</span> for the PrudaTweak community
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
