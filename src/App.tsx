import { ErrorBoundary } from "@components/ErrorBoundary";
import { Header } from "@components/layout/Header";
import { Footer } from "@components/layout/Footer";
import { Hero } from "@components/sections/Hero";
import { Features } from "@components/sections/Features";
import { CTA } from "@components/sections/CTA";

/**
 * Root application component that renders the app layout.
 *
 * Renders Header, a main content area containing Hero, Features, and CTA, and Footer wrapped in an ErrorBoundary.
 *
 * @returns The top-level React element for the application.
 */
function App() {
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