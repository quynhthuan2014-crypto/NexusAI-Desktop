export {};
declare global {
  interface Window {
    nexus: {
      systemInfo: () => Promise<{ hostname: string; platform: string; arch: string; release: string; cpus: number; memoryGB: number }>;
      openTextFile: () => Promise<{ name: string; path: string; content: string } | null>;
      openExternal: (url: string) => Promise<boolean>;
    };
  }
}
