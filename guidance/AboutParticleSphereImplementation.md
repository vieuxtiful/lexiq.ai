// Particle Sphere - About Page //

Sphere Position:
@ The About page overlay container to right-[20vw], so the canvas slides closer to center without covering copy.

Code: app/about/aboutpage.tsx around the <AboutParticleSphere /> wrapper @app/about/aboutpage.tsx#102-115.

If you’d like it even further left/right, tweak that Tailwind class (e.g., right-[15vw], right-48, etc.) or add translate-x-* utilities.

Where to tweak the CSS / styling:
Layout & positioning: controlled by the Tailwind classes on the fixed <div> (same file line range above).
Canvas size: change the className="h-full w-full" on the <canvas> inside AboutParticleSphere @components/animations/AboutParticleSphere.tsx#200-207. 
You can define a custom class in your stylesheet if you prefer more complex styling; just pass it via a className prop and apply it to the wrapping <div> or <canvas>.

Reducing particle dispersion:
In AboutParticleSphere.tsx, dispersion is mainly affected by:

maxAcceleration and startVelocity in CONFIG @components/animations/AboutParticleSphere.tsx#30-41
Lower these values to keep particles tighter to the surface. Example:
ts
maxAcceleration: { x: 0.06, y: 0.06, z: 0.06 },
startVelocity: { x: 0.0008, y: 0.0008, z: 0.0008 },
Lifetime timings (growDuration, waitDuration, shrinkDuration) @same section
Extending waitDuration keeps particles on the shell longer before they drift.
Respawn behavior inside updateParticle: particles only start accelerating away after grow + wait. You could add a damping factor so their velocities decay, limiting how far they escape.
Hard cap on radius (optional): before updating position, clamp Math.sqrt(x^2 + y^2 + z^2) to a fixed max so particles never move beyond a shell thickness.