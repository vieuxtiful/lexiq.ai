/**
 * Meet the Team Page Component
 * 
 * This is the main page component for the "Meet the Team" route in the lexiq.ai application.
 * It creates an immersive, interactive experience featuring institutional branding, a bold
 * headline with fade-in animation, and a 3D liquid blob polygon that responds to user input.
 * 
 * Key Features:
 * - Scroll position tracking to enable parallax effects
 * - Fixed positioning for all elements (creates depth illusion)
 * - Institutional logos (Middlebury Institute + META Lab)
 * - Fade-in animation for the main headline
 * - Interactive 3D polygon with camera effects
 * - Navigation buttons for future sections
 * - Corner markers for visual framing
 * 
 * Route: /meet-the-team
 * 
 * @page
 */

import { useState, useEffect } from 'react';
import Statue from './StationaryPolygon';

/**
 * MeetTheTeam page component
 * 
 * This component serves as the container for the entire Meet the Team page.
 * It manages scroll state and passes it down to child components that need
 * to respond to scroll position.
 * 
 * @returns {JSX.Element} The rendered page
 */
export default function MeetTheTeam() {
  /**
   * State to track the current vertical scroll position
   * 
   * This value is updated on every scroll event and passed to the Statue
   * component to enable scroll-based animations. The value represents the number
   * of pixels the user has scrolled from the top of the page.
   * 
   * @state
   * @type {number}
   */
  const [scrollY, setScrollY] = useState(0);

  /**
   * Effect hook to set up scroll tracking
   * 
   * This effect attaches a scroll event listener to the window when the component
   * mounts and removes it when the component unmounts. The listener updates the
   * scrollY state on every scroll event.
   * 
   * Note: The scroll event fires very frequently during scrolling, but React's
   * state batching and the CSS transitions in child components ensure smooth
   * performance without excessive re-renders.
   */
  useEffect(() => {
    /**
     * Scroll event handler
     * 
     * Updates the scrollY state with the current vertical scroll position.
     * window.scrollY returns the number of pixels the document is currently
     * scrolled vertically from the top.
     */
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    // Attach the scroll listener to the window
    window.addEventListener('scroll', handleScroll);
    
    // Cleanup function to remove the listener when component unmounts
    // This prevents memory leaks and ensures the listener doesn't persist
    // after the user navigates away from this page
    return () => window.removeEventListener('scroll', handleScroll);
  }, []); // Empty dependency array = run once on mount

  /**
   * Render the page structure
   * 
   * The page uses a fixed positioning strategy where all elements are anchored
   * to the viewport rather than the document. This creates a layered, depth-based
   * layout where elements appear to float at different distances from the viewer.
   * 
   * The container has min-h-[200vh] to enable scrolling, which is necessary for
   * the scroll-based polygon animation to function.
   */
  return (
    <div className="relative min-h-[200vh] overflow-x-hidden bg-[#FAFAFA]">
      {/* 
        Container styling breakdown:
        - relative: Establishes positioning context for children
        - min-h-[200vh]: Minimum height of 200% viewport height (enables scrolling)
        - overflow-x-hidden: Prevents horizontal scrollbar when polygon moves off-screen
        - bg-[#FAFAFA]: Light gray background (almost white, but with subtle warmth)
      */}

      {/* ==================== Corner Markers ==================== */}
      {/*
        These four divs create decorative corner markers that frame the viewport.
        They're purely aesthetic and help establish the design language of the page.
        
        Common properties:
        - fixed: Anchored to viewport corners (don't scroll with content)
        - w-8 h-8: 32px x 32px size
        - border-*-2: 2px border on specific sides
        - border-gray-300: Light gray color
        - pointer-events-none: Don't interfere with mouse interactions
        - z-20: Highest z-index (appear above everything else)
      */}
      
      {/* Top-left corner marker */}
      <div className="fixed top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-gray-300 pointer-events-none z-20" />
      
      {/* Top-right corner marker */}
      <div className="fixed top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-gray-300 pointer-events-none z-20" />
      
      {/* Bottom-left corner marker */}
      <div className="fixed bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-gray-300 pointer-events-none z-20" />
      
      {/* Bottom-right corner marker */}
      <div className="fixed bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-gray-300 pointer-events-none z-20" />

      {/* ==================== Top Logos and Text ==================== */}
      {/*
        This section displays institutional branding at the top center of the page.
        It includes logos from Middlebury Institute of International Studies and
        META Laboratory, along with a descriptive tagline.
        
        Layout strategy:
        - Fixed positioning keeps it at the top even when scrolling
        - Flexbox centers the content horizontally
        - Gap utilities provide consistent spacing
      */}
      <div className="fixed top-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
        {/*
          Positioning breakdown:
          - fixed: Anchored to viewport (doesn't scroll)
          - top-12: 48px from top (3rem)
          - left-1/2 -translate-x-1/2: Horizontal centering technique
          - flex flex-col: Vertical flexbox layout
          - items-center: Center children horizontally
          - gap-3: 12px spacing between children
          - z-10: Above polygon (z-5) but below corner markers (z-20)
        */}
        
        {/* Logo container */}
        <div className="flex items-center gap-6">
          {/*
            Horizontal flexbox for side-by-side logo placement
            - items-center: Vertically align logos
            - gap-6: 24px spacing between logos
          */}
          
          {/* Middlebury Institute logo (left) */}
          <img 
            src="/miis-logo.svg" 
            alt="Middlebury Institute of International Studies at Monterey" 
            className="h-16 w-auto object-contain"
          />
          {/*
            Logo styling:
            - h-16: Fixed height of 64px (4rem)
            - w-auto: Width scales proportionally to maintain aspect ratio
            - object-contain: Ensures entire logo is visible without distortion
          */}
          
          {/* META Laboratory logo (right) */}
          <img 
            src="/meta-lab-logo.svg" 
            alt="META Laboratory - Evaluation, Training, Analysis" 
            className="h-12 w-auto object-contain"
          />
          {/*
            Slightly smaller height (h-12 = 48px) to balance visual weight
            with the Middlebury Institute logo
          */}
        </div>
        
        {/* Descriptive tagline */}
        <p className="text-[11px] tracking-wider text-gray-500 font-light">
          LINGUISTS, ENGINEERS, AND SMEs
        </p>
        {/*
          Typography styling:
          - text-[11px]: Small, precise font size
          - tracking-wider: Increased letter spacing for readability at small size
          - text-gray-500: Medium gray color (not too dark, not too light)
          - font-light: Thin font weight (300)
          
          This text describes the team composition in a concise, professional manner.
        */}
      </div>

      {/* ==================== Stationary Polygon ==================== */}
      {/*
        The 3D liquid blob polygon that responds to mouse movement and scroll position.
        This component is imported from ./components/Statue.tsx and receives
        the current scroll position as a prop.
        
        The polygon creates visual interest and demonstrates interactive capabilities.
        It's positioned at z-5 to appear behind text elements but in front of the background.
      */}
      <Statue scrollY={scrollY} />

      {/* ==================== Main Headline ==================== */}
      {/*
        The primary text content of the page: "We are..."
        
        This headline uses a fade-in animation (defined in globals.css) to create
        a dramatic entrance when the page loads. The animation takes 2 seconds and
        uses an ease-out timing function for a natural deceleration.
        
        Positioning strategy:
        - Fixed at the center of the viewport
        - Uses the centering technique: left-1/2 + -translate-x-1/2 (horizontal)
          and top-1/2 + -translate-y-1/2 (vertical)
        - z-10 ensures it appears above the polygon
      */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <h1 className="text-center animate-fade-in">
          {/*
            The animate-fade-in class is defined in globals.css and applies
            a 2-second opacity transition from 0 to 1.
          */}
          
          <div className="text-[clamp(3rem,12vw,9rem)] font-black leading-[0.9] tracking-tighter text-black">
            We are...
          </div>
          {/*
            Typography breakdown:
            
            - text-[clamp(3rem,12vw,9rem)]: Responsive font size
              * Minimum: 3rem (48px)
              * Preferred: 12vw (12% of viewport width)
              * Maximum: 9rem (144px)
              This ensures the text scales smoothly across all screen sizes
            
            - font-black: Maximum font weight (900) for bold impact
            
            - leading-[0.9]: Tight line height (90% of font size)
              Creates compact, impactful typography
            
            - tracking-tighter: Reduced letter spacing
              Brings letters closer together for a modern, tight aesthetic
            
            - text-black: Pure black color (#000000)
              Maximum contrast against the light gray background
          */}
        </h1>
      </div>

      {/* ==================== Left Bottom Text ==================== */}
      {/*
        A small descriptive text element in the bottom-left corner.
        This provides context about the page's purpose in a subtle, unobtrusive way.
      */}
      <div className="fixed bottom-32 left-8 z-10">
        {/*
          Positioning:
          - fixed: Anchored to viewport
          - bottom-32: 128px from bottom (8rem) - positioned above the navigation bar
          - left-8: 32px from left (2rem)
          - z-10: Same layer as other text elements
        */}
        
        <p className="text-[10px] text-gray-400 font-light leading-relaxed">
          A SHOWCASE SITE<br />
          TO INSPIRE YOU.
        </p>
        {/*
          Typography:
          - text-[10px]: Very small font size for subtle presence
          - text-gray-400: Light gray color (less prominent than main text)
          - font-light: Thin font weight (300)
          - leading-relaxed: Generous line height (1.625) for readability
          
          The <br /> tag creates a line break for better visual rhythm.
        */}
      </div>

      {/* ==================== Bottom Navigation ==================== */}
      {/*
        A navigation bar at the bottom of the viewport with three buttons.
        These buttons are currently placeholder elements but can be connected
        to actual functionality (smooth scrolling, page navigation, etc.)
        
        Design features:
        - Semi-transparent black background with blur effect
        - Rounded pill shape
        - Hover effects for interactivity
      */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-10">
        {/*
          Positioning:
          - fixed: Anchored to viewport
          - bottom-8: 32px from bottom (2rem)
          - left-1/2 -translate-x-1/2: Horizontal centering
          - z-10: Same layer as text elements
        */}
        
        <div className="flex items-center gap-8 bg-black/80 backdrop-blur-sm px-8 py-4 rounded-full">
          {/*
            Container styling:
            - flex items-center: Horizontal flexbox with vertical centering
            - gap-8: 32px spacing between buttons
            - bg-black/80: Black background with 80% opacity
            - backdrop-blur-sm: Subtle blur effect on content behind the bar
            - px-8 py-4: Horizontal padding 32px, vertical padding 16px
            - rounded-full: Fully rounded corners (pill shape)
          */}
          
          {/* Navigation button 1 */}
          <button className="text-white text-sm font-light hover:text-gray-300 transition-colors">
            01 ABOUT
          </button>
          
          {/* Navigation button 2 */}
          <button className="text-white text-sm font-light hover:text-gray-300 transition-colors">
            02 INTERACTIONS
          </button>
          
          {/* Navigation button 3 */}
          <button className="text-white text-sm font-light hover:text-gray-300 transition-colors">
            03 LEARN
          </button>
          
          {/*
            Button styling:
            - text-white: White text color
            - text-sm: Small font size (0.875rem / 14px)
            - font-light: Thin font weight (300)
            - hover:text-gray-300: Lighter gray on hover (provides feedback)
            - transition-colors: Smooth color transition (default 150ms)
            
            Future enhancement: Connect these buttons to actual sections using
            smooth scroll or Next.js routing.
          */}
        </div>
      </div>
    </div>
  );
}

/**
 * Implementation Notes:
 * 
 * 1. Scroll Performance:
 *    The scroll event listener fires frequently, but performance remains smooth because:
 *    - React batches state updates automatically
 *    - CSS transitions (not JavaScript) handle the actual animations
 *    - The Statue component uses hardware-accelerated transforms
 * 
 * 2. Fixed Positioning Strategy:
 *    All major elements use fixed positioning rather than absolute. This creates
 *    a layered effect where elements appear to float at different depths. The
 *    container has sufficient height (200vh) to enable scrolling, which triggers
 *    the polygon animation.
 * 
 * 3. Z-Index Hierarchy:
 *    - z-20: Corner markers (topmost layer)
 *    - z-10: Text elements and navigation (middle layer)
 *    - z-5: 3D polygon (background layer, defined in Statue component)
 *    This ensures proper layering where text remains readable above the polygon.
 * 
 * 4. Responsive Design:
 *    The page uses several responsive techniques:
 *    - clamp() for fluid typography that scales with viewport
 *    - Percentage-based positioning (left-1/2, top-1/2)
 *    - Auto-sizing for images (w-auto with fixed height)
 *    - Viewport-relative units (vh, vw)
 * 
 * 5. Accessibility Considerations:
 *    - Semantic HTML (h1 for main heading, nav for navigation)
 *    - Descriptive alt text for logos
 *    - Sufficient color contrast (black text on light gray background)
 *    - pointer-events-none on decorative elements
 *    
 *    Future enhancement: Add prefers-reduced-motion media query to disable
 *    animations for users who need it.
 * 
 * 6. Browser Compatibility:
 *    - CSS clamp() is supported in all modern browsers (Chrome 79+, Firefox 75+, Safari 13.1+)
 *    - backdrop-blur is supported in all modern browsers
 *    - Fixed positioning is universally supported
 * 
 * 7. Future Enhancements:
 *    - Connect navigation buttons to actual sections with smooth scrolling
 *    - Add team member cards in the scrollable area below
 *    - Implement mobile-specific layout adjustments
 *    - Add loading states for images
 *    - Implement error boundaries for robust error handling
 * 
 * 8. File Structure:
 *    This file should be placed at: app/meet-the-team/page.tsx
 *    The Statue component should be at: app/meet-the-team/components/Statue.tsx
 *    Images should be in: public/miis-logo.svg, public/meta-lab-logo.svg, public/liquid-blobs-shadow.png
 */
