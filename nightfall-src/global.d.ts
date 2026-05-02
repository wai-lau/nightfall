declare module "*.glb" {
  const url: string;
  export default url;
}

declare function require(path: string): string;
