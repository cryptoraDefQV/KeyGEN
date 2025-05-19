/**
 * This module handles hardware ID (HWID) generation and retrieval
 * In a browser environment, we generate a somewhat stable identifier
 * from available browser data.
 * 
 * Note: This is a simplified version for demo purposes.
 * In a real application, a more sophisticated and reliable
 * hardware fingerprinting approach would be needed.
 */

// Generates a stable HWID for the current browser session
export async function getMachineId(): Promise<string> {
  // Collect various browser properties for fingerprinting
  const screenProps = `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const language = navigator.language;
  const platform = navigator.platform;
  const userAgent = navigator.userAgent;
  
  // Combine properties into a string
  const rawData = [screenProps, timeZone, language, platform, userAgent].join('|');
  
  // Hash the data to create a stable ID
  const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(rawData));
  
  // Convert hash to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  
  // Format as XX-XX-XX-XX (use first 8 bytes)
  const formattedHwid = [
    hashHex.substr(0, 2),
    hashHex.substr(2, 2),
    hashHex.substr(4, 2),
    hashHex.substr(6, 2)
  ].join('-').toUpperCase();
  
  return formattedHwid;
}

// Retrieves or generates a HWID and stores it in localStorage
export function getOrCreateMachineId(): Promise<string> {
  const storedHwid = localStorage.getItem('hwid');
  
  if (storedHwid) {
    return Promise.resolve(storedHwid);
  } else {
    return getMachineId().then(hwid => {
      localStorage.setItem('hwid', hwid);
      return hwid;
    });
  }
}

// Formats a HWID for display
export function formatHwid(hwid: string): string {
  // Check if already formatted
  if (hwid.includes('-')) return hwid;
  
  // Format as XX-XX-XX-XX
  let formatted = '';
  for (let i = 0; i < hwid.length; i += 2) {
    if (i > 0) formatted += '-';
    formatted += hwid.substr(i, 2);
  }
  
  return formatted;
}
