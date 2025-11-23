declare module "scrollreveal" {
  export type ScrollRevealEasing =
    | "linear"
    | "ease"
    | "ease-in"
    | "ease-out"
    | "ease-in-out"
    | "ease-in-quad"
    | "ease-in-cubic"
    | "ease-in-quart"
    | "ease-in-quint"
    | "ease-in-sine"
    | "ease-in-expo"
    | "ease-in-circ"
    | "ease-in-back"
    | "ease-out-quad"
    | "ease-out-cubic"
    | "ease-out-quart"
    | "ease-out-quint"
    | "ease-out-sine"
    | "ease-out-expo"
    | "ease-out-circ"
    | "ease-out-back"
    | "ease-in-out-quad"
    | "ease-in-out-cubic"
    | "ease-in-out-quart"
    | "ease-in-out-quint"
    | "ease-in-out-sine"
    | "ease-in-out-expo"
    | "ease-in-out-circ"
    | "ease-in-out-back"
    | (string & {});

  export interface ScrollRevealOptions {
    delay?: number;
    distance?: string;
    duration?: number;
    easing?: ScrollRevealEasing;
    interval?: number;
    origin?: "top" | "right" | "bottom" | "left";
    opacity?: number;
    rotate?: { x?: number; y?: number; z?: number };
    scale?: number;
    cleanup?: boolean;
    reset?: boolean;
    container?: HTMLElement | string;
    desktop?: boolean;
    mobile?: boolean;
    viewFactor?: number;
    viewOffset?: { top?: number; right?: number; bottom?: number; left?: number };
  }

  export interface ScrollRevealObject {
    reveal(target: string | Element | Element[], options?: ScrollRevealOptions): ScrollRevealObject;
    clean(target?: string | Element | Element[]): ScrollRevealObject;
    destroy(): ScrollRevealObject;
  }

  export default function ScrollReveal(options?: ScrollRevealOptions): ScrollRevealObject;
}
