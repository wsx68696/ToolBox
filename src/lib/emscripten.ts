/** Load an Emscripten ES-module glue file served from /public/wasm. */

export type EmscriptenModule = {
  ccall: (
    ident: string,
    returnType: string | null,
    argTypes: string[],
    args: unknown[],
  ) => unknown;
  HEAPU8: Uint8Array;
};

const cache = new Map<string, Promise<EmscriptenModule>>();

/**
 * Dynamically import a prebuilt Emscripten glue script.
 * The corresponding .wasm must already be at the path baked into the glue
 * (we patch those paths to /wasm/<name>.wasm under public/wasm/).
 */
export function loadEmscriptenModule(scriptUrl: string): Promise<EmscriptenModule> {
  const existing = cache.get(scriptUrl);
  if (existing) return existing;

  const promise = import(/* @vite-ignore */ scriptUrl).then((mod) => {
    const exported = (mod as { default?: unknown }).default ?? mod;
    // MODULARIZE builds export a factory; non-MODULARIZE export the Module object.
    if (typeof exported === 'function') {
      return Promise.resolve(
        (exported as (cfg?: object) => EmscriptenModule | Promise<EmscriptenModule>)({
          locateFile: (path: string) =>
            path.startsWith('/') ? path : `/wasm/${path.replace(/^\.?\/?wasm\//, '')}`,
        }),
      ).then((instance) => instance as EmscriptenModule);
    }
    return exported as EmscriptenModule;
  });

  cache.set(scriptUrl, promise);
  return promise;
}
