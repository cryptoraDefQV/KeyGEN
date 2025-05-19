import { apiRequest } from "./queryClient";
import { getOrCreateMachineId } from "./machineId";
import { License, VerifyLicenseInput, ActivateLicenseInput } from "@shared/schema";

/**
 * Verifies a license key against the server
 */
export async function verifyLicense(licenseKey: string): Promise<{
  valid: boolean;
  activated: boolean;
  status?: string;
  message?: string;
  expires?: Date;
  features?: any;
}> {
  try {
    // Get the machine ID
    const hwid = await getOrCreateMachineId();
    
    // Create verification payload
    const payload: VerifyLicenseInput = {
      licenseKey,
      hwid
    };
    
    // Send verification request
    const response = await apiRequest("POST", "/api/licenses/verify", payload);
    const result = await response.json();
    
    // Convert ISO date string to Date object if present
    if (result.expires) {
      result.expires = new Date(result.expires);
    }
    
    return result;
  } catch (error) {
    if (error instanceof Response) {
      const errorData = await error.json();
      return {
        valid: false,
        activated: false,
        message: errorData.message || "License verification failed"
      };
    }
    
    return {
      valid: false,
      activated: false,
      message: "License verification failed: " + (error as Error).message
    };
  }
}

/**
 * Activates a license with the current machine's HWID
 */
export async function activateLicense(licenseKey: string): Promise<{
  success: boolean;
  license?: License;
  message?: string;
}> {
  try {
    // Get the machine ID
    const hwid = await getOrCreateMachineId();
    
    // Create activation payload
    const payload: ActivateLicenseInput = {
      licenseKey,
      hwid
    };
    
    // Send activation request
    const response = await apiRequest("POST", "/api/licenses/activate", payload);
    const result = await response.json();
    
    return {
      success: true,
      license: result.license
    };
  } catch (error) {
    if (error instanceof Response) {
      const errorData = await error.json();
      return {
        success: false,
        message: errorData.message || "License activation failed"
      };
    }
    
    return {
      success: false,
      message: "License activation failed: " + (error as Error).message
    };
  }
}

/**
 * Formats a license key for display (adds hyphens if needed)
 */
export function formatLicenseKey(licenseKey: string): string {
  // If the license is already properly formatted, return it
  if (/^PRUDA-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(licenseKey)) {
    return licenseKey;
  }
  
  // Clean the license key (remove spaces, hyphens)
  const cleaned = licenseKey.replace(/[\s-]/g, '').toUpperCase();
  
  // If we don't have enough characters for a full license, return as is
  if (cleaned.length < 16) return cleaned;
  
  // Format as PRUDA-XXXX-XXXX-XXXX
  return `PRUDA-${cleaned.substr(0, 4)}-${cleaned.substr(4, 4)}-${cleaned.substr(8, 4)}`;
}

/**
 * Returns a human-readable representation of a license status
 */
export function getLicenseStatusLabel(status: string): string {
  const statusMap: Record<string, string> = {
    'active': 'Active',
    'pending': 'Pending Activation',
    'expired': 'Expired',
    'revoked': 'Revoked'
  };
  
  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

/**
 * Returns a color for a license status
 */
export function getLicenseStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'active': 'success',
    'pending': 'warning',
    'expired': 'destructive',
    'revoked': 'destructive'
  };
  
  return colorMap[status] || 'muted';
}

/**
 * Returns the time remaining on a license in days
 */
export function getLicenseTimeRemaining(expiresAt: Date | string | null): number {
  if (!expiresAt) return 0;
  
  const expiry = typeof expiresAt === 'string' ? new Date(expiresAt) : expiresAt;
  const now = new Date();
  
  // Convert milliseconds to days
  return Math.max(0, Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}
