/**
 * Example Integration for lexiq.ai
 * 
 * This file shows how to integrate the Hyper-Digital Careers Background
 * into your existing lexiq.ai website structure.
 */

// ============================================================================
// OPTION 1: Direct Integration in Careers Page
// ============================================================================

// File: app/careers/page.tsx
"use client";

import { HyperDigitalCareersBackground } from "@/components/backgrounds/HyperDigitalCareersBackground";

export default function CareersPage() {
  return (
    <>
      {/* Background animation */}
      <HyperDigitalCareersBackground />

      {/* Page content */}
      <main className="relative z-10 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-5xl font-bold text-white mb-8">
            Join Our Team
          </h1>
          
          <p className="text-xl text-gray-300 mb-12">
            Help us build the future of AI-powered localization
          </p>

          {/* Job listings */}
          <div className="grid gap-6">
            {/* Your job cards */}
          </div>
        </div>
      </main>
    </>
  );
}

// ============================================================================
// OPTION 2: Conditional Background in GlobalBackground Component
// ============================================================================

// File: app/components/GlobalBackground.tsx
"use client";

import { usePathname } from "next/navigation";
import { HyperDigitalCareersBackground } from "./backgrounds/HyperDigitalCareersBackground";
import { DefaultBackground } from "./backgrounds/DefaultBackground";

export function GlobalBackground() {
  const pathname = usePathname();
  
  // Show hyper-digital background on careers page
  const isCareersRoute = pathname?.startsWith("/careers");

  if (isCareersRoute) {
    return <HyperDigitalCareersBackground />;
  }

  // Default background for other pages
  return <DefaultBackground />;
}

// File: app/layout.tsx
import { GlobalBackground } from "@/components/GlobalBackground";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GlobalBackground />
        {children}
      </body>
    </html>
  );
}

// ============================================================================
// OPTION 3: Responsive Configuration
// ============================================================================

// File: app/careers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { HyperDigitalCareersBackground } from "@/components/backgrounds/HyperDigitalCareersBackground";

export default function CareersPage() {
  const [config, setConfig] = useState({
    particleDensity: 3.5,
    uiElementCount: 12,
    enableCamera: true,
  });

  useEffect(() => {
    const updateConfig = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        // Mobile
        setConfig({
          particleDensity: 2.0,
          uiElementCount: 6,
          enableCamera: false,
        });
      } else if (width < 1024) {
        // Tablet
        setConfig({
          particleDensity: 3.0,
          uiElementCount: 10,
          enableCamera: true,
        });
      } else {
        // Desktop
        setConfig({
          particleDensity: 4.0,
          uiElementCount: 14,
          enableCamera: true,
        });
      }
    };

    updateConfig();
    window.addEventListener("resize", updateConfig);
    return () => window.removeEventListener("resize", updateConfig);
  }, []);

  return (
    <>
      <HyperDigitalCareersBackground
        particleDensity={config.particleDensity}
        uiElementCount={config.uiElementCount}
        enableCameraAnimation={config.enableCamera}
      />

      <main className="relative z-10">
        {/* Your content */}
      </main>
    </>
  );
}

// ============================================================================
// OPTION 4: With Loading State
// ============================================================================

// File: app/careers/page.tsx
"use client";

import { Suspense, useState } from "react";
import { HyperDigitalCareersBackground } from "@/components/backgrounds/HyperDigitalCareersBackground";

function LoadingFallback() {
  return (
    <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#000510] to-[#002244]">
      <div className="flex items-center justify-center h-full">
        <div className="text-cyan-400 text-xl">Loading...</div>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <HyperDigitalCareersBackground />
      </Suspense>

      <main className="relative z-10">
        {/* Your content */}
      </main>
    </>
  );
}

// ============================================================================
// OPTION 5: With User Preference (Reduced Motion)
// ============================================================================

// File: app/careers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { HyperDigitalCareersBackground } from "@/components/backgrounds/HyperDigitalCareersBackground";

export default function CareersPage() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  if (prefersReducedMotion) {
    // Static background for users who prefer reduced motion
    return (
      <>
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#000510] to-[#002244]" />
        <main className="relative z-10">
          {/* Your content */}
        </main>
      </>
    );
  }

  return (
    <>
      <HyperDigitalCareersBackground />
      <main className="relative z-10">
        {/* Your content */}
      </main>
    </>
  );
}

// ============================================================================
// OPTION 6: With Performance Monitoring
// ============================================================================

// File: app/careers/page.tsx
"use client";

import { useEffect, useState } from "react";
import { HyperDigitalCareersBackground } from "@/components/backgrounds/HyperDigitalCareersBackground";

export default function CareersPage() {
  const [quality, setQuality] = useState<"high" | "medium" | "low">("high");

  useEffect(() => {
    // Detect device performance
    const detectPerformance = () => {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const cores = navigator.hardwareConcurrency || 4;
      const memory = (navigator as any).deviceMemory || 4;

      if (isMobile || cores < 4 || memory < 4) {
        return "low";
      } else if (cores < 8 || memory < 8) {
        return "medium";
      }
      return "high";
    };

    setQuality(detectPerformance());
  }, []);

  const config = {
    high: { particleDensity: 4.5, uiElementCount: 16, enableCamera: true },
    medium: { particleDensity: 3.0, uiElementCount: 10, enableCamera: true },
    low: { particleDensity: 2.0, uiElementCount: 6, enableCamera: false },
  };

  return (
    <>
      <HyperDigitalCareersBackground {...config[quality]} />
      <main className="relative z-10">
        {/* Your content */}
      </main>
    </>
  );
}

// ============================================================================
// STYLING TIPS
// ============================================================================

/**
 * Ensure your content is visible above the background:
 * 
 * 1. Use relative positioning with z-index:
 *    className="relative z-10"
 * 
 * 2. Add text shadows for better readability:
 *    className="text-shadow-lg"
 * 
 * 3. Use semi-transparent backgrounds for cards:
 *    className="bg-black/50 backdrop-blur-sm"
 * 
 * 4. Ensure sufficient contrast:
 *    - Use white or light cyan text
 *    - Add dark overlays to images
 *    - Use border glows for emphasis
 */

// Example styled card component:
function JobCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative z-10 bg-black/40 backdrop-blur-md border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/60 transition-all">
      <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
        {title}
      </h3>
      <p className="text-gray-300 drop-shadow-md">
        {description}
      </p>
      <button className="mt-4 px-6 py-2 bg-cyan-500/20 border border-cyan-400 text-cyan-300 rounded hover:bg-cyan-500/30 transition-all">
        Apply Now
      </button>
    </div>
  );
}

// ============================================================================
// ACCESSIBILITY CONSIDERATIONS
// ============================================================================

/**
 * 1. Respect prefers-reduced-motion
 * 2. Ensure sufficient color contrast (WCAG AA)
 * 3. Add aria-hidden to decorative elements
 * 4. Provide alternative static background
 * 5. Test with screen readers
 */

// Example with accessibility:
export function AccessibleCareersPage() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
  }, []);

  return (
    <>
      {prefersReducedMotion ? (
        <div className="fixed inset-0 -z-10 bg-gradient-to-br from-[#000510] to-[#002244]" aria-hidden="true" />
      ) : (
        <div aria-hidden="true">
          <HyperDigitalCareersBackground />
        </div>
      )}

      <main className="relative z-10" role="main">
        <h1 className="sr-only">Careers at lexiq.ai</h1>
        {/* Visible content */}
      </main>
    </>
  );
}

// ============================================================================
// PERFORMANCE OPTIMIZATION
// ============================================================================

/**
 * 1. Use dynamic imports for code splitting:
 */
import dynamic from "next/dynamic";

const HyperDigitalCareersBackground = dynamic(
  () => import("@/components/backgrounds/HyperDigitalCareersBackground").then(
    (mod) => mod.HyperDigitalCareersBackground
  ),
  { ssr: false } // Disable SSR for Three.js components
);

/**
 * 2. Lazy load on viewport intersection:
 */
import { useEffect, useState } from "react";

export function LazyBackgroundPage() {
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    // Load after initial render
    const timer = setTimeout(() => setShouldLoad(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      {shouldLoad && <HyperDigitalCareersBackground />}
      <main className="relative z-10">
        {/* Your content */}
      </main>
    </>
  );
}

/**
 * 3. Preload dependencies:
 */
// In app/layout.tsx or _document.tsx:
<link rel="preload" href="/path/to/three.js" as="script" />

// ============================================================================
// DEBUGGING
// ============================================================================

/**
 * Enable debug mode to see:
 * - Axis helper (RGB = XYZ)
 * - Grid helper
 * - Light helpers
 * - FPS stats
 */
<HyperDigitalCareersBackground debug={true} />

/**
 * Check console for:
 * - WebGL context creation
 * - Shader compilation
 * - Performance warnings
 */

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/**
 * Before deploying:
 * 
 * ✅ Test on multiple browsers (Chrome, Firefox, Safari, Edge)
 * ✅ Test on multiple devices (Desktop, Tablet, Mobile)
 * ✅ Test with slow network (throttle in DevTools)
 * ✅ Test with reduced motion preference
 * ✅ Verify WebGL support fallback
 * ✅ Check bundle size (should be ~600 KB gzipped)
 * ✅ Verify 60 FPS on target devices
 * ✅ Test accessibility with screen reader
 * ✅ Validate HTML and CSS
 * ✅ Run Lighthouse audit
 */
