/// <reference types="vite/client" />

declare module '*.css';

declare module '*.module.css' {
  const classes: Record<string, string>;
  export default classes;
}

declare module '*.json' {
  const value: unknown;
  export default value;
}
