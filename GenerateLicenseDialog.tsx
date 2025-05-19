import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { generateLicenseSchema, type GenerateLicenseInput } from "@shared/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface GenerateLicenseDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GenerateLicenseDialog({ isOpen, onClose }: GenerateLicenseDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { handleSubmit, control, watch, setValue, reset, formState: { errors } } = useForm<GenerateLicenseInput>({
    resolver: zodResolver(generateLicenseSchema),
    defaultValues: {
      licenseType: "standard",
      hwidLock: "required",
      features: {
        scriptAccess: true,
        prioritySupport: false,
        betaFeatures: false
      }
    }
  });
  
  const licenseType = watch("licenseType");
  const showCustomDuration = licenseType === "custom";
  
  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen) {
      reset({
        licenseType: "standard",
        hwidLock: "required",
        features: {
          scriptAccess: true,
          prioritySupport: false,
          betaFeatures: false
        }
      });
    }
  }, [isOpen, reset]);
  
  // Mutation for generating a license
  const generateMutation = useMutation({
    mutationFn: async (data: GenerateLicenseInput) => {
      const response = await apiRequest("POST", "/api/licenses/generate", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/licenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/licenses/stats"] });
      
      toast({
        title: "License Generated",
        description: `License key has been generated: ${data.license.licenseKey}`,
        variant: "default",
      });
      
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Failed to generate license",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: GenerateLicenseInput) => {
    generateMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#1E1E1E] border-[#333333] text-[#EDEBE9]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Generate New License</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div>
            <Label htmlFor="licenseType">License Type</Label>
            <Controller
              name="licenseType"
              control={control}
              render={({ field }) => (
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <SelectTrigger className="w-full bg-[#252525] border-[#333333]">
                    <SelectValue placeholder="Select license type" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#252525] border-[#333333]">
                    <SelectItem value="standard">Standard License (30 days)</SelectItem>
                    <SelectItem value="premium">Premium License (90 days)</SelectItem>
                    <SelectItem value="annual">Annual License (365 days)</SelectItem>
                    <SelectItem value="custom">Custom License</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          
          {showCustomDuration && (
            <div className="flex space-x-2">
              <div className="w-1/2">
                <Label htmlFor="duration">Duration</Label>
                <Controller
                  name="duration"
                  control={control}
                  defaultValue={30}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={1}
                      className="bg-[#252525] border-[#333333] text-[#EDEBE9]"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  )}
                />
              </div>
              <div className="w-1/2">
                <Label htmlFor="durationType">Period</Label>
                <Controller
                  name="durationType"
                  control={control}
                  defaultValue="days"
                  render={({ field }) => (
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="bg-[#252525] border-[#333333]">
                        <SelectValue placeholder="Select period" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#252525] border-[#333333]">
                        <SelectItem value="days">Days</SelectItem>
                        <SelectItem value="months">Months</SelectItem>
                        <SelectItem value="years">Years</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
          )}
          
          <div>
            <Label htmlFor="discordUsername">Discord User</Label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-[#797775]">#</span>
              <Controller
                name="discordUsername"
                control={control}
                render={({ field }) => (
                  <Input
                    placeholder="Enter Discord username"
                    className="pl-8 bg-[#252525] border-[#333333] text-[#EDEBE9]"
                    {...field}
                  />
                )}
              />
            </div>
            <p className="text-xs text-[#797775] mt-1">User will receive the license key via Discord bot</p>
            {errors.discordUsername && (
              <p className="text-xs text-destructive mt-1">{errors.discordUsername.message}</p>
            )}
          </div>
          
          <div>
            <Label>HWID Lock</Label>
            <Controller
              name="hwidLock"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4 mt-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="required" id="required" className="border-[#333333] text-primary" />
                    <Label htmlFor="required" className="cursor-pointer">Required</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="optional" id="optional" className="border-[#333333] text-primary" />
                    <Label htmlFor="optional" className="cursor-pointer">Optional</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="none" id="none" className="border-[#333333] text-primary" />
                    <Label htmlFor="none" className="cursor-pointer">None</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </div>
          
          <div>
            <Label>Features</Label>
            <div className="space-y-2 mt-1">
              <div className="flex items-center space-x-2">
                <Controller
                  name="features.scriptAccess"
                  control={control}
                  render={({ field }) => (
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      id="scriptAccess"
                      className="border-[#333333] data-[state=checked]:bg-primary"
                    />
                  )}
                />
                <Label htmlFor="scriptAccess" className="cursor-pointer">Script Access</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Controller
                  name="features.prioritySupport"
                  control={control}
                  render={({ field }) => (
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      id="prioritySupport"
                      className="border-[#333333] data-[state=checked]:bg-primary"
                    />
                  )}
                />
                <Label htmlFor="prioritySupport" className="cursor-pointer">Priority Support</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Controller
                  name="features.betaFeatures"
                  control={control}
                  render={({ field }) => (
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                      id="betaFeatures"
                      className="border-[#333333] data-[state=checked]:bg-primary"
                    />
                  )}
                />
                <Label htmlFor="betaFeatures" className="cursor-pointer">Beta Features</Label>
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-[#333333] mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-[#333333]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={generateMutation.isPending}
              className="bg-[#0078D4] hover:bg-[#006CBE] text-white"
            >
              {generateMutation.isPending ? "Generating..." : "Generate"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
