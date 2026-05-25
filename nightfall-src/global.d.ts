declare module "*.glb" {
  const url: string;
  export default url;
}

declare function require(path: string): string;

interface Window {
  __nfProgress?: (kind: "fonts" | "audio" | "images", loaded: number, total: number) => void;
}
