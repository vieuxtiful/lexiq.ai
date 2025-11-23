declare module "locomotive-scroll" {
  import type { Options as LocoOptions } from "locomotive-scroll/dist/types/";

  export interface Scroll extends Record<string, unknown> {
    y: number;
    x: number;
    limit: { x: number; y: number };
  }

  export interface ScrollInstance {
    scroll: Scroll;
  }

  export interface LocomotiveInstance {
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
    update(): void;
    destroy(): void;
    scrollTo(
      target: number | string | HTMLElement,
      options?: { offset?: number; duration?: number; disableLerp?: boolean }
    ): void;
    scroll: ScrollInstance;
  }

  export default class LocomotiveScroll implements LocomotiveInstance {
    constructor(options?: LocoOptions);
    on(event: string, callback: (...args: unknown[]) => void): void;
    off(event: string, callback: (...args: unknown[]) => void): void;
    update(): void;
    destroy(): void;
    scrollTo(
      target: number | string | HTMLElement,
      options?: { offset?: number; duration?: number; disableLerp?: boolean }
    ): void;
    scroll: ScrollInstance;
  }
}
