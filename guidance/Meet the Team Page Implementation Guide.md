# Meet the Team Page Implementation Guide

**Author:** Manus AI  
**Date:** November 26, 2025  
**Target Repository:** [vieuxtiful/lexiq.ai](https://github.com/vieuxtiful/lexiq.ai)

---

## Overview

This comprehensive guide provides step-by-step instructions for implementing a "Meet the Team" page in the lexiq.ai Next.js application. The page features an interactive 3D liquid blob polygon that responds to mouse movement and scroll position, along with institutional branding from Middlebury Institute of International Studies and META Laboratory.

The implementation includes a sophisticated camera effect system where the 3D polygon moves subtly in response to cursor position and translates horizontally as the user scrolls, creating an immersive parallax experience. The page uses a minimalist design with a light gray background, bold typography, and smooth CSS animations.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [File Architecture](#file-architecture)
4. [Step-by-Step Implementation](#step-by-step-implementation)
5. [Component Details](#component-details)
6. [Styling and Animations](#styling-and-animations)
7. [Navigation Integration](#navigation-integration)
8. [Testing and Verification](#testing-and-verification)
9. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before beginning the implementation, ensure your development environment meets the following requirements:

**Required Software:**
- Node.js version 18.0 or higher
- npm or pnpm package manager
- Git for version control

**Repository Setup:**
```bash
git clone https://github.com/vieuxtiful/lexiq.ai.git
cd lexiq.ai
npm install  # or pnpm install
```

**Required Assets:**
- `liquid-blobs-shadow.png` - 3D liquid blob image with shadow effects
- `miis-logo.svg` - Middlebury Institute logo
- `meta-lab-logo.svg` - META Laboratory logo

These assets should be placed in the `public/` directory at the root of your Next.js project.

---

## Project Structure

The lexiq.ai repository follows the Next.js 16 App Router convention. Understanding this structure is essential for proper integration of the Meet the Team page.

```
lexiq.ai/
├── app/
│   ├── layout.tsx           # Root layout with font configuration
│   ├── page.tsx             # Home page (to be replaced or modified)
│   ├── globals.css          # Global styles (will be extended)
│   └── meet-the-team/       # New directory for Meet the Team page
│       ├── page.tsx         # Main page component
│       └── components/      # Page-specific components
│           └── Statue.tsx
├── public/
│   ├── liquid-blobs-shadow.png
│   ├── miis-logo.svg
│   └── meta-lab-logo.svg
├── package.json
└── tailwind.config.ts
```

The App Router in Next.js 16 uses file-system based routing, where each folder under `app/` represents a route segment. The `page.tsx` file within a folder defines the UI for that route.

---

## File Architecture

### Directory Creation

First, create the necessary directory structure for the Meet the Team page:

```bash
mkdir -p app/meet-the-team/components
```

This creates a dedicated route at `/meet-the-team` with a subfolder for page-specific components.

### File Organization

The implementation consists of the following files:

| File Path | Purpose | Dependencies |
|-----------|---------|--------------|
| `app/meet-the-team/page.tsx` | Main page component with scroll tracking | React hooks (useState, useEffect) |
| `app/meet-the-team/components/Statue.tsx` | 3D polygon with camera effects | React hooks, scroll position prop |
| `app/globals.css` | Extended with fade-in animation | Tailwind CSS |
| `public/liquid-blobs-shadow.png` | 3D liquid blob asset | None |
| `public/miis-logo.svg` | Middlebury Institute logo | None |
| `public/meta-lab-logo.svg` | META Laboratory logo | None |

---

## Step-by-Step Implementation

### Step 1: Add Assets to Public Directory

Copy the three required image assets to the `public/` directory:

```bash
cp /path/to/liquid-blobs-shadow.png public/
cp /path/to/miis-logo.svg public/
cp /path/to/meta-lab-logo.svg public/
```

The `public/` directory in Next.js serves static files at the root URL. Files placed here can be referenced with absolute paths starting with `/`.

### Step 2: Extend Global Styles

Open `app/globals.css` and add the fade-in animation keyframes and utility class. This should be added after the existing Tailwind imports and theme configuration:

```css
/* Add after existing @theme inline block */

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fadeIn 2s ease-out forwards;
}
```

**Explanation:**
- The `@keyframes fadeIn` rule defines an animation that transitions opacity from 0 (invisible) to 1 (fully visible)
- The `.animate-fade-in` utility class applies this animation with a 2-second duration and ease-out timing function
- The `forwards` keyword ensures the element remains at 100% opacity after the animation completes

### Step 3: Create the Statue Component

Create the file `app/meet-the-team/components/Statue.tsx` with the following implementation. This component handles the interactive 3D polygon with camera effects.

**Key Features:**
- Mouse position tracking with normalized coordinates (-1 to 1 range)
- Scroll-based horizontal translation (moves right as user scrolls down)
- Smooth transitions using CSS transform
- Maximum offset of 75% screen width

See the attached `Statue.tsx` file for the complete implementation with detailed inline comments.

### Step 4: Create the Main Page Component

Create the file `app/meet-the-team/page.tsx` with the main page structure. This component orchestrates the entire page layout and manages scroll state.

**Key Features:**
- Scroll position tracking using window scroll event listener
- Fixed positioning for all UI elements (creates parallax effect)
- Institutional branding with logos at the top
- Fade-in animation for the main headline
- Navigation buttons at the bottom
- Corner markers for visual framing

See the attached `page.tsx` file for the complete implementation with detailed inline comments.

### Step 5: Update Navigation (Optional)

If you want to add navigation from your home page to the Meet the Team page, update your existing navigation component or add a link in `app/page.tsx`:

```tsx
import Link from 'next/link';

// Inside your component
<Link href="/meet-the-team">
  <button className="px-6 py-3 bg-black text-white rounded-full hover:bg-gray-800 transition-colors">
    Meet the Team
  </button>
</Link>
```

The Next.js `Link` component enables client-side navigation without full page reloads, providing a smooth user experience.

### Step 6: Test the Implementation

Start the development server and navigate to the new page:

```bash
npm run dev
# or
pnpm dev
```

Open your browser to `http://localhost:3000/meet-the-team` and verify the following:

**Visual Checks:**
- [ ] Logos appear at the top center
- [ ] "We are..." headline fades in over 2 seconds
- [ ] 3D liquid blob is visible on the right side
- [ ] Corner markers are visible in all four corners
- [ ] Navigation buttons are centered at the bottom

**Interaction Checks:**
- [ ] Moving the mouse causes the polygon to shift slightly
- [ ] Scrolling down moves the polygon to the right
- [ ] Scrolling up returns the polygon to its original position
- [ ] The polygon stops moving at 75% off-screen

---

## Component Details

### Statue Component Architecture

The `Statue` component implements a sophisticated camera effect system with two independent motion axes:

**Mouse-Based Camera Effect:**
The component tracks mouse position and converts it to normalized coordinates in the range of -1 to 1. This normalization ensures consistent behavior across different screen sizes. The mouse position is then multiplied by an intensity factor (15) to control the magnitude of movement, and further scaled by a movement multiplier (0.3) to create subtle motion.

```typescript
// Normalization formula
x = ((clientX / width) * 2 - 1) * 15
y = (-(clientY / height) * 2 + 1) * 15
```

**Scroll-Based Translation:**
The scroll offset is calculated as a linear function of the vertical scroll position, with a maximum threshold. When the user scrolls 800 pixels, the polygon reaches its maximum offset of 75% of the screen width. This creates a parallax effect where the polygon appears to move out of frame as the user explores content below.

```typescript
const maxScroll = 800;
const maxOffset = window.innerWidth * 0.75;
const scrollOffset = Math.min((scrollY / maxScroll) * maxOffset, maxOffset);
```

**Transform Composition:**
Both effects are combined using CSS transforms, with smooth transitions applied via the `transition-transform` utility class. The 200ms transition duration provides responsive feedback without feeling sluggish.

### Page Component Architecture

The main page component uses React hooks to manage scroll state and update child components accordingly. The `useEffect` hook attaches a scroll event listener when the component mounts and cleans it up on unmount to prevent memory leaks.

**Fixed Positioning Strategy:**
All elements use `fixed` positioning rather than `absolute`, which keeps them anchored to the viewport rather than the document. This creates the illusion of a static scene with moving elements, enhancing the 3D effect. The page container has a minimum height of 200vh (twice the viewport height) to enable scrolling.

**Z-Index Layering:**
Elements are carefully layered using z-index values:
- z-20: Corner markers (topmost)
- z-10: Text elements and navigation
- z-5: 3D polygon (background layer)

This ensures text remains readable while the polygon creates visual interest in the background.

---

## Styling and Animations

### Tailwind CSS Utilities

The implementation leverages Tailwind CSS for rapid styling with utility classes. Key utilities used include:

**Layout Utilities:**
- `fixed` - Positions elements relative to the viewport
- `top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2` - Centers elements both horizontally and vertically
- `min-h-[200vh]` - Sets minimum height to twice the viewport for scroll space

**Typography Utilities:**
- `text-[clamp(3rem,12vw,9rem)]` - Responsive font size that scales between 3rem and 9rem based on viewport width
- `font-black` - Maximum font weight (900)
- `leading-[0.9]` - Tight line height for compact text
- `tracking-tighter` - Reduced letter spacing

**Visual Effects:**
- `backdrop-blur-sm` - Applies a subtle blur to elements behind the navigation bar
- `bg-black/80` - Black background with 80% opacity
- `transition-colors` - Smooth color transitions on hover

### Custom Animations

The fade-in animation is implemented using CSS keyframes rather than JavaScript for better performance. CSS animations are hardware-accelerated by the browser, resulting in smoother transitions.

**Animation Timing:**
The 2-second duration was chosen to create a dramatic entrance without feeling sluggish. The `ease-out` timing function starts quickly and decelerates, which feels more natural than linear timing.

---

## Navigation Integration

### App Router Navigation

Next.js 16 uses the App Router, which provides several navigation options:

**Link Component (Recommended):**
```tsx
import Link from 'next/link';

<Link href="/meet-the-team">Meet the Team</Link>
```

**useRouter Hook (Programmatic):**
```tsx
'use client';
import { useRouter } from 'next/navigation';

const router = useRouter();
router.push('/meet-the-team');
```

### Navigation Bar Integration

To add the Meet the Team page to an existing navigation bar, create a shared navigation component:

```tsx
// app/components/Navigation.tsx
'use client';

import Link from 'next/link';

export default function Navigation() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-sm border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          LexiQ.ai
        </Link>
        <div className="flex gap-6">
          <Link href="/" className="hover:text-gray-600 transition-colors">
            Home
          </Link>
          <Link href="/meet-the-team" className="hover:text-gray-600 transition-colors">
            Meet the Team
          </Link>
        </div>
      </div>
    </nav>
  );
}
```

Then import this navigation component in your root layout (`app/layout.tsx`) to make it available across all pages.

---

## Testing and Verification

### Visual Testing Checklist

Perform the following visual checks across different browsers and devices:

**Desktop (Chrome, Firefox, Safari, Edge):**
- [ ] Logos are properly aligned and sized
- [ ] Text is readable against the background
- [ ] Polygon is positioned correctly on the right side
- [ ] Fade-in animation plays smoothly on page load
- [ ] Corner markers are visible and properly positioned

**Tablet (iPad, Android tablets):**
- [ ] Layout adapts to narrower viewports
- [ ] Touch scrolling works smoothly
- [ ] Polygon remains visible and doesn't overflow

**Mobile (iPhone, Android phones):**
- [ ] Text size is readable without zooming
- [ ] Logos scale appropriately
- [ ] Polygon is visible but doesn't dominate the screen

### Interaction Testing Checklist

Test all interactive features to ensure proper functionality:

**Mouse Interaction:**
- [ ] Moving mouse left/right causes polygon to shift horizontally
- [ ] Moving mouse up/down causes polygon to shift vertically
- [ ] Movement is smooth without jitter or lag
- [ ] Movement stops when mouse leaves the viewport

**Scroll Interaction:**
- [ ] Scrolling down moves polygon to the right
- [ ] Polygon stops at approximately 75% off-screen
- [ ] Scrolling up returns polygon to original position
- [ ] Scroll and mouse movements work independently

**Button Interaction:**
- [ ] Navigation buttons respond to hover states
- [ ] Clicking buttons shows appropriate feedback
- [ ] Buttons remain accessible and clickable

### Performance Testing

Monitor performance metrics to ensure smooth animations:

**Frame Rate:**
Use browser DevTools Performance panel to record a session. Target 60 FPS during animations and interactions. If frame rate drops below 30 FPS, consider optimizing:
- Reduce image file sizes
- Simplify CSS transforms
- Use `will-change` CSS property for animated elements

**Memory Usage:**
Check for memory leaks by monitoring the Memory panel during extended use. The scroll event listener should be properly cleaned up when the component unmounts.

---

## Troubleshooting

### Common Issues and Solutions

**Issue: Polygon image not displaying**

**Symptoms:** The 3D liquid blob is invisible or shows a broken image icon.

**Solutions:**
1. Verify the image file exists in `public/liquid-blobs-shadow.png`
2. Check the file name matches exactly (case-sensitive)
3. Ensure the image path in the component is `/liquid-blobs-shadow.png` (starts with `/`)
4. Clear browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
5. Check browser console for 404 errors

**Issue: Fade-in animation not working**

**Symptoms:** The "We are..." headline appears instantly without fading in.

**Solutions:**
1. Verify the CSS keyframes are added to `app/globals.css`
2. Check that the `.animate-fade-in` class is applied to the headline element
3. Ensure there are no CSS conflicts overriding the animation
4. Test in a different browser to rule out browser-specific issues

**Issue: Scroll effect not working**

**Symptoms:** The polygon doesn't move when scrolling.

**Solutions:**
1. Verify the page has sufficient height to scroll (min-h-[200vh])
2. Check that the `scrollY` state is being updated in the page component
3. Ensure the `Statue` component is receiving the `scrollY` prop
4. Add console.log statements to debug the scroll offset calculation
5. Check that the polygon's transform style is being applied correctly

**Issue: Mouse tracking is jittery or laggy**

**Symptoms:** The polygon movement is not smooth when moving the mouse.

**Solutions:**
1. Reduce the intensity multiplier in the mouse position calculation
2. Increase the transition duration to smooth out rapid movements
3. Implement throttling or debouncing on the mousemove event listener
4. Check for other JavaScript running on the page that might block the main thread

**Issue: TypeScript errors**

**Symptoms:** TypeScript compiler shows errors about missing types or props.

**Solutions:**
1. Ensure the `StatueProps` interface is properly defined
2. Verify that all required props are passed from parent to child components
3. Run `npm install @types/react @types/node` to ensure type definitions are installed
4. Check that your `tsconfig.json` is properly configured for Next.js

**Issue: Logos not appearing**

**Symptoms:** The Middlebury Institute and META Lab logos are missing.

**Solutions:**
1. Verify both logo files exist in the `public/` directory
2. Check file names match exactly: `miis-logo.svg` and `meta-lab-logo.svg`
3. Ensure image paths in the component start with `/`
4. Check image file formats are supported (PNG, JPG, SVG)
5. Verify images are not corrupted by opening them directly in a browser

---

## Advanced Customization

### Adjusting Animation Timing

To modify the fade-in animation duration, edit the animation property in `app/globals.css`:

```css
.animate-fade-in {
  animation: fadeIn 3s ease-out forwards; /* Changed from 2s to 3s */
}
```

### Modifying Scroll Sensitivity

To change how far the user must scroll before the polygon reaches maximum offset, adjust the `maxScroll` value in `Statue.tsx`:

```typescript
const maxScroll = 1200; // Increased from 800 for slower movement
```

### Changing Polygon Size

To adjust the size of the 3D liquid blob, modify the width and height in the inline styles:

```typescript
style={{
  transform: `translate(${mousePos.x * 0.3 + scrollOffset}px, ${mousePos.y * 0.3}px)`,
  width: '900px',  // Increased from 700px
  height: '900px', // Increased from 700px
  marginLeft: '150px',
}}
```

### Adding More Interactive Elements

To add additional interactive elements that respond to the camera effect, create new components following the same pattern as `Statue`. Pass the `scrollY` and mouse position as props, and apply transforms based on those values.

---

## Conclusion

This guide provides a comprehensive walkthrough for implementing the Meet the Team page in the lexiq.ai repository. By following these steps and understanding the underlying architecture, you can successfully integrate this interactive 3D experience into your Next.js application.

The implementation demonstrates several advanced web development techniques including scroll-based animations, mouse tracking, parallax effects, and responsive design. These patterns can be adapted and extended for other pages and features in your application.

For additional support or questions, refer to the Next.js documentation or the attached component files with detailed inline comments.

---

## References

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Hooks Reference](https://react.dev/reference/react)
- [CSS Animations Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
