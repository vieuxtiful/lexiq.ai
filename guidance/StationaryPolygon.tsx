/**
 * Statue Component
 * 
 * This component renders a 3D liquid blob image that responds to both mouse movement
 * and scroll position, creating an interactive camera effect. The polygon appears
 * "stationary" in the sense that it maintains a fixed position relative to the viewport,
 * but it subtly moves in response to user input.
 * 
 * Features:
 * - Mouse tracking with normalized coordinates (-1 to 1 range)
 * - Scroll-based horizontal translation (moves right as user scrolls down)
 * - Smooth CSS transitions for fluid motion
 * - Maximum offset constraint (stops at 75% off-screen)
 * 
 * @component
 * @example
 * ```tsx
 * <Statue scrollY={scrollPosition} />
 * ```
 */

import { useState, useEffect } from 'react';

/**
 * Props interface for the Statue component
 * 
 * @interface StatueProps
 * @property {number} scrollY - Current vertical scroll position in pixels
 */
interface StatueProps {
  scrollY: number;
}

/**
 * Statue functional component
 * 
 * @param {StatueProps} props - Component props
 * @returns {JSX.Element} The rendered polygon component
 */
export default function Statue({ scrollY }: StatueProps) {
  /**
   * State to track normalized mouse position
   * 
   * The mouse position is normalized to a range of -1 to 1 for both x and y axes,
   * with (0, 0) representing the center of the viewport. This normalization ensures
   * consistent behavior across different screen sizes.
   * 
   * @state
   * @type {{ x: number, y: number }}
   */
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  /**
   * Effect hook to set up mouse movement tracking
   * 
   * This effect attaches a mousemove event listener to the window when the component
   * mounts and removes it when the component unmounts. The listener calculates the
   * normalized mouse position and updates the state accordingly.
   */
  useEffect(() => {
    /**
     * Mouse move event handler
     * 
     * Converts raw mouse coordinates to normalized values in the range of -1 to 1.
     * The normalization formula:
     * - x: ((clientX / width) * 2 - 1) converts 0...width to -1...1
     * - y: (-(clientY / height) * 2 + 1) converts 0...height to 1...-1 (inverted)
     * 
     * The intensity multiplier (15) controls how much the polygon moves in response
     * to mouse movement. Higher values = more movement.
     * 
     * @param {MouseEvent} event - The mouse move event
     */
    const handleMouseMove = (event: MouseEvent) => {
      const { clientX, clientY } = event;
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Normalize mouse position to -1 to 1 range with intensity multiplier
      // The intensity value of 15 was chosen through experimentation to provide
      // noticeable but not excessive movement
      setMousePos({
        x: ((clientX / width) * 2 - 1) * 15,
        y: (-(clientY / height) * 2 + 1) * 15, // Y is inverted to match intuitive up/down
      });
    };

    // Attach the event listener to the window
    window.addEventListener('mousemove', handleMouseMove);
    
    // Cleanup function to remove the event listener when component unmounts
    // This prevents memory leaks and ensures the listener doesn't persist
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []); // Empty dependency array means this effect runs once on mount

  /**
   * Calculate horizontal offset based on scroll position
   * 
   * This calculation creates a parallax effect where the polygon moves to the right
   * as the user scrolls down. The movement is linear up to a maximum threshold.
   * 
   * Formula breakdown:
   * 1. (scrollY / maxScroll) - Creates a ratio from 0 to 1+ as user scrolls
   * 2. * maxOffset - Scales the ratio to pixel values
   * 3. Math.min(..., maxOffset) - Caps the offset at the maximum value
   * 
   * The polygon will move right until it's 75% off the screen, then stop.
   */
  
  // Maximum scroll distance (in pixels) to reach full offset
  // At 800px of scroll, the polygon will have moved to its maximum position
  const maxScroll = 800;
  
  // Maximum horizontal offset (75% of screen width)
  // This ensures the polygon doesn't completely disappear off-screen
  const maxOffset = window.innerWidth * 0.75;
  
  // Calculate current scroll offset, capped at maximum
  const scrollOffset = Math.min((scrollY / maxScroll) * maxOffset, maxOffset);

  /**
   * Render the polygon container with dynamic transforms
   * 
   * Structure:
   * - Outer div: Fixed positioning, centered vertically, z-index 5 (behind text)
   * - Inner div: Applies the combined transform (mouse + scroll effects)
   * - Image: The actual 3D liquid blob graphic
   */
  return (
    <div className="fixed top-1/2 left-1/2 -translate-y-1/2 z-5 pointer-events-none">
      {/* 
        The outer div is fixed and centered. The -translate-y-1/2 utility centers
        it vertically. The z-5 ensures it appears behind text elements (z-10).
        pointer-events-none makes it non-interactive so it doesn't block clicks.
      */}
      
      <div
        className="transition-transform duration-200 ease-out"
        style={{
          /**
           * Combined transform calculation:
           * 
           * X-axis: mousePos.x * 0.3 + scrollOffset
           * - mousePos.x * 0.3: Mouse-based horizontal movement (30% of normalized value)
           * - + scrollOffset: Scroll-based horizontal translation
           * 
           * Y-axis: mousePos.y * 0.3
           * - Mouse-based vertical movement (30% of normalized value)
           * 
           * The 0.3 multiplier reduces the intensity of mouse movement to create
           * a subtle, elegant effect rather than dramatic motion.
           */
          transform: `translate(${mousePos.x * 0.3 + scrollOffset}px, ${mousePos.y * 0.3}px)`,
          
          // Fixed dimensions for the polygon container
          width: '700px',
          height: '700px',
          
          // Offset to the right of center to partially cover the "We are..." text
          // This creates visual interest by having the polygon interact with the typography
          marginLeft: '150px',
        }}
      >
        {/* 
          The actual image element
          - src: Path to the 3D liquid blob image in the public directory
          - alt: Empty string because this is decorative (not informative)
          - className: Tailwind utilities for responsive sizing
        */}
        <img
          src="/liquid-blobs-shadow.png"
          alt=""
          className="w-full h-full object-contain"
        />
      </div>
    </div>
  );
}

/**
 * Implementation Notes:
 * 
 * 1. Performance Considerations:
 *    - The mousemove event fires very frequently (potentially 60+ times per second)
 *    - CSS transitions handle the actual animation, which is hardware-accelerated
 *    - React state updates are batched, so multiple rapid updates don't cause excessive re-renders
 * 
 * 2. Browser Compatibility:
 *    - CSS transforms are widely supported in all modern browsers
 *    - The transition property provides smooth motion across all platforms
 *    - window.innerWidth is supported in all browsers
 * 
 * 3. Accessibility:
 *    - The component is purely decorative (alt="" on image)
 *    - pointer-events-none ensures it doesn't interfere with interactive elements
 *    - The animation doesn't convey essential information, so it's safe for users who prefer reduced motion
 * 
 * 4. Customization Points:
 *    - Intensity multiplier (15): Increase for more dramatic mouse movement
 *    - Movement multiplier (0.3): Increase for more responsive mouse tracking
 *    - maxScroll (800): Adjust how far user must scroll for full offset
 *    - maxOffset (0.75): Change how far off-screen the polygon moves
 *    - Transition duration (200ms): Adjust for faster or slower motion
 * 
 * 5. Future Enhancements:
 *    - Add throttling to mousemove handler for better performance on low-end devices
 *    - Implement prefers-reduced-motion media query to disable animations for users who need it
 *    - Add touch event support for mobile devices
 *    - Consider using requestAnimationFrame for smoother animations
 */
