declare module 'react' {
  export type ReactNode = any;
  export type ReactElement = any;
  export type FormEvent<T = any> = any;
  export type MouseEvent<T = any> = any;
  export type KeyboardEvent<T = any> = any;
  export type Dispatch<T> = (value: T | ((prev: T) => T)) => void;
  export function useState<T>(initialState: T | (() => T)): [T, Dispatch<T>];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useMemo<T>(factory: () => T, deps: any[]): T;
}

declare module 'next' {
  export interface Metadata {
    [key: string]: any;
  }
}

declare module 'next/link' {
  const Link: any;
  export default Link;
}

declare module 'next/navigation' {
  export function usePathname(): string;
}

declare module 'next/server' {
  export class NextResponse {
    static json(data: any, init?: any): any;
  }
}

declare module 'next/headers' {
  export function cookies(): Promise<{
    get(name: string): { value: string } | undefined;
    set(name: string, value: string, options?: any): void;
    delete(name: string): void;
  }>;
}

declare module 'server-only' {}

declare const process: { env: Record<string, string | undefined> };
declare const Buffer: {
  from(input: string, encoding?: string): { toString(encoding?: string): string };
};

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}
