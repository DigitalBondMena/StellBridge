// Global type declarations for libraries

declare module 'locomotive-scroll' {
  interface LocomotiveScrollOptions {
    el?: Element;
    smooth?: boolean;
    multiplier?: number;
    class?: string;
    getDirection?: boolean;
    getSpeed?: boolean;
    repeat?: boolean;
    reloadOnContextChange?: boolean;
    smoothMobile?: boolean;
    smartphone?: {
      smooth?: boolean;
      breakpoint?: number;
    };
    tablet?: {
      smooth?: boolean;
      breakpoint?: number;
    };
  }

  interface LocomotiveScrollInstance {
    init(): void;
    start(): void;
    stop(): void;
    destroy(): void;
    update(): void;
    scrollTo(target: string | Element | number, options?: any): void;
    on(event: string, callback: Function): void;
    off(event: string, callback?: Function): void;
  }

  export default class LocomotiveScroll implements LocomotiveScrollInstance {
    constructor(options?: LocomotiveScrollOptions);
    init(): void;
    start(): void;
    stop(): void;
    destroy(): void;
    update(): void;
    scrollTo(target: string | Element | number, options?: any): void;
    on(event: string, callback: Function): void;
    off(event: string, callback?: Function): void;
  }
}
