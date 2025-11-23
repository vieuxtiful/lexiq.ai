declare module "velocity-animate" {
  export type VelocityEasing = string | number[];

  export type VelocityCommand = "stop" | "finish";

  export interface VelocityOptions {
    duration?: number | string;
    easing?: VelocityEasing;
    delay?: number;
    loop?: boolean | number;
    complete?: () => void;
    begin?: () => void;
  }

  export interface VelocityFn {
    (elements: Element | Element[] | NodeListOf<Element>, properties: Record<string, number | string>, options?: VelocityOptions): void;
    (elements: Element | Element[] | NodeListOf<Element>, command: VelocityCommand, queue?: boolean): void;
  }

  const Velocity: VelocityFn;
  export default Velocity;
}
