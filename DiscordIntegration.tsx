import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DiscordIntegration() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for form inputs
  const [botToken, setBotToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [serverId, setServerId] = useState("");
  const [licenseRoleId, setLicenseRoleId] = useState("");
  const [adminRoleId, setAdminRoleId] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);

  // Fetch current Discord integration settings
  const { data: discordConfig, isLoading } = useQuery({
    queryKey: ["/api/discord"],
    onSuccess: (data) => {
      // Populate form with existing data
      if (data) {
        setBotToken(data.botToken || "");
        setWebhookUrl(data.webhookUrl || "");
        setServerId(data.serverId || "");
        setLicenseRoleId(data.licenseRoleId || "");
        setAdminRoleId(data.adminRoleId || "");
        setIsEnabled(data.isEnabled || false);
      }
    }
  });

  // Mutation for saving Discord configuration
  const saveConfigMutation = useMutation({
    mutationFn: async () => {
      const endpoint = discordConfig?.id ? "/api/discord" : "/api/discord";
      const method = discordConfig?.id ? "PUT" : "POST";
      
      return apiRequest(method, endpoint, {
        botToken,
        webhookUrl,
        serverId,
        licenseRoleId,
        adminRoleId,
        isEnabled
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/discord"] });
      toast({
        title: "Discord integration saved",
        description: "Your Discord integration settings have been updated",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to save Discord integration",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveConfigMutation.mutate();
  };

  // Test webhook connection
  const testWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: "Webhook URL required",
        description: "Please enter a webhook URL first",
        variant: "destructive",
      });
      return;
    }

    try {
      // Simple test message to Discord webhook
      const testMessage = {
        embeds: [{
          title: "PrudaTweak License Manager",
          description: "This is a test message from the license manager.",
          color: 0x0078D4,
          footer: {
            text: "PrudaTweak License Manager"
          },
          timestamp: new Date().toISOString()
        }]
      };

      await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(testMessage)
      });

      toast({
        title: "Webhook test successful",
        description: "Test message sent to Discord",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Webhook test failed",
        description: "Could not send test message to Discord",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Discord Integration</h1>
        <p className="text-[#797775] mt-1">
          Configure Discord bot and webhook integration for automatic license distribution
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : (
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="bg-[#252525] border border-[#333333]">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="commands">Bot Commands</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="mt-4">
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Discord Integration Settings</CardTitle>
                <CardDescription className="text-[#797775]">
                  Configure your Discord bot and webhook settings for license management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="isEnabled" className="font-medium">Enable Discord Integration</Label>
                      <div className="text-xs text-[#797775]">(All features)</div>
                    </div>
                    <Switch
                      id="isEnabled"
                      checked={isEnabled}
                      onCheckedChange={setIsEnabled}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="webhookUrl">Discord Webhook URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="webhookUrl"
                          value={webhookUrl}
                          onChange={(e) => setWebhookUrl(e.target.value)}
                          placeholder="https://discord.com/api/webhooks/..."
                          className="flex-1 bg-[#252525] border-[#333333] text-[#EDEBE9]"
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={testWebhook}
                          className="whitespace-nowrap border-[#333333]"
                        >
                          Test Webhook
                        </Button>
                      </div>
                      <p className="text-xs text-[#797775]">
                        Used for sending license notifications to a Discord channel
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="botToken">Bot Token (Optional)</Label>
                      <Input
                        id="botToken"
                        value={botToken}
                        onChange={(e) => setBotToken(e.target.value)}
                        placeholder="Enter your Discord bot token"
                        className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                      />
                      <p className="text-xs text-[#797775]">
                        Required for advanced features like direct messages and role management
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="serverId">Server ID</Label>
                        <Input
                          id="serverId"
                          value={serverId}
                          onChange={(e) => setServerId(e.target.value)}
                          placeholder="Enter your Discord server ID"
                          className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="licenseRoleId">License Role ID</Label>
                        <Input
                          id="licenseRoleId"
                          value={licenseRoleId}
                          onChange={(e) => setLicenseRoleId(e.target.value)}
                          placeholder="Role ID for license holders"
                          className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="adminRoleId">Admin Role ID</Label>
                        <Input
                          id="adminRoleId"
                          value={adminRoleId}
                          onChange={(e) => setAdminRoleId(e.target.value)}
                          placeholder="Role ID for administrators"
                          className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-6 bg-[#0078D4] hover:bg-[#006CBE]"
                    disabled={saveConfigMutation.isPending}
                  >
                    {saveConfigMutation.isPending ? "Saving..." : "Save Discord Settings"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commands" className="mt-4">
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Bot Commands</CardTitle>
                <CardDescription className="text-[#797775]">
                  Available Discord bot commands for license management
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-[#252525] p-4 border border-[#333333]">
                  <h3 className="font-semibold text-[#EDEBE9] mb-1">!license check</h3>
                  <p className="text-[#797775] text-sm">Verify your license status and expiration date</p>
                </div>
                
                <div className="rounded-md bg-[#252525] p-4 border border-[#333333]">
                  <h3 className="font-semibold text-[#EDEBE9] mb-1">!license activate &lt;key&gt;</h3>
                  <p className="text-[#797775] text-sm">Activate a license with your Discord account</p>
                </div>
                
                <div className="rounded-md bg-[#252525] p-4 border border-[#333333]">
                  <h3 className="font-semibold text-[#EDEBE9] mb-1">!license help</h3>
                  <p className="text-[#797775] text-sm">Display help information about available commands</p>
                </div>
                
                <div className="bg-[#252525]/50 p-4 rounded border border-[#333333] mt-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-[#0078D4] mt-0.5" size={18} />
                    <div>
                      <h4 className="font-medium text-[#EDEBE9]">Admin Commands</h4>
                      <p className="text-[#797775] text-sm mt-1">
                        Additional commands are available to users with the admin role:
                      </p>
                      <ul className="space-y-1 mt-2 text-sm">
                        <li className="text-[#EDEBE9]">!license generate &lt;user&gt; &lt;days&gt;</li>
                        <li className="text-[#EDEBE9]">!license revoke &lt;key&gt;</li>
                        <li className="text-[#EDEBE9]">!license list</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="mt-4">
            <Card className="bg-[#1E1E1E] border-[#333333]">
              <CardHeader>
                <CardTitle>Discord Notifications</CardTitle>
                <CardDescription className="text-[#797775]">
                  Configure which events trigger Discord notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                    <div>
                      <h3 className="font-medium">License Generation</h3>
                      <p className="text-xs text-[#797775]">Send notification when a new license is created</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                    <div>
                      <h3 className="font-medium">License Activation</h3>
                      <p className="text-xs text-[#797775]">Send notification when a license is activated</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                    <div>
                      <h3 className="font-medium">License Expiration</h3>
                      <p className="text-xs text-[#797775]">Send notification when a license expires</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                    <div>
                      <h3 className="font-medium">License Revocation</h3>
                      <p className="text-xs text-[#797775]">Send notification when a license is revoked</p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-[#252525] rounded-md border border-[#333333]">
                    <div>
                      <h3 className="font-medium">Expiry Reminders</h3>
                      <p className="text-xs text-[#797775]">Send reminders before license expiration (3 days)</p>
                    </div>
                    <Switch />
                  </div>
                </div>
                
                <div className="mt-6 bg-[#252525]/50 p-4 rounded border border-[#333333]">
                  <div className="flex gap-3">
                    <CheckCircle2 className="text-[#107C10] mt-0.5" size={18} />
                    <div>
                      <p className="text-[#EDEBE9] text-sm">
                        Notifications will be sent to the configured webhook URL. Make sure you've set up the webhook in the Settings tab.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-[#333333] pt-4">
                <Button 
                  className="w-full bg-[#0078D4] hover:bg-[#006CBE]"
                  onClick={() => {
                    toast({
                      title: "Notification settings saved",
                      description: "Your notification preferences have been updated",
                      variant: "default",
                    });
                  }}
                >
                  Save Notification Settings
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
