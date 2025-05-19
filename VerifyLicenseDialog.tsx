import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, X } from "lucide-react";
import { verifyLicense, activateLicense } from "@/lib/licenseUtils";
import { getOrCreateMachineId } from "@/lib/machineId";
import { useToast } from "@/hooks/use-toast";

interface VerifyLicenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function VerifyLicenseDialog({ isOpen, onClose }: VerifyLicenseDialogProps) {
  const { toast } = useToast();
  const [licenseKey, setLicenseKey] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    activated: boolean;
    status?: string;
    message?: string;
    expires?: Date;
    features?: any;
  } | null>(null);
  const [machineId, setMachineId] = useState<string | null>(null);
  
  // Get machine ID on component mount
  React.useEffect(() => {
    if (isOpen) {
      getOrCreateMachineId().then(setMachineId);
      // Reset state when dialog opens
      setLicenseKey("");
      setVerificationResult(null);
    }
  }, [isOpen]);
  
  const handleVerify = async () => {
    if (!licenseKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a license key",
        variant: "destructive",
      });
      return;
    }
    
    setIsVerifying(true);
    try {
      const result = await verifyLicense(licenseKey.trim());
      setVerificationResult(result);
    } catch (error) {
      toast({
        title: "Verification failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };
  
  const handleActivate = async () => {
    if (!licenseKey.trim()) return;
    
    setIsActivating(true);
    try {
      const result = await activateLicense(licenseKey.trim());
      
      if (result.success) {
        toast({
          title: "License activated",
          description: "Your license has been successfully activated on this device.",
          variant: "default",
        });
        
        // Update verification result
        setVerificationResult(prev => prev ? {
          ...prev,
          activated: true,
          status: "active"
        } : null);
      } else {
        toast({
          title: "Activation failed",
          description: result.message || "Failed to activate license",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Activation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E1E1E] border-[#333333] text-[#EDEBE9]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Verify License</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div>
            <Label htmlFor="licenseKey">License Key</Label>
            <Input
              id="licenseKey"
              value={licenseKey}
              onChange={(e) => setLicenseKey(e.target.value)}
              placeholder="Enter your license key (e.g., PRUDA-XXXX-XXXX-XXXX)"
              className="bg-[#252525] border-[#333333] text-[#EDEBE9] mt-1"
            />
          </div>
          
          {machineId && (
            <div>
              <Label>Hardware ID (HWID)</Label>
              <div className="flex items-center mt-1">
                <code className="px-2 py-1 bg-[#252525] rounded border border-[#333333] font-mono text-sm flex-1">
                  {machineId}
                </code>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-2 border-[#333333]"
                  onClick={() => {
                    navigator.clipboard.writeText(machineId);
                    toast({ description: "HWID copied to clipboard" });
                  }}
                >
                  Copy
                </Button>
              </div>
              <p className="text-xs text-[#797775] mt-1">
                This is the unique identifier for your device
              </p>
            </div>
          )}
          
          <div className="flex justify-end">
            <Button 
              onClick={handleVerify} 
              disabled={isVerifying || !licenseKey.trim()}
              className="bg-[#0078D4] hover:bg-[#006CBE] text-white"
            >
              {isVerifying ? "Verifying..." : "Verify License"}
            </Button>
          </div>
          
          {verificationResult && (
            <>
              <Separator className="my-4 bg-[#333333]" />
              
              <div className="rounded-md border border-[#333333] bg-[#252525] p-4">
                <div className="flex items-center mb-3">
                  {verificationResult.valid ? (
                    <div className="w-8 h-8 rounded-full bg-[#107C10]/10 flex items-center justify-center mr-3">
                      <Check className="h-5 w-5 text-[#107C10]" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#D83B01]/10 flex items-center justify-center mr-3">
                      <X className="h-5 w-5 text-[#D83B01]" />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium">
                      {verificationResult.valid ? "Valid License" : "Invalid License"}
                    </h3>
                    <p className="text-sm text-[#797775]">
                      {verificationResult.message || (verificationResult.valid ? 
                        "Your license is valid and can be used." : 
                        "The license key could not be verified.")}
                    </p>
                  </div>
                </div>
                
                {verificationResult.valid && (
                  <div className="space-y-3 mt-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-[#797775]">Status:</div>
                      <div className="font-medium">{verificationResult.status}</div>
                      
                      {verificationResult.expires && (
                        <>
                          <div className="text-[#797775]">Expires:</div>
                          <div className="font-medium">
                            {verificationResult.expires.toLocaleDateString()}
                          </div>
                        </>
                      )}
                      
                      <div className="text-[#797775]">Activated:</div>
                      <div className="font-medium">
                        {verificationResult.activated ? "Yes" : "No"}
                      </div>
                    </div>
                    
                    {!verificationResult.activated && (
                      <div className="mt-4">
                        <Button 
                          onClick={handleActivate} 
                          disabled={isActivating}
                          className="w-full bg-[#107C10] hover:bg-[#0EA80E] text-white"
                        >
                          {isActivating ? "Activating..." : "Activate License on this Device"}
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        
        <DialogFooter className="pt-4 mt-2">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-[#333333]"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
