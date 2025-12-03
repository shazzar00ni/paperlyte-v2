import { useEffect } from "react";
import { ErrorBoundary } from "@components/ErrorBoundary";
import { Header } from "@components/layout/Header";
import { Footer } from "@components/layout/Footer";
import { Hero } from "@components/sections/Hero";
import { Features } from "@components/sections/Features";
import { CTA } from "@components/sections/CTA";
import { analytics } from "@utils/analytics";

function App() {
  // Initialize analytics on mount
  useEffect(() => {
    analytics.init();
  }, []);

  return (
    <ErrorBoundary>
      <Header />
      <main id="main">
        <Hero />
        <Features />
        <CTA />
      </main>
      <Footer />
    </ErrorBoundary>
  );
}

export default App;
