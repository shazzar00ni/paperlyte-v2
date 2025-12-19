import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
// Self-hosted Google Fonts (Inter) for better security and performance
// Using Latin-only subset to reduce bundle size (~800 KB savings)
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-500.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
// Font Awesome icon library (tree-shaken, ~150-180 KB savings)
// Only icons actually used in the app are imported
import "./utils/iconLibrary";
import "./index.css";
import App from "./App.tsx";
import { updateMetaTags } from "./utils/env";

// Initialize environment-aware meta tags
updateMetaTags();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
