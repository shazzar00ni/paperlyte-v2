// Global type declarations

interface Window {
  gtag?: (
    command: "event",
    eventName: string,
    eventParams?: {
      event_category?: string;
      event_label?: string;
      value?: number;
      [key: string]: unknown;
    },
  ) => void;
}
