// lib/gtag.ts

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID as string;

// Types for gtag events
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
  }
}

// Track a pageview
export const pageview = (url: string, title?: string) => {
  if (!window.gtag) return;
  window.gtag("event", "page_view", {
    page_path: url,
    page_title: title ?? document.title,
    page_location: window.location.href,
  });
};

// Track a custom event
export const event = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category: string;
  label?: string;
  value?: number;
}) => {
  if (!window.gtag) return;
  window.gtag("event", action, {
    event_category: category,
    event_label: label,
    value,
  });
};
