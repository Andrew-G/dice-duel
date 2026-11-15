// Lets TypeScript understand the .mp3/.wav/.ogg imports handled by the
// webpack asset rule in next.config.ts.
declare module "*.mp3" {
  const src: string;
  export default src;
}
declare module "*.wav" {
  const src: string;
  export default src;
}
declare module "*.ogg" {
  const src: string;
  export default src;
}
