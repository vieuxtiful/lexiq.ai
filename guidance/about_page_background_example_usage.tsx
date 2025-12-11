import FaultyTerminal from './about_page_background';

/**
 * Example 1: Logo centered in the viewport
 */
export function CenteredLogoExample() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FaultyTerminal
        logoOffset={[0.25, 0.25]}  // Logo positioned at 25% from left, 25% from top
        logoScale={[0.5, 0.5]}      // Logo takes up 50% width and height
        tint="#00ffff"
        brightness={1.5}
        mouseReact={true}
        pageLoadAnimation={true}
      />
    </div>
  );
}

/**
 * Example 2: Logo in top-left corner
 */
export function TopLeftLogoExample() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FaultyTerminal
        logoOffset={[0.05, 0.05]}   // Logo positioned at 5% from left, 5% from top
        logoScale={[0.3, 0.3]}       // Logo takes up 30% width and height
        tint="#ffffff"
        brightness={1.2}
        curvature={0.15}
        chromaticAberration={2}
      />
    </div>
  );
}

/**
 * Example 3: Logo in bottom-right corner
 */
export function BottomRightLogoExample() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FaultyTerminal
        logoOffset={[0.65, 0.65]}   // Logo positioned at 65% from left, 65% from top
        logoScale={[0.3, 0.3]}       // Logo takes up 30% width and height
        tint="#ff00ff"
        glitchAmount={1.5}
        scanlineIntensity={0.8}
      />
    </div>
  );
}

/**
 * Example 4: Large logo covering most of the screen
 */
export function LargeLogoExample() {
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FaultyTerminal
        logoOffset={[0.1, 0.1]}     // Logo positioned at 10% from left, 10% from top
        logoScale={[0.8, 0.8]}       // Logo takes up 80% width and height
        tint="#00ff00"
        brightness={1.8}
        noiseAmp={0.5}
        mouseReact={true}
        mouseStrength={0.8}
      />
    </div>
  );
}

/**
 * Example 5: Responsive logo positioning with CSS
 * This example shows how to use CSS to control the logo position
 * based on screen size using media queries
 */
export function ResponsiveLogoExample() {
  // You can dynamically calculate logoOffset and logoScale based on window size
  const isMobile = window.innerWidth < 768;
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FaultyTerminal
        // On mobile: larger logo, more centered
        // On desktop: smaller logo, positioned differently
        logoOffset={isMobile ? [0.15, 0.15] : [0.25, 0.25]}
        logoScale={isMobile ? [0.7, 0.7] : [0.5, 0.5]}
        tint="#0ea5e9"
        brightness={1.3}
        pageLoadAnimation={true}
        mouseReact={!isMobile}  // Disable mouse interaction on mobile
      />
    </div>
  );
}

/**
 * Example 6: Using React state to animate logo position
 */
export function AnimatedLogoExample() {
  const [logoPos, setLogoPos] = React.useState<[number, number]>([0.25, 0.25]);
  
  React.useEffect(() => {
    const interval = setInterval(() => {
      setLogoPos(prev => {
        const time = Date.now() * 0.0005;
        return [
          0.25 + Math.sin(time) * 0.1,
          0.25 + Math.cos(time) * 0.1
        ];
      });
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      <FaultyTerminal
        logoOffset={logoPos}
        logoScale={[0.4, 0.4]}
        tint="#14b8a6"
        brightness={1.4}
        mouseReact={true}
      />
    </div>
  );
}

/**
 * Example 7: Logo position following CSS layout
 * This demonstrates how to calculate logo position based on an actual DOM element
 */
export function CSSLayoutBasedLogoExample() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const logoElementRef = React.useRef<HTMLDivElement>(null);
  const [logoConfig, setLogoConfig] = React.useState({
    offset: [0.25, 0.25] as [number, number],
    scale: [0.5, 0.5] as [number, number]
  });
  
  React.useEffect(() => {
    const updateLogoPosition = () => {
      if (!containerRef.current || !logoElementRef.current) return;
      
      const containerRect = containerRef.current.getBoundingClientRect();
      const logoRect = logoElementRef.current.getBoundingClientRect();
      
      // Calculate normalized position (0-1 range)
      const offsetX = (logoRect.left - containerRect.left) / containerRect.width;
      const offsetY = (logoRect.top - containerRect.top) / containerRect.height;
      const scaleX = logoRect.width / containerRect.width;
      const scaleY = logoRect.height / containerRect.height;
      
      setLogoConfig({
        offset: [offsetX, offsetY],
        scale: [scaleX, scaleY]
      });
    };
    
    updateLogoPosition();
    window.addEventListener('resize', updateLogoPosition);
    
    return () => window.removeEventListener('resize', updateLogoPosition);
  }, []);
  
  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {/* Invisible positioned element that defines where the logo should appear */}
      <div
        ref={logoElementRef}
        style={{
          position: 'absolute',
          top: '20%',
          left: '30%',
          width: '40%',
          height: '40%',
          pointerEvents: 'none',
          visibility: 'hidden'
        }}
      />
      
      <FaultyTerminal
        logoOffset={logoConfig.offset}
        logoScale={logoConfig.scale}
        tint="#10b981"
        brightness={1.5}
        mouseReact={true}
        pageLoadAnimation={true}
      />
    </div>
  );
}
