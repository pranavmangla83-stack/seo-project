export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
export const GOOGLE_ADS_CONVERSION_ID =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
export const GOOGLE_ADS_SCAN_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_SCAN_CONVERSION_LABEL;
export const GOOGLE_ADS_LEAD_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_LEAD_CONVERSION_LABEL;
export const GOOGLE_ADS_PRICING_CONVERSION_LABEL =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_PRICING_CONVERSION_LABEL;

type GtagEventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (
      command: "config" | "event",
      targetId: string,
      params?: GtagEventParams
    ) => void;
  }
}

export function trackGaEvent(eventName: string, params: GtagEventParams = {}) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
}

export function trackGoogleAdsConversion(
  conversionLabel: string | undefined,
  params: GtagEventParams = {}
) {
  if (
    typeof window === "undefined" ||
    !window.gtag ||
    !GOOGLE_ADS_CONVERSION_ID ||
    !conversionLabel
  ) {
    return;
  }

  window.gtag("event", "conversion", {
    send_to: `${GOOGLE_ADS_CONVERSION_ID}/${conversionLabel}`,
    ...params
  });
}
