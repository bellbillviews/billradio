import { supabase } from "@/integrations/supabase/client";

// Get device type
function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet";
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

// Get browser name
function getBrowser(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("SamsungBrowser")) return "Samsung Browser";
  if (ua.includes("Opera") || ua.includes("OPR")) return "Opera";
  if (ua.includes("Trident")) return "IE";
  if (ua.includes("Edge")) return "Edge";
  if (ua.includes("Edg")) return "Edge Chromium";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  return "Unknown";
}

// Get OS
function getOS(): string {
  const ua = navigator.userAgent;
  if (ua.includes("Windows")) return "Windows";
  if (ua.includes("Mac")) return "macOS";
  if (ua.includes("Linux")) return "Linux";
  if (ua.includes("Android")) return "Android";
  if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) return "iOS";
  return "Unknown";
}

// Get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem("ad_session_id");
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("ad_session_id", sessionId);
  }
  return sessionId;
}

// Simple hash for privacy
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

// Track ad event
export async function trackAdEvent(
  adId: string,
  eventType: "view" | "click" | "impression"
): Promise<void> {
  try {
    // Avoid duplicate views in same session
    const viewKey = `ad_${adId}_${eventType}`;
    if (eventType === "view" && sessionStorage.getItem(viewKey)) {
      return;
    }

    // Get geo data
    const geo = await getGeoData();

    const analyticsData = {
      ad_id: adId,
      event_type: eventType,
      device_type: getDeviceType(),
      browser: getBrowser(),
      os: getOS(),
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      session_id: getSessionId(),
      ip_hash: simpleHash(navigator.userAgent + screen.width + screen.height),
      country: geo.country || null,
      city: geo.city || null,
    };

    await supabase.from("ad_analytics").insert(analyticsData);

    // Mark as tracked in this session
    if (eventType === "view") {
      sessionStorage.setItem(viewKey, "1");
    }
  } catch (error) {
    console.error("Failed to track ad event:", error);
  }
}

// Get geolocation data (optional, requires API)
export async function getGeoData(): Promise<{ country?: string; city?: string }> {
  try {
    // Using a free geolocation API
    const response = await fetch("https://ipapi.co/json/");
    if (response.ok) {
      const data = await response.json();
      return {
        country: data.country_name,
        city: data.city,
      };
    }
  } catch {
    // Silent fail - geo is optional
  }
  return {};
}
